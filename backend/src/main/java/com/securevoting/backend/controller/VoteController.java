package com.securevoting.backend.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.securevoting.backend.entity.User;
import com.securevoting.backend.repository.UserRepository;
import com.securevoting.backend.service.VoteService;

@RestController
@RequestMapping("/api/votes")
@CrossOrigin(
    origins = {
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    },
    allowCredentials = "true"
)
public class VoteController {

    private final VoteService voteService;
    private final UserRepository userRepository;

    public VoteController(
            VoteService voteService,
            UserRepository userRepository) {
        this.voteService = voteService;
        this.userRepository = userRepository;
    }

    public static class VoteRequest {
        private Long electionId;
        private Long candidateId;

        public Long getElectionId() {
            return electionId;
        }

        public void setElectionId(Long electionId) {
            this.electionId = electionId;
        }

        public Long getCandidateId() {
            return candidateId;
        }

        public void setCandidateId(Long candidateId) {
            this.candidateId = candidateId;
        }
    }

    @PostMapping
    public ResponseEntity<?> castVote(
            @RequestBody VoteRequest request,
            Authentication authentication) {

        try {
            if (authentication == null ||
                    !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Please log in first"));
            }

            if (request.getElectionId() == null ||
                    request.getCandidateId() == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of(
                        "error",
                        "Election ID and Candidate ID are required"
                    ));
            }

            User user = userRepository
                .findByUsername(authentication.getName())
                .orElseThrow(() ->
                    new IllegalArgumentException("User not found")
                );

            voteService.castVote(
                user,
                request.getElectionId(),
                request.getCandidateId()
            );

            return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                    "message",
                    "Vote submitted successfully"
                ));

        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", e.getMessage()));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/results/{electionId}")
    public ResponseEntity<?> getResults(
            @PathVariable Long electionId) {

        try {
            return ResponseEntity.ok(
                voteService.getResults(electionId)
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }
}