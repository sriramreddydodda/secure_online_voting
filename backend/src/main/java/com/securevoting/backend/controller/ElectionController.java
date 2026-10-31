package com.securevoting.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.securevoting.backend.entity.Election;
import com.securevoting.backend.service.ElectionService;

@RestController
@RequestMapping("/api/elections")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174"
})
public class ElectionController {

    private final ElectionService electionService;

    public ElectionController(ElectionService electionService) {
        this.electionService = electionService;
    }

    // Create election
    @PostMapping
    public ResponseEntity<Election> createElection(
            @RequestBody Election election) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(electionService.createElection(election));
    }

    // Get all elections
    @GetMapping
    public ResponseEntity<List<Election>> getAllElections() {
        return ResponseEntity.ok(electionService.getAllElections());
    }

    // Get election by ID
    @GetMapping("/{id}")
    public ResponseEntity<Election> getElectionById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                electionService.getElectionById(id));
    }

    // Update election
    @PutMapping("/{id}")
    public ResponseEntity<Election> updateElection(
            @PathVariable Long id,
            @RequestBody Election election) {

        return ResponseEntity.ok(
                electionService.updateElection(id, election));
    }

    // Delete election
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteElection(
            @PathVariable Long id) {

        electionService.deleteElection(id);

        return ResponseEntity.ok(
                Map.of("message", "Election deleted successfully"));
    }

    // Activate election
    @PutMapping("/{id}/activate")
    public ResponseEntity<Election> activateElection(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                electionService.activateElection(id));
    }

    // Deactivate election
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<Election> deactivateElection(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                electionService.deactivateElection(id));
    }

    // Handle validation errors
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleValidation(
            IllegalArgumentException exception) {

        return ResponseEntity.badRequest().body(
                Map.of("error", exception.getMessage()));
    }

    // Handle missing elections
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(
            RuntimeException exception) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("error", exception.getMessage()));
    }
}