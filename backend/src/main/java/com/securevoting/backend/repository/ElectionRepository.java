package com.securevoting.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.securevoting.backend.entity.Election;

@Repository
public interface ElectionRepository extends JpaRepository<Election, Long> {
}