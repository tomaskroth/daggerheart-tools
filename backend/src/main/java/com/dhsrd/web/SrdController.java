package com.dhsrd.web;

import com.dhsrd.domain.SearchCriteria;
import com.dhsrd.domain.SrdService;
import com.dhsrd.model.SrdType;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class SrdController {

    private final SrdService srdService;

    public SrdController(SrdService srdService) {
        this.srdService = srdService;
    }

    @GetMapping("")
    public ResponseEntity<String> aliveCheck() {
        return ResponseEntity.ok("SRD API is alive");
    }

    @PostMapping("/srd/_bulkUpsert")
    public ResponseEntity<?> bulkUpsert(@Valid @RequestBody List<com.dhsrd.model.SrdItem> items) {
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
    public ResponseEntity<?> search(@Valid @RequestBody(required = false) SearchCriteria criteria) {
        try {
            SearchCriteria effective = criteria != null ? criteria
                    : new SearchCriteria(null, null, null, null, null, null, null);
            return ResponseEntity.ok(srdService.search(effective));
        } catch (IllegalStateException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Internal server error"));
        }
    }

    @GetMapping("/srd/{slug}")
    public ResponseEntity<?> bySlug(@PathVariable String slug) {
        return srdService.findBySlug(slug)
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
        return srdService.listTypes();
    }
}
