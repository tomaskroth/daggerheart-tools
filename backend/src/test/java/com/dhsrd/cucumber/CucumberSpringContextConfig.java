package com.dhsrd.cucumber;

import io.cucumber.spring.CucumberContextConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

@CucumberContextConfiguration
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("dev")
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:cucumbertest;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "app.lucene.dir=target/test-lucene-acceptance",
        "ADMIN_PASSWORD=changeme-dev-only"
})
public class CucumberSpringContextConfig {
}
