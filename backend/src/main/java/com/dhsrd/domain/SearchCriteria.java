package com.dhsrd.domain;

import com.dhsrd.model.SrdType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.util.List;

public record SearchCriteria(
        String q,
        List<SrdType> types,
        Integer levelMin,
        Integer levelMax,
        @Min(0) Integer from,
        @Min(1) @Max(300) Integer size,
        Boolean fuzzy
) {}
