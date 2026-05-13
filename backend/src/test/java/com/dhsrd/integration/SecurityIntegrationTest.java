package com.dhsrd.integration;

import com.dhsrd.domain.SrdService;
import com.dhsrd.web.SrdController;
import com.dhsrd.config.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.notNullValue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// Scenarios: PBI-001-security-baseline.feature — @backend @security
@WebMvcTest(SrdController.class)
@Import(SecurityConfig.class)
@org.springframework.test.context.TestPropertySource(properties = "ADMIN_PASSWORD=changeme-dev-only")
class SecurityIntegrationTest {

    private static final String TEST_ADMIN_USER = "admin";
    private static final String TEST_ADMIN_PASSWORD = "changeme-dev-only";

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SrdService srdService;

    // Scenario: Unauthenticated request to bulk upsert endpoint is rejected
    @Test
    void should_return401_when_unauthenticatedBulkUpsert() throws Exception {
        mockMvc.perform(post("/api/srd/_bulkUpsert")
                .contentType(MediaType.APPLICATION_JSON)
                .content("[]"))
                .andExpect(status().isUnauthorized());
    }

    // Scenario: Unauthenticated request to reindex endpoint is rejected
    @Test
    void should_return401_when_unauthenticatedReindex() throws Exception {
        mockMvc.perform(get("/api/srd/_reindex"))
                .andExpect(status().isUnauthorized());
    }

    // Scenario: Read endpoints remain publicly accessible without authentication
    @Test
    void should_return200_when_unauthenticatedTypesRequest() throws Exception {
        mockMvc.perform(get("/api/srd/types"))
                .andExpect(status().isOk());
    }

    @Test
    void should_return200_when_unauthenticatedSearchRequest() throws Exception {
        when(srdService.search(any())).thenReturn(Map.of("items", List.of(), "total", 0));

        mockMvc.perform(post("/api/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"q\": \"warrior\"}"))
                .andExpect(status().isOk());
    }

    // Scenario: HTTP security headers are present on API responses
    @Test
    void should_includeSecurityHeaders_when_anyApiResponse() throws Exception {
        mockMvc.perform(get("/api/srd/types"))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("X-Frame-Options", "DENY"))
                .andExpect(header().exists("Content-Security-Policy"));
    }

    // Scenario: CORS is configured in exactly one place — preflight to /api/search
    // returns CORS headers (wired only through SecurityConfig, no @CrossOrigin anywhere)
    @Test
    void should_returnCorsHeaders_when_preflightRequest() throws Exception {
        mockMvc.perform(options("/api/search")
                .header("Origin", "http://localhost:3000")
                .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", notNullValue()));
    }

    // Positive path: authenticated request to bulk upsert succeeds
    @Test
    void should_return200_when_authenticatedBulkUpsert() throws Exception {
        when(srdService.bulkUpsert(any())).thenReturn(List.of());

        mockMvc.perform(post("/api/srd/_bulkUpsert")
                .with(httpBasic(TEST_ADMIN_USER, TEST_ADMIN_PASSWORD))
                .contentType(MediaType.APPLICATION_JSON)
                .content("[]"))
                .andExpect(status().isOk());
    }

    // Positive path: authenticated request to reindex succeeds
    @Test
    void should_return200_when_authenticatedReindex() throws Exception {
        mockMvc.perform(get("/api/srd/_reindex")
                .with(httpBasic(TEST_ADMIN_USER, TEST_ADMIN_PASSWORD)))
                .andExpect(status().isOk());
    }
}
