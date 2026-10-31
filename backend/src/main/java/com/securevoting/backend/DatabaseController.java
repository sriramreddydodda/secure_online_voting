package com.securevoting.backend;

import java.sql.Connection;
import java.sql.DriverManager;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DatabaseController {

    @Value("${spring.datasource.url}")
    private String databaseUrl;

    @Value("${spring.datasource.username}")
    private String databaseUsername;

    @Value("${spring.datasource.password}")
    private String databasePassword;

    @GetMapping("/api/health")
    public ResponseEntity<Map<String, String>> health() {

        Map<String, String> response = new LinkedHashMap<>();

        try (Connection connection = DriverManager.getConnection(
                databaseUrl, databaseUsername, databasePassword)) {

            if (connection.isValid(3)) {
                response.put("status", "SUCCESS");
                response.put("message", "Database connection successful");
                response.put("database", "secure_voting");

                return ResponseEntity.ok(response);
            }

            response.put("status", "ERROR");
            response.put("message", "Database connection is invalid");

            return ResponseEntity.internalServerError().body(response);

        } catch (Exception e) {
            response.put("status", "ERROR");
            response.put("message", "Database connection failed");

            return ResponseEntity.internalServerError().body(response);
        }
    }
}