package com.dormming.web;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = "dormming.seed=false")
@AutoConfigureMockMvc
class AuthFlowTest {

    @Autowired
    MockMvc mvc;

    @Value("${dormming.local-jwt-secret}")
    String secret;

    String register(String email, String password) throws Exception {
        String body = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"%s","displayName":"Benzel"}""".formatted(email, password)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(body, "$.token");
    }

    String tokenSignedWith(String key, Instant expiresAt) {
        var encoder = NimbusJwtEncoder.withSecretKey(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256")).build();
        var claims = JwtClaimsSet.builder().subject("someone").issuedAt(expiresAt.minusSeconds(60)).expiresAt(expiresAt).build();
        return encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
    }

    @Test
    void registerThenReadProfile() throws Exception {
        String token = register("benz1@demo.ph", "dormming123");
        mvc.perform(get("/api/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.displayName").value("Benzel"));
    }

    @Test
    void rejectsDuplicateEmailAndShortPassword() throws Exception {
        register("benz2@demo.ph", "dormming123");
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"BENZ2@demo.ph\",\"password\":\"dormming123\",\"displayName\":\"B\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"benz3@demo.ph\",\"password\":\"short\",\"displayName\":\"B\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void wrongPasswordIs401WithMessage() throws Exception {
        register("benz4@demo.ph", "dormming123");
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"benz4@demo.ph\",\"password\":\"nope-nope\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Wrong email or password"));
    }

    @Test
    void missingForeignOrExpiredTokenIs401() throws Exception {
        mvc.perform(get("/api/me")).andExpect(status().isUnauthorized());
        String foreign = tokenSignedWith("a-completely-different-secret-that-is-long-enough!!", Instant.now().plusSeconds(600));
        mvc.perform(get("/api/me").header("Authorization", "Bearer " + foreign)).andExpect(status().isUnauthorized());
        String expired = tokenSignedWith(secret, Instant.now().minusSeconds(600));
        mvc.perform(get("/api/me").header("Authorization", "Bearer " + expired)).andExpect(status().isUnauthorized());
    }

    @Test
    void tokenForUnknownUserIs401() throws Exception {
        String ghost = tokenSignedWith(secret, Instant.now().plusSeconds(600));
        mvc.perform(get("/api/me").header("Authorization", "Bearer " + ghost)).andExpect(status().isUnauthorized());
    }
}
