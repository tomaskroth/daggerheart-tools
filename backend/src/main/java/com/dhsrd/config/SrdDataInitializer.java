package com.dhsrd.config;

import com.dhsrd.domain.SrdService;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

@Component
public class SrdDataInitializer {

    private final SrdService srdService;

    public SrdDataInitializer(SrdService srdService) {
        this.srdService = srdService;
    }

    @PostConstruct
    public void loadInitialData() {
        srdService.loadInitialData();
    }
}
