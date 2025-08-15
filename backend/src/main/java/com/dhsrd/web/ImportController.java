package com.dhsrd.web;

import com.dhsrd.model.SrdItem;
import com.dhsrd.repo.SrdItemRepository;
import com.dhsrd.search.LuceneService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;

import java.io.InputStream;
import java.util.List;
import java.util.logging.Logger;

@Component
public class ImportController {
    private final SrdItemRepository repo;
    private final LuceneService lucene;
    private final ObjectMapper om = new ObjectMapper();

    public ImportController(SrdItemRepository repo, LuceneService lucene) {
        this.repo = repo;
        this.lucene = lucene;
    }

    /** Import SRD from a JSON array on classpath: /srd.json */
    @PostConstruct
    public void importFromClasspath() throws Exception {
        if (!lucene.isEmpty()) {
            System.out.println("Lucene index is not empty, skipping import.");
            return;
        }
        try (InputStream is = getClass().getResourceAsStream("/srd.json")) {
            if (is == null) return;
            List<SrdItem> items = om.readValue(is, new TypeReference<>() {});
            var saved = repo.saveAll(items);
            lucene.indexAll(saved);
            Logger.getLogger(ImportController.class.getName()).info(
                    "Imported " + saved.size() + " items from classpath: /srd.json");
        }
    }
}
