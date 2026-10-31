package com.securevoting.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.securevoting.backend.entity.Election;
import com.securevoting.backend.repository.ElectionRepository;

@Service
@Transactional
public class ElectionService {

    private final ElectionRepository electionRepository;

    public ElectionService(ElectionRepository electionRepository) {
        this.electionRepository = electionRepository;
    }

    // Create election
    public Election createElection(Election election) {

        if (election == null) {
            throw new IllegalArgumentException("Election data is required");
        }

        if (election.getTitle() == null
                || election.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Election title is required");
        }

        election.setTitle(election.getTitle().trim());

        if (election.getTitle().length() > 150) {
            throw new IllegalArgumentException(
                    "Election title cannot exceed 150 characters");
        }

        if (election.getDescription() != null
                && election.getDescription().length() > 1000) {
            throw new IllegalArgumentException(
                    "Description cannot exceed 1000 characters");
        }

        if (election.getStartDate() != null
                && election.getEndDate() != null
                && !election.getEndDate().isAfter(election.getStartDate())) {
            throw new IllegalArgumentException(
                    "End date must be after start date");
        }

        if (election.getStartDate() != null
                && election.getStartDate().isAfter(LocalDateTime.now())) {
            election.setStatus("UPCOMING");
        } else {
            election.setStatus("ACTIVE");
        }

        election.setActive(true);

        return electionRepository.save(election);
    }

    // Get all elections
    @Transactional(readOnly = true)
    public List<Election> getAllElections() {
        return electionRepository.findAll();
    }

    // Get election by ID
    @Transactional(readOnly = true)
    public Election getElectionById(Long id) {
        return electionRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Election not found: " + id));
    }

    // Update election
    public Election updateElection(Long id, Election updatedElection) {

        if (updatedElection == null) {
            throw new IllegalArgumentException("Election data is required");
        }

        Election election = getElectionById(id);

        if (updatedElection.getTitle() == null
                || updatedElection.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Election title is required");
        }

        if (updatedElection.getTitle().trim().length() > 150) {
            throw new IllegalArgumentException(
                    "Election title cannot exceed 150 characters");
        }

        if (updatedElection.getDescription() != null
                && updatedElection.getDescription().length() > 1000) {
            throw new IllegalArgumentException(
                    "Description cannot exceed 1000 characters");
        }

        LocalDateTime start = updatedElection.getStartDate();
        LocalDateTime end = updatedElection.getEndDate();

        if (start != null && end != null && !end.isAfter(start)) {
            throw new IllegalArgumentException(
                    "End date must be after start date");
        }

        election.setTitle(updatedElection.getTitle().trim());
        election.setDescription(updatedElection.getDescription());
        election.setStartDate(start);
        election.setEndDate(end);
        election.setActive(updatedElection.isActive());

        return electionRepository.save(election);
    }

    // Delete election
    public void deleteElection(Long id) {

        if (!electionRepository.existsById(id)) {
            throw new RuntimeException("Election not found: " + id);
        }

        electionRepository.deleteById(id);
    }

    // Activate election
    public Election activateElection(Long id) {
        Election election = getElectionById(id);
        election.setActive(true);
        election.setStatus("ACTIVE");
        return electionRepository.save(election);
    }

    // Deactivate election
    public Election deactivateElection(Long id) {
        Election election = getElectionById(id);
        election.setActive(false);
        election.setStatus("INACTIVE");
        return electionRepository.save(election);
    }
}