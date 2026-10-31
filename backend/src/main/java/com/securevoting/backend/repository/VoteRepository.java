package com.securevoting.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.securevoting.backend.entity.Vote;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {

    boolean existsByUser_UsernameAndElection_Id(
        String username,
        Long electionId
    );

    long countByElection_Id(Long electionId);

    long countByCandidate_Id(Long candidateId);

    List<Vote> findByElection_Id(Long electionId);
}