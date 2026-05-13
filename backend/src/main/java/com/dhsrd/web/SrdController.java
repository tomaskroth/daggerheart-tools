package com.dhsrd.web;

import com.dhsrd.domain.SrdService;
import com.dhsrd.model.SrdType;
import com.dhsrd.repo.SrdItemRepository;
import com.dhsrd.search.LuceneService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class SrdController {

    private final SrdItemRepository repo;
    private final LuceneService lucene;
    private final SrdService srdService;

    public SrdController(SrdItemRepository repo, LuceneService lucene, SrdService srdService) {
        this.repo = repo;
        this.lucene = lucene;
        this.srdService = srdService;
    }
    // TODO PBI-002: repo and lucene fields remain here temporarily pending full service layer extraction

    @GetMapping("")
    public ResponseEntity<String> aliveCheck() {
        return ResponseEntity.ok("SRD API is alive");
    }

    @PostMapping("/srd/_bulkUpsert")
    public ResponseEntity<?> bulkUpsert(@RequestBody List<com.dhsrd.model.SrdItem> items) {
        try {
            List<com.dhsrd.model.SrdItem> saved = srdService.bulkUpsert(items);
            return ResponseEntity.ok(Map.of("count", saved.size()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Bulk request exceeds maximum item count"));
        } catch (IllegalStateException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Internal server error"));
        }
    }

    @PostMapping("/search")
    public ResponseEntity<?> search(@RequestBody(required = false) SearchDTO dto) throws Exception {
        if (dto == null) dto = new SearchDTO(null, null, null, null, 0, 20, true);
        return ResponseEntity.ok(lucene.search(
                dto.q(),
                dto.types(),
                dto.levelMin(),
                dto.levelMax(),
                dto.from() == null ? 0 : dto.from(),
                dto.size() == null ? 300 : dto.size(),
                dto.fuzzy() == null || dto.fuzzy()
        ));
    }

    @GetMapping("/srd/{slug}")
    public ResponseEntity<?> bySlug(@PathVariable String slug) {
        return repo.findBySlug(slug)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/srd/_reindex")
    public ResponseEntity<?> reindex() {
        try {
            srdService.reindex();
            return ResponseEntity.ok(Map.of("status", "ok"));
        } catch (IllegalStateException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Internal server error"));
        }
    }

    @GetMapping("/srd/types")
    public List<SrdType> types() {
        return Arrays.asList(SrdType.values());
    }
}
