package com.securevoting.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.securevoting.backend.entity.Candidate;
import com.securevoting.backend.entity.Election;
import com.securevoting.backend.repository.CandidateRepository;
import com.securevoting.backend.repository.ElectionRepository;

@Service
@Transactional
public class CandidateService {

    private final CandidateRepository candidateRepository;
    private final ElectionRepository electionRepository;

    public CandidateService(
            CandidateRepository candidateRepository,
            ElectionRepository electionRepository) {
        this.candidateRepository = candidateRepository;
        this.electionRepository = electionRepository;
    }

    @Transactional(readOnly = true)
    public List<Candidate> getAllCandidates() {
        return candidateRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Candidate> getCandidatesByElection(Long electionId) {
        if (electionId == null) {
            throw new IllegalArgumentException("Election ID is required");
        }

        return candidateRepository.findByElection_Id(electionId);
    }

    @Transactional(readOnly = true)
    public Candidate getCandidateById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Candidate ID is required");
        }

        return candidateRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Candidate not found: " + id));
    }

    public Candidate createCandidate(
            String name,
            String party,
            String manifesto,
            Long electionId) {

        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Candidate name is required");
        }

        if (electionId == null) {
            throw new IllegalArgumentException("Election ID is required");
        }

        Election election = electionRepository.findById(electionId)
                .orElseThrow(() ->
                        new RuntimeException("Election not found: " + electionId));

        Candidate candidate = new Candidate();
        candidate.setName(name.trim());
        candidate.setParty(party);
        candidate.setManifesto(manifesto);
        candidate.setElection(election);

        return candidateRepository.save(candidate);
    }

    public Candidate updateCandidate(
            Long id,
            String name,
            String party,
            String manifesto,
            Long electionId) {

        if (id == null) {
            throw new IllegalArgumentException("Candidate ID is required");
        }

        if (electionId == null) {
            throw new IllegalArgumentException("Election ID is required");
        }

        Candidate candidate = getCandidateById(id);

        Election election = electionRepository.findById(electionId)
                .orElseThrow(() ->
                        new RuntimeException("Election not found: " + electionId));

        candidate.setName(name);
        candidate.setParty(party);
        candidate.setManifesto(manifesto);
        candidate.setElection(election);

        return candidateRepository.save(candidate);
    }

    public void deleteCandidate(Long id) {
        Candidate candidate = getCandidateById(id);
        candidateRepository.delete(candidate);
    }
}