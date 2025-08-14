package com.example.dhsrd.web;

import com.example.dhsrd.model.SrdType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.List;

public record SearchDTO(
        String q,
        List<SrdType> types,
        Integer levelMin,
        Integer levelMax,
        @Min(0) Integer from,
        @Min(1) @Max(100) Integer size,
        Boolean fuzzy
) {}
