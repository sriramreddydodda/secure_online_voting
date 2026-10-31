package com.securevoting.backend.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.securevoting.backend.entity.User;
import com.securevoting.backend.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User register(
            String username,
            String password,
            String fullName,
            String role) {

        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException(
                    "Username is required");
        }

        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException(
                    "Password is required");
        }

        if (fullName == null || fullName.isBlank()) {
            throw new IllegalArgumentException(
                    "Full name is required");
        }

        username = username.trim();
        fullName = fullName.trim();

        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException(
                    "Username already exists");
        }

        // Public registration must not grant administrator access.
        String safeRole = "VOTER";

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setFullName(fullName);
        user.setRole(safeRole);

        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public User findByUsername(String username) {
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Username is required");
        }

        return userRepository.findByUsername(username.trim())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found"));
    }

    @Transactional(readOnly = true)
    public User login(String username, String password) {

        if (username == null || username.isBlank()
                || password == null || password.isBlank()) {
            throw new IllegalArgumentException(
                    "Username and password are required");
        }

        User user = userRepository
                .findByUsername(username.trim())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid username or password"));

        if (!passwordEncoder.matches(
                password, user.getPassword())) {
            throw new IllegalArgumentException(
                    "Invalid username or password");
        }

        return user;
    }
}