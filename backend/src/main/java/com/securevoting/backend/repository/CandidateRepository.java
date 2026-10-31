package com.securevoting.backend.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.securevoting.backend.entity.Candidate;

public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    List<Candidate> findByElection_Id(Long electionId);
}