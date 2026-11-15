package com.dormming.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.dormming.repository.memory.InMemoryUserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

class AuthServiceTest {

    AuthService auth = new AuthService(new InMemoryUserRepository(), new BCryptPasswordEncoder(),
            "test-secret-that-is-at-least-32-characters", false);

    @Test
    void loginIgnoresEmailCase() {
        auth.register("benzel@demo.ph", "dormming123", "Benzel");
        assertThat(auth.login("Benzel@Demo.ph", "dormming123").user().email()).isEqualTo("benzel@demo.ph");
    }

    @org.junit.jupiter.api.Test
    void refusesTheDevelopmentSecretWhenDeployed() {
        org.assertj.core.api.Assertions.assertThatThrownBy(() -> new AuthService(new InMemoryUserRepository(), new BCryptPasswordEncoder(),
                "dormming-local-dev-secret-change-me-0123456789", true))
                .hasMessage("Set LOCAL_JWT_SECRET to your own random value before deploying");
    }
}
