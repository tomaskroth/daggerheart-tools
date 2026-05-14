package com.dhsrd.cucumber.steps;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

public class SearchStepDefs {

    private final TestRestTemplate restTemplate;
    private ResponseEntity<Map> response;

    public SearchStepDefs(TestRestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @When("a search is performed with no query text")
    public void searchWithNoQuery() {
        response = restTemplate.postForEntity("/api/search", Map.of(), Map.class);
    }

    @When("a search is performed with query {string}")
    public void searchWithQuery(String q) {
        response = restTemplate.postForEntity("/api/search", Map.of("q", q), Map.class);
    }

    @When("a search is performed with from {string} and size {string}")
    public void searchWithPagination(String from, String size) {
        response = restTemplate.postForEntity("/api/search",
                Map.of("from", Integer.parseInt(from), "size", Integer.parseInt(size)), Map.class);
    }

    @Then("all indexed items are returned up to the default page size")
    @SuppressWarnings("unchecked")
    public void allIndexedItemsReturned() {
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        Map<String, Object> body = response.getBody();
        assertThat(body).isNotNull();
        long total = ((Number) body.get("total")).longValue();
        List<Object> items = (List<Object>) body.get("items");
        assertThat(total).isGreaterThan(0);
        assertThat(items.size()).isEqualTo((int) total);
    }

    @Then("results include items matching {string}")
    @SuppressWarnings("unchecked")
    public void resultsIncludeItemsMatching(String expected) {
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        List<Map<String, Object>> items = (List<Map<String, Object>>) response.getBody().get("items");
        assertThat(items).isNotEmpty();
        boolean found = items.stream().anyMatch(item -> {
            String title = (String) item.get("title");
            String content = (String) item.get("content");
            String titleLower = title == null ? "" : title.toLowerCase();
            String contentLower = content == null ? "" : content.toLowerCase();
            return titleLower.contains(expected.toLowerCase()) || contentLower.contains(expected.toLowerCase());
        });
        assertThat(found).as("Expected at least one result containing '%s'", expected).isTrue();
    }

    @Then("at most {int} items are returned")
    @SuppressWarnings("unchecked")
    public void atMostItemsReturned(int maxSize) {
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        List<Object> items = (List<Object>) response.getBody().get("items");
        assertThat(items).hasSizeLessThanOrEqualTo(maxSize);
    }

    @And("^the first result is the (\\d+)(?:st|nd|rd|th) match overall$")
    @SuppressWarnings("unchecked")
    public void firstResultIsNthMatchOverall(int position) {
        ResponseEntity<Map> allResults = restTemplate.postForEntity(
                "/api/search", Map.of("from", 0, "size", 300), Map.class);
        List<Map<String, Object>> allItems = (List<Map<String, Object>>) allResults.getBody().get("items");
        List<Map<String, Object>> pageItems = (List<Map<String, Object>>) response.getBody().get("items");

        assertThat(allItems).hasSizeGreaterThanOrEqualTo(position);
        assertThat(pageItems).isNotEmpty();

        String expectedSlug = (String) allItems.get(position - 1).get("slug");
        String actualSlug = (String) pageItems.get(0).get("slug");
        assertThat(actualSlug).isEqualTo(expectedSlug);
    }
}
