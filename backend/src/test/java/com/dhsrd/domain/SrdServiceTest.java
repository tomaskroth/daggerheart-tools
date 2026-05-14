package com.dhsrd.domain;

import com.dhsrd.model.SrdItem;
import com.dhsrd.model.SrdType;
import com.dhsrd.repo.SrdItemRepository;
import com.dhsrd.search.LuceneService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SrdServiceTest {

    @Mock
    private SrdItemRepository repository;

    @Mock
    private LuceneService luceneService;

    private SrdService srdService;

    @BeforeEach
    void setUp() {
        srdService = new SrdService(repository, luceneService, new ObjectMapper());
    }

    // --- bulkUpsert ---

    @Test
    void should_sanitiseScriptTagsFromContent_when_bulkUpsertCalled() {
        SrdItem item = itemWithContent("Hello <script>alert('xss')</script> World");
        when(repository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));

        srdService.bulkUpsert(List.of(item));

        ArgumentCaptor<List<SrdItem>> captor = ArgumentCaptor.forClass(List.class);
        verify(repository).saveAll(captor.capture());
        String sanitised = captor.getValue().get(0).getContent();
        assertThat(sanitised).doesNotContain("<script>").doesNotContain("alert")
                .contains("Hello").contains("World");
    }

    @Test
    void should_preserveSafeHtmlInContent_when_bulkUpsertCalled() {
        SrdItem item = itemWithContent("<b>Bold</b> and <i>italic</i> and <a href=\"http://example.com\">link</a>");
        when(repository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));

        srdService.bulkUpsert(List.of(item));

        ArgumentCaptor<List<SrdItem>> captor = ArgumentCaptor.forClass(List.class);
        verify(repository).saveAll(captor.capture());
        String sanitised = captor.getValue().get(0).getContent();
        assertThat(sanitised).contains("<b>Bold</b>").contains("<i>italic</i>").contains("<a");
    }

    @Test
    void should_throwIllegalArgumentException_when_itemListExceedsMaxSize() {
        List<SrdItem> oversizedList = new ArrayList<>();
        for (int i = 0; i < 2001; i++) {
            oversizedList.add(itemWithContent("content"));
        }

        assertThatThrownBy(() -> srdService.bulkUpsert(oversizedList))
                .isInstanceOf(IllegalArgumentException.class);

        verifyNoInteractions(repository);
        verifyNoInteractions(luceneService);
    }

    @Test
    void should_saveAllItems_when_bulkUpsertCalledWithValidList() {
        SrdItem item1 = itemWithContent("<p>Item one</p>");
        SrdItem item2 = itemWithContent("<p>Item two</p>");
        when(repository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));

        srdService.bulkUpsert(List.of(item1, item2));

        ArgumentCaptor<List<SrdItem>> captor = ArgumentCaptor.forClass(List.class);
        verify(repository).saveAll(captor.capture());
        assertThat(captor.getValue()).hasSize(2);
    }

    @Test
    void should_triggerReindex_when_bulkUpsertCompletes() throws Exception {
        SrdItem item = itemWithContent("<p>Content</p>");
        when(repository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));

        srdService.bulkUpsert(List.of(item));

        verify(luceneService).indexAll(anyList());
    }

    @Test
    void should_notThrow_when_itemContentIsNull() {
        SrdItem item = itemWithContent(null);
        when(repository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));

        assertThatCode(() -> srdService.bulkUpsert(List.of(item))).doesNotThrowAnyException();

        ArgumentCaptor<List<SrdItem>> captor = ArgumentCaptor.forClass(List.class);
        verify(repository).saveAll(captor.capture());
        assertThat(captor.getValue().get(0).getContent()).isNull();
    }

    @Test
    void should_throwIllegalStateException_when_luceneIndexAllFails() throws Exception {
        SrdItem item = itemWithContent("<p>Content</p>");
        when(repository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));
        doThrow(new RuntimeException("index write failed")).when(luceneService).indexAll(anyList());

        assertThatThrownBy(() -> srdService.bulkUpsert(List.of(item)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Failed to index items");
    }

    @Test
    void should_throwIllegalStateException_when_reindexFails() throws Exception {
        doThrow(new RuntimeException("disk full")).when(luceneService).deleteAll();

        assertThatThrownBy(() -> srdService.reindex())
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Reindex failed");
    }

    // --- search ---

    @Test
    void should_delegateToLucene_when_searchCalled() throws Exception {
        Map<String, Object> expected = Map.of("items", List.of(), "total", 0);
        when(luceneService.search(any(), any(), any(), any(), anyInt(), anyInt(), anyBoolean()))
                .thenReturn(expected);

        Map<String, Object> result = srdService.search(new SearchCriteria("guardian", null, null, null, null, null, null));

        assertThat(result).isEqualTo(expected);
    }

    @Test
    void should_applyDefaultPagination_when_searchCriteriaHasNullFromAndSize() throws Exception {
        when(luceneService.search(any(), any(), any(), any(), anyInt(), anyInt(), anyBoolean()))
                .thenReturn(Map.of("items", List.of(), "total", 0));

        srdService.search(new SearchCriteria(null, null, null, null, null, null, null));

        verify(luceneService).search(isNull(), isNull(), isNull(), isNull(), eq(0), eq(300), eq(true));
    }

    @Test
    void should_forwardTypeFilterToLucene_when_typesProvided() throws Exception {
        List<SrdType> filter = List.of(SrdType.WEAPONS);
        when(luceneService.search(any(), any(), any(), any(), anyInt(), anyInt(), anyBoolean()))
                .thenReturn(Map.of("items", List.of(), "total", 0));

        srdService.search(new SearchCriteria(null, filter, null, null, null, null, null));

        verify(luceneService).search(isNull(), eq(filter), isNull(), isNull(), anyInt(), anyInt(), anyBoolean());
    }

    @Test
    void should_throwIllegalStateException_when_luceneSearchFails() throws Exception {
        when(luceneService.search(any(), any(), any(), any(), anyInt(), anyInt(), anyBoolean()))
                .thenThrow(new RuntimeException("index corrupt"));

        assertThatThrownBy(() -> srdService.search(new SearchCriteria(null, null, null, null, null, null, null)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Search failed");
    }

    // --- findBySlug ---

    @Test
    void should_returnItem_when_slugExists() {
        SrdItem item = itemWithContent("<p>Content</p>");
        when(repository.findBySlug("guardian-warrior")).thenReturn(Optional.of(item));

        Optional<SrdItem> result = srdService.findBySlug("guardian-warrior");

        assertThat(result).contains(item);
    }

    @Test
    void should_returnEmpty_when_slugDoesNotExist() {
        when(repository.findBySlug("nonexistent")).thenReturn(Optional.empty());

        Optional<SrdItem> result = srdService.findBySlug("nonexistent");

        assertThat(result).isEmpty();
    }

    // --- listTypes ---

    @Test
    void should_returnAllSrdTypes_when_listTypesCalled() {
        List<SrdType> types = srdService.listTypes();

        assertThat(types).containsExactlyInAnyOrder(SrdType.values());
    }

    // --- loadInitialData ---

    @Test
    void should_skipLoad_when_luceneIndexIsNotEmpty() throws Exception {
        when(luceneService.isEmpty()).thenReturn(false);

        srdService.loadInitialData();

        verifyNoInteractions(repository);
        verify(luceneService, never()).indexAll(any());
    }

    @Test
    void should_saveAndIndexItems_when_luceneIndexIsEmpty() throws Exception {
        when(luceneService.isEmpty()).thenReturn(true);
        when(repository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));

        srdService.loadInitialData();

        ArgumentCaptor<List<SrdItem>> saveCaptor = ArgumentCaptor.forClass(List.class);
        verify(repository).saveAll(saveCaptor.capture());
        assertThat(saveCaptor.getValue()).isNotEmpty();
        verify(luceneService).indexAll(anyList());
    }

    // --- reindex ---

    @Test
    void should_deleteAndReindexAll_when_reindexCalled() throws Exception {
        when(repository.findAll()).thenReturn(List.of(itemWithContent("<p>content</p>")));

        srdService.reindex();

        verify(luceneService).deleteAll();
        verify(luceneService).indexAll(anyList());
    }

    // --- loadInitialData / enrichClassItem (PBI-017) ---

    @Test
    void should_setHpSlotCount_when_classContentContainsStartingHitPoints() throws Exception {
        when(luceneService.isEmpty()).thenReturn(true);
        when(repository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));

        srdService.loadInitialData();

        ArgumentCaptor<List<SrdItem>> captor = ArgumentCaptor.forClass(List.class);
        verify(repository).saveAll(captor.capture());
        List<SrdItem> saved = captor.getValue();
        List<SrdItem> classes = saved.stream()
                .filter(i -> i.getType() == SrdType.CLASSES)
                .toList();
        assertThat(classes).isNotEmpty();
        for (SrdItem cls : classes) {
            assertThat(cls.getHpSlotCount())
                    .as("hpSlotCount must be set for class '%s'", cls.getSlug())
                    .isNotNull()
                    .isGreaterThan(0);
        }
    }

    @Test
    void should_notSetHpSlotCount_when_itemTypeIsNotClasses() throws Exception {
        when(luceneService.isEmpty()).thenReturn(true);
        when(repository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));

        srdService.loadInitialData();

        ArgumentCaptor<List<SrdItem>> captor = ArgumentCaptor.forClass(List.class);
        verify(repository).saveAll(captor.capture());
        List<SrdItem> nonClasses = captor.getValue().stream()
                .filter(i -> i.getType() != SrdType.CLASSES)
                .toList();
        assertThat(nonClasses).isNotEmpty();
        for (SrdItem item : nonClasses) {
            assertThat(item.getHpSlotCount())
                    .as("hpSlotCount should remain null for non-class item '%s'", item.getSlug())
                    .isNull();
        }
    }

    // --- helpers ---

    private SrdItem itemWithContent(String content) {
        SrdItem item = new SrdItem();
        item.setTitle("Test Item");
        item.setSlug("test-item-" + System.nanoTime());
        item.setType(SrdType.ABILITIES);
        item.setContent(content);
        return item;
    }
}
