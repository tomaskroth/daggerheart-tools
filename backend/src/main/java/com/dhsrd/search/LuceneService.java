package com.dhsrd.search;

import com.dhsrd.model.SrdItem;
import com.dhsrd.model.SrdType;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.document.*;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.index.Term;
import org.apache.lucene.queryparser.classic.MultiFieldQueryParser;
import org.apache.lucene.search.*;
import org.apache.lucene.store.FSDirectory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class LuceneService {
    private final Analyzer analyzer;
    private final FSDirectory directory;

    public LuceneService(Analyzer analyzer, FSDirectory directory) {
        this.analyzer = analyzer;
        this.directory = directory;
    }

    private Document toDoc(SrdItem it) {
        Document d = new Document();
        d.add(new StringField("id", String.valueOf(it.getId()), Field.Store.YES));
        d.add(new StringField("slug", it.getSlug(), Field.Store.YES));
        d.add(new StringField("type", it.getType().name(), Field.Store.YES));
        d.add(new TextField("title", nz(it.getTitle()), Field.Store.YES));
        d.add(new TextField("excerpt", nz(it.getExcerpt()), Field.Store.YES));
        d.add(new TextField("content", nz(it.getContent()), Field.Store.YES));
        if (it.getTags() != null) it.getTags().forEach(t -> d.add(new StringField("tag", t, Field.Store.YES)));
        if (it.getLevel() != null) {
            d.add(new IntPoint("level", it.getLevel()));
            d.add(new StoredField("level_store", it.getLevel()));
        }
        return d;
    }

    private static String nz(String s) { return s == null ? "" : s; }

    public void indexAll(Collection<SrdItem> items) throws Exception {
        IndexWriterConfig cfg = new IndexWriterConfig(analyzer).setOpenMode(IndexWriterConfig.OpenMode.CREATE_OR_APPEND);
        try (IndexWriter w = new IndexWriter(directory, cfg)) {
            for (SrdItem it : items) {
                w.updateDocument(new Term("id", String.valueOf(it.getId())), toDoc(it));
            }
            w.flush();
        }
    }

    public void deleteAll() throws Exception {
        try (IndexWriter w = new IndexWriter(directory, new IndexWriterConfig(analyzer))) {
            w.deleteAll();
            w.commit();
        }
    }

    public Map<String, Object> search(String q,
                                      List<SrdType> types,
                                      Integer levelMin,
                                      Integer levelMax,
                                      int from,
                                      int size,
                                      boolean fuzzy) throws Exception {
        try (DirectoryReader r = DirectoryReader.open(directory)) {
            IndexSearcher s = new IndexSearcher(r);

            Query main;
            if (q == null || q.isBlank()) {
                main = new MatchAllDocsQuery();
            } else {
                String parsed = q;
                if (fuzzy) {
                    parsed = Arrays.stream(q.split("\\s+"))
                            .map(t -> t + "~2")
                            .collect(Collectors.joining(" "));
                }
                // Boost title/excerpt vs content
                String[] fields = {"title", "excerpt", "content"};
                Map<String, Float> boosts = Map.of("title", 4.0f, "excerpt", 2.0f, "content", 1.0f);
                MultiFieldQueryParser p = new MultiFieldQueryParser(fields, analyzer, boosts);
                main = p.parse(parsed);

            }

            List<Query> filters = new ArrayList<>();
            if (types != null && !types.isEmpty()) {
                BooleanQuery.Builder b = new BooleanQuery.Builder();
                for (SrdType t : types) {
                    b.add(new TermQuery(new Term("type", t.name())), BooleanClause.Occur.SHOULD);
                }
                filters.add(b.build());
            }
            if (levelMin != null || levelMax != null) {
                int lo = levelMin == null ? Integer.MIN_VALUE : levelMin;
                int hi = levelMax == null ? Integer.MAX_VALUE : levelMax;
                filters.add(IntPoint.newRangeQuery("level", lo, hi));
            }

            BooleanQuery.Builder qb = new BooleanQuery.Builder().add(main, BooleanClause.Occur.MUST);
            for (Query f : filters) qb.add(f, BooleanClause.Occur.FILTER);

            TopDocs td = s.search(qb.build(), from + size);
            List<Map<String, Object>> hits = new ArrayList<>();
            ScoreDoc[] sd = td.scoreDocs;
            for (int i = from; i < Math.min(sd.length, from + size); i++) {
                Document d = s.doc(sd[i].doc);
                Map<String, Object> m = new HashMap<>();
                m.put("id", d.get("id"));
                m.put("slug", d.get("slug"));
                m.put("title", d.get("title"));
                m.put("excerpt", d.get("excerpt"));
                m.put("content", d.get("content"));
                m.put("type", d.get("type"));
                m.put("level", d.get("level_store") == null ? null : Integer.valueOf(d.get("level_store")));
                m.put("tags", Arrays.asList(d.getValues("tag")));
                m.put("score", sd[i].score);
                hits.add(m);
            }
            return Map.of("total", td.totalHits.value, "items", hits);
        }
    }
}

