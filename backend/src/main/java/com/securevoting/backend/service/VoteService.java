package com.securevoting.backend.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.securevoting.backend.entity.Candidate;
import com.securevoting.backend.entity.Election;
import com.securevoting.backend.entity.User;
import com.securevoting.backend.entity.Vote;

import com.securevoting.backend.repository.CandidateRepository;
import com.securevoting.backend.repository.ElectionRepository;
import com.securevoting.backend.repository.VoteRepository;

@Service
@Transactional
public class VoteService {

    private final VoteRepository voteRepository;
    private final ElectionRepository electionRepository;
    private final CandidateRepository candidateRepository;

    public VoteService(
            VoteRepository voteRepository,
            ElectionRepository electionRepository,
            CandidateRepository candidateRepository) {

        this.voteRepository = voteRepository;
        this.electionRepository = electionRepository;
        this.candidateRepository = candidateRepository;
    }

    // SUBMIT VOTE
    public Vote castVote(
            User currentUser,
            Long electionId,
            Long candidateId) {

        if (currentUser == null) {
            throw new IllegalArgumentException(
                "User must be logged in"
            );
        }

        if (electionId == null || candidateId == null) {
            throw new IllegalArgumentException(
                "Election ID and Candidate ID are required"
            );
        }

        Election election = electionRepository.findById(electionId)
            .orElseThrow(() ->
                new IllegalArgumentException("Election not found")
            );

        Candidate candidate = candidateRepository.findById(candidateId)
            .orElseThrow(() ->
                new IllegalArgumentException("Candidate not found")
            );

        if (!Boolean.TRUE.equals(election.isActive())) {
            throw new IllegalStateException(
                "This election is not active"
            );
        }

        if (!"ACTIVE".equalsIgnoreCase(election.getStatus())) {
            throw new IllegalStateException(
                "Voting is not currently open for this election"
            );
        }

        if (candidate.getElection() == null ||
                !candidate.getElection().getId().equals(electionId)) {
            throw new IllegalArgumentException(
                "Candidate does not belong to this election"
            );
        }

        boolean alreadyVoted =
            voteRepository.existsByUser_UsernameAndElection_Id(
                currentUser.getUsername(),
                electionId
            );

        if (alreadyVoted) {
            throw new IllegalStateException(
                "You have already voted in this election"
            );
        }

        Vote vote = new Vote();
        vote.setUser(currentUser);
        vote.setElection(election);
        vote.setCandidate(candidate);

        return voteRepository.saveAndFlush(vote);
    }

    // GET ELECTION RESULTS
    @Transactional(readOnly = true)
    public Map<String, Object> getResults(Long electionId) {

        Election election = electionRepository.findById(electionId)
            .orElseThrow(() ->
                new IllegalArgumentException("Election not found")
            );

        List<Candidate> candidates =
            candidateRepository.findByElection_Id(electionId);

        List<Map<String, Object>> candidateResults =
            new ArrayList<>();

        long totalVotes = voteRepository.countByElection_Id(electionId);

        for (Candidate candidate : candidates) {

            Map<String, Object> result = new LinkedHashMap<>();

            long votes = voteRepository.countByCandidate_Id(
                candidate.getId()
            );

            double percentage = totalVotes == 0
                ? 0.0
                : (votes * 100.0) / totalVotes;

            result.put("candidateId", candidate.getId());
            result.put("candidateName", candidate.getName());
            result.put("party", candidate.getParty());
            result.put("votes", votes);
            result.put("percentage",
                Math.round(percentage * 100.0) / 100.0);

            candidateResults.add(result);
        }

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("electionId", election.getId());
        response.put("electionTitle", election.getTitle());
        response.put("totalVotes", totalVotes);
        response.put("candidates", candidateResults);

        return response;
    }
}