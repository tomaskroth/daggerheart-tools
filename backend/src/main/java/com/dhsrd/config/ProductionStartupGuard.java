package com.dhsrd.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("!dev")
public class ProductionStartupGuard implements ApplicationListener<ApplicationReadyEvent> {

    private final String adminPassword;

    public ProductionStartupGuard(@Value("${spring.security.user.password:}") String adminPassword) {
        this.adminPassword = adminPassword;
    }

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        if ("changeme-dev-only".equals(adminPassword)) {
            throw new IllegalStateException(
                "ADMIN_PASSWORD must be changed from the default value before running outside the dev profile"
            );
        }
    }
}
