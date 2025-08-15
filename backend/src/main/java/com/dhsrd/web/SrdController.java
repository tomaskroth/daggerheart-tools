package com.dhsrd.web;

import com.dhsrd.model.SrdItem;
import com.dhsrd.model.SrdType;
import com.dhsrd.repo.SrdItemRepository;
import com.dhsrd.search.LuceneService;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class SrdController {
    private final SrdItemRepository repo;
    private final LuceneService lucene;

    public SrdController(SrdItemRepository repo, LuceneService lucene) {
        this.repo = repo;
        this.lucene = lucene;
    }

    @GetMapping("")
    public ResponseEntity<String> aliveCheck() {
        return ResponseEntity.ok("SRD API is alive");
    }

    /** Bulk upsert SRD items and (re)index them */
    @PostMapping("/srd/_bulkUpsert")
    @Transactional
    public ResponseEntity<?> bulkUpsert(@RequestBody List<SrdItem> items) throws Exception {
        List<SrdItem> saved = repo.saveAll(items);
        lucene.indexAll(saved);
        return ResponseEntity.ok(Map.of("count", saved.size()));
    }

    /** Full-text search */
    @PostMapping("/search")
    public ResponseEntity<?> search(@RequestBody(required = false) SearchDTO dto) throws Exception {
        if (dto == null) dto = new SearchDTO(null, null, null, null, 0, 20, true);
        return ResponseEntity.ok(lucene.search(
                dto.q(),
                dto.types(),
                dto.levelMin(),
                dto.levelMax(),
                dto.from() == null ? 0 : dto.from(),
                dto.size() == null ? 20 : dto.size(),
                dto.fuzzy() == null || dto.fuzzy()
        ));
    }

    /** Fetch a single item by slug */
    @GetMapping("/srd/{slug}")
    public ResponseEntity<?> bySlug(@PathVariable String slug) {
        return repo.findBySlug(slug)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** Force a full reindex from DB */
    @PostMapping("/srd/_reindex")
    public ResponseEntity<?> reindex() throws Exception {
        lucene.deleteAll();
        lucene.indexAll(repo.findAll());
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    /** Enum list for UI filter chips */
    @GetMapping("/srd/types")
    public List<SrdType> types() {
        return Arrays.asList(SrdType.values());
    }
}
