package com.dhsrd.web;

import com.dhsrd.model.SrdItem;
import com.dhsrd.repo.SrdItemRepository;
import com.dhsrd.search.LuceneService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.InputStream;
import java.util.List;

@RestController
@RequestMapping("/api/import")
@CrossOrigin(origins = "*")
public class ImportController {
    private final SrdItemRepository repo;
    private final LuceneService lucene;
    private final ObjectMapper om = new ObjectMapper();

    public ImportController(SrdItemRepository repo, LuceneService lucene) {
        this.repo = repo;
        this.lucene = lucene;
    }

    /** Import SRD from a JSON array on classpath: /srd.json */
    @GetMapping("/classpath")
    public ResponseEntity<?> importFromClasspath() throws Exception {
        try (InputStream is = getClass().getResourceAsStream("/srd.json")) {
            if (is == null) return ResponseEntity.badRequest().body("No /srd.json on classpath");
            List<SrdItem> items = om.readValue(is, new TypeReference<>() {});
            var saved = repo.saveAll(items);
            lucene.indexAll(saved);
            return ResponseEntity.ok().body("Imported " + saved.size() + " items");
        }
    }
}
