package com.dhsrd.domain;

import com.dhsrd.model.SrdItem;
import com.dhsrd.repo.SrdItemRepository;
import com.dhsrd.search.LuceneService;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SrdService {

    private static final int MAX_BULK_ITEMS = 2000;

    private final SrdItemRepository repository;
    private final LuceneService luceneService;

    public SrdService(SrdItemRepository repository, LuceneService luceneService) {
        this.repository = repository;
        this.luceneService = luceneService;
    }

    public void reindex() {
        try {
            luceneService.deleteAll();
            luceneService.indexAll(repository.findAll());
        } catch (Exception e) {
            throw new IllegalStateException("Reindex failed", e);
        }
    }

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
