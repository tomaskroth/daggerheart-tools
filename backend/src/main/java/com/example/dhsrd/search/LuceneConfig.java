package com.example.dhsrd.search;

import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.en.EnglishAnalyzer;
import org.apache.lucene.store.FSDirectory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.nio.file.Path;

@Configuration
public class LuceneConfig {

    @Bean
    public Analyzer analyzer() {
        return new EnglishAnalyzer();
    }

    @Bean
    public FSDirectory directory(@Value("${app.lucene.dir}") String dir) throws Exception {
        return FSDirectory.open(Path.of(dir));
    }
}
