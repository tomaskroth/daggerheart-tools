package com.dhsrd.cucumber.steps;

import com.dhsrd.model.SrdType;
import com.dhsrd.repo.SrdItemRepository;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

public class HpSlotCountStepDefs {

    private final TestRestTemplate restTemplate;
    private final SrdItemRepository repository;
    private ResponseEntity<Map> response;
    private List<ResponseEntity<Map>> allClassResponses;

    public HpSlotCountStepDefs(TestRestTemplate restTemplate, SrdItemRepository repository) {
        this.restTemplate = restTemplate;
        this.repository = repository;
    }

    @When("a request is made for the class with slug {string}")
    public void should_request_class_by_slug(String slug) {
        response = restTemplate.getForEntity("/api/srd/" + slug, Map.class);
    }

    @Then("the response includes a field {string} with value {int}")
    public void should_have_field_with_value(String field, int expectedValue) {
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        Map<?, ?> body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body).containsKey(field);
        assertThat(((Number) body.get(field)).intValue()).isEqualTo(expectedValue);
    }

    @When("a request is made for each class in the system")
    @SuppressWarnings("unchecked")
    public void should_request_all_classes() {
        allClassResponses = repository.findAll().stream()
                .filter(item -> item.getType() == SrdType.CLASSES)
                .map(item -> restTemplate.getForEntity("/api/srd/" + item.getSlug(), Map.class))
                .toList();
        assertThat(allClassResponses).isNotEmpty();
    }

    @Then("every response includes a field {string} with a value greater than 0")
    public void should_all_have_field_greater_than_zero(String field) {
        for (ResponseEntity<Map> r : allClassResponses) {
            assertThat(r.getStatusCode().is2xxSuccessful()).isTrue();
            Map<?, ?> body = r.getBody();
            assertThat(body).isNotNull();
            assertThat(body).containsKey(field);
            assertThat(((Number) body.get(field)).intValue()).isGreaterThan(0);
        }
    }
}
