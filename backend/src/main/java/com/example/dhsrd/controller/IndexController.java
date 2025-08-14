package com.example.dhsrd.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Controller;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

@Controller
public class IndexController {

    private List<String> ITEMS;

    @PostConstruct
    public void init() throws Exception {
        var path = Path.of("src/main/resources/srd.json");
        if (Files.exists(path)) {
            var mapper = new ObjectMapper();
            var list = mapper.readValue(Files.readString(path), new TypeReference<List<Map<String,Object>>>(){});
            ITEMS = list.stream()
                    .map(m -> (String)m.getOrDefault("title",""))
                    .filter(s -> !s.isBlank())
                    .toList();
        }
    }

    // Add getters or other methods as needed to use ITEMS
}