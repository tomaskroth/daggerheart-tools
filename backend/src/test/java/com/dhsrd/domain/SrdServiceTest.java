package com.dhsrd.domain;

import com.dhsrd.model.SrdItem;
import com.dhsrd.model.SrdType;
import com.dhsrd.repo.SrdItemRepository;
import com.dhsrd.search.LuceneService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.doThrow;

@ExtendWith(MockitoExtension.class)
class SrdServiceTest {

    @Mock
    private SrdItemRepository repository;

    @Mock
    private LuceneService luceneService;

    private SrdService srdService;

    @BeforeEach
    void setUp() {
        srdService = new SrdService(repository, luceneService);
    }

    @Test
    void should_sanitiseScriptTagsFromContent_when_bulkUpsertCalled()  {
        SrdItem item = itemWithContent("Hello <script>alert('xss')</script> World");
        when(repository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));

        srdService.bulkUpsert(List.of(item));

        ArgumentCaptor<List<SrdItem>> captor = ArgumentCaptor.forClass(List.class);
        verify(repository).saveAll(captor.capture());
        String sanitised = captor.getValue().get(0).getContent();
        assertThat(sanitised).doesNotContain("<script>");
        assertThat(sanitised).doesNotContain("alert");
        assertThat(sanitised).contains("Hello");
        assertThat(sanitised).contains("World");
    }

    @Test
    void should_preserveSafeHtmlInContent_when_bulkUpsertCalled()  {
        SrdItem item = itemWithContent("<b>Bold</b> and <i>italic</i> and <a href=\"http://example.com\">link</a>");
        when(repository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));

        srdService.bulkUpsert(List.of(item));

        ArgumentCaptor<List<SrdItem>> captor = ArgumentCaptor.forClass(List.class);
        verify(repository).saveAll(captor.capture());
        String sanitised = captor.getValue().get(0).getContent();
        assertThat(sanitised).contains("<b>Bold</b>");
        assertThat(sanitised).contains("<i>italic</i>");
        assertThat(sanitised).contains("<a");
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
    void should_saveAllItems_when_bulkUpsertCalledWithValidList()  {
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

        org.assertj.core.api.Assertions.assertThatCode(() -> srdService.bulkUpsert(List.of(item)))
                .doesNotThrowAnyException();

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

    private SrdItem itemWithContent(String content) {
        SrdItem item = new SrdItem();
        item.setTitle("Test Item");
        item.setSlug("test-item-" + System.nanoTime());
        item.setType(SrdType.ABILITIES);
        item.setContent(content);
        return item;
    }
}
