package com.dhsrd.cucumber.steps;

import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

public class SlugLookupStepDefs {

    private final TestRestTemplate restTemplate;
    private ResponseEntity<String> response;

    public SlugLookupStepDefs(TestRestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @When("a lookup is performed for slug {string}")
    public void lookupBySlug(String slug) {
        response = restTemplate.getForEntity("/api/srd/" + slug, String.class);
    }

    @Then("a not-found response is returned")
    public void notFoundResponseReturned() {
        assertThat(response.getStatusCode().value()).isEqualTo(404);
    }
}
