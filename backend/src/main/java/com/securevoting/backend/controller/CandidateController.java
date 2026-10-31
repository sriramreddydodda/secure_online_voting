package com.securevoting.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.securevoting.backend.entity.Candidate;
import com.securevoting.backend.service.CandidateService;

@RestController
@RequestMapping("/api/candidates")
@CrossOrigin(origins = "*")
public class CandidateController {

    private final CandidateService candidateService;

    public CandidateController(CandidateService candidateService) {
        this.candidateService = candidateService;
    }

    public static class CandidateRequest {
        private String name;
        private String party;
        private String manifesto;
        private Long electionId;

        public CandidateRequest() {
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getParty() {
            return party;
        }

        public void setParty(String party) {
            this.party = party;
        }

        public String getManifesto() {
            return manifesto;
        }

        public void setManifesto(String manifesto) {
            this.manifesto = manifesto;
        }

        public Long getElectionId() {
            return electionId;
        }

        public void setElectionId(Long electionId) {
            this.electionId = electionId;
        }
    }

    @PostMapping
    public ResponseEntity<?> createCandidate(
            @RequestBody CandidateRequest request) {
        try {
            Candidate candidate = candidateService.createCandidate(
                    request.getName(),
                    request.getParty(),
                    request.getManifesto(),
                    request.getElectionId());

            return ResponseEntity.status(HttpStatus.CREATED).body(candidate);
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", exception.getMessage()));
        } catch (RuntimeException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", exception.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Candidate>> getAllCandidates() {
        return ResponseEntity.ok(
                candidateService.getAllCandidates());
    }

    @GetMapping("/election/{electionId}")
    public ResponseEntity<?> getCandidatesByElection(
            @PathVariable Long electionId) {
        try {
            return ResponseEntity.ok(
                    candidateService.getCandidatesByElection(electionId));
        } catch (RuntimeException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", exception.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCandidateById(
            @PathVariable Long id) {
        try {
            return ResponseEntity.ok(
                    candidateService.getCandidateById(id));
        } catch (RuntimeException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", exception.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCandidate(
            @PathVariable Long id,
            @RequestBody CandidateRequest request) {
        try {
            Candidate candidate = candidateService.updateCandidate(
                    id,
                    request.getName(),
                    request.getParty(),
                    request.getManifesto(),
                    request.getElectionId());

            return ResponseEntity.ok(candidate);
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", exception.getMessage()));
        } catch (RuntimeException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", exception.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCandidate(
            @PathVariable Long id) {
        try {
            candidateService.deleteCandidate(id);

            return ResponseEntity.ok(
                    Map.of("message", "Candidate deleted successfully"));
        } catch (RuntimeException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", exception.getMessage()));
        }
    }
}