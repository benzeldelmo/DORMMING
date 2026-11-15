package com.dormming.config;

import com.dormming.service.AuthService;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.PortMapper;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain api(HttpSecurity http, AuthService auth,
            @Value("${dormming.require-https}") boolean requireHttps) throws Exception {
        AuthenticationEntryPoint unauthorized = (request, response, e) -> {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write("{\"error\":\"Please log in again\"}");
        };
        http.csrf(csrf -> csrf.disable())
                .cors(cors -> {
                })
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // The API needs a login; everything else is the React app's files, open to anyone
                .authorizeHttpRequests(a -> a.requestMatchers("/api/auth/**", "/error").permitAll()
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll())
                .oauth2ResourceServer(o -> o.jwt(j -> j.decoder(auth.jwtDecoder())).authenticationEntryPoint(unauthorized))
                .exceptionHandling(e -> e.authenticationEntryPoint(unauthorized));
        if (requireHttps) {
            // Deployed: any plain-http request is redirected to https, and browsers are told (HSTS) to
            // use https from then on. Behind a host's proxy, forwarded headers say the request was https.
            http.portMapper(p -> p.portMapper(publicPorts())).redirectToHttps(Customizer.withDefaults());
        }
        return http.build();
    }

    /**
     * Deployed, the app listens on the host's own port (PORT) behind its https proxy, so the public
     * https address is always the standard port 443 (and http is 80), whatever port we listen on.
     */
    private static PortMapper publicPorts() {
        return new PortMapper() {
            @Override
            public Integer lookupHttpPort(Integer httpsPort) {
                return 80;
            }

            @Override
            public Integer lookupHttpsPort(Integer httpPort) {
                return 443;
            }
        };
    }

    /** The React dev server, on this laptop or opened from a phone on the same Wi-Fi. */
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("http://localhost:5180", "http://*:5180", "https://localhost:5180", "https://*:5180"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
