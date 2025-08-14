package com.example.dhsrd.repo;

import com.example.dhsrd.model.SrdItem;
import com.example.dhsrd.model.SrdType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SrdItemRepository extends JpaRepository<SrdItem, Long> {
    Optional<SrdItem> findBySlug(String slug);
    List<SrdItem> findByType(SrdType type);
}
