package com.dormming;

import java.security.SecureRandom;
import java.time.Clock;
import java.time.ZoneId;
import java.util.random.RandomGenerator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AppConfig {

    @Bean
    Clock clock() {
        return Clock.system(ZoneId.of("Asia/Manila"));
    }

    @Bean
    RandomGenerator random() {
        return new SecureRandom();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
