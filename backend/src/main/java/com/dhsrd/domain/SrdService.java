package com.dhsrd.domain;

import com.dhsrd.model.SrdItem;
import com.dhsrd.model.SrdType;
import com.dhsrd.repo.SrdItemRepository;
import com.dhsrd.search.LuceneService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class SrdService {

    private static final int MAX_BULK_ITEMS = 2000;
    private static final int DEFAULT_FROM = 0;
    private static final int DEFAULT_SIZE = 300;

    private final SrdItemRepository repository;
    private final LuceneService luceneService;
    private final ObjectMapper objectMapper;

    public SrdService(SrdItemRepository repository, LuceneService luceneService, ObjectMapper objectMapper) {
        this.repository = repository;
        this.luceneService = luceneService;
        this.objectMapper = objectMapper;
    }

    public Map<String, Object> search(SearchCriteria criteria) {
        try {
            return luceneService.search(
                    criteria.q(),
                    criteria.types(),
                    criteria.levelMin(),
                    criteria.levelMax(),
                    criteria.from() == null ? DEFAULT_FROM : criteria.from(),
                    criteria.size() == null ? DEFAULT_SIZE : criteria.size(),
                    criteria.fuzzy() == null || criteria.fuzzy()
            );
        } catch (Exception e) {
            throw new IllegalStateException("Search failed", e);
        }
    }

    public Optional<SrdItem> findBySlug(String slug) {
        return repository.findBySlug(slug);
    }

    public List<SrdType> listTypes() {
        return List.of(SrdType.values());
    }

    public void loadInitialData() {
        try {
            if (!luceneService.isEmpty()) {
                return;
            }
            try (InputStream is = getClass().getResourceAsStream("/srd.json")) {
                if (is == null) return;
                List<SrdItem> items = objectMapper.readValue(is, new TypeReference<>() {});
                List<SrdItem> saved = repository.saveAll(items);
                luceneService.indexAll(saved);
            }
        } catch (Exception e) {
            throw new IllegalStateException("Failed to load initial SRD data", e);
        }
    }

    @PreAuthorize("isAuthenticated()")
    public void reindex() {
        try {
            luceneService.deleteAll();
            luceneService.indexAll(repository.findAll());
        } catch (Exception e) {
            throw new IllegalStateException("Reindex failed", e);
        }
    }

    @PreAuthorize("isAuthenticated()")
    @Transactional
    public List<SrdItem> bulkUpsert(List<SrdItem> items) {
        if (items.size() > MAX_BULK_ITEMS) {
            throw new IllegalArgumentException("Bulk request exceeds maximum item count");
        }

        List<SrdItem> sanitised = items.stream()
                .map(this::sanitiseContent)
                .toList();

        List<SrdItem> saved = repository.saveAll(sanitised);
        try {
            luceneService.indexAll(saved);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to index items after bulk upsert", e);
        }
        return saved;
    }

    private SrdItem sanitiseContent(SrdItem item) {
        if (item.getContent() != null) {
            item.setContent(Jsoup.clean(item.getContent(), Safelist.basic()));
        }
        return item;
    }
}
