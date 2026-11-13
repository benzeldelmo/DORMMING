package com.dormming.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = "dormming.seed=false")
@AutoConfigureMockMvc
class ExpenseApiTest {

    @Autowired
    MockMvc mvc;

    String token() throws Exception {
        String body = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"exp@demo.ph\",\"password\":\"dormming123\",\"displayName\":\"Exp\"}"))
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(body, "$.token");
    }

    @Test
    void personalEndpointIsGoneAndSharedValidates() throws Exception {
        String auth = "Bearer " + token();
        String me = JsonPath.read(mvc.perform(post("/api/dorms").header("Authorization", auth).contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Test Dorm\"}")).andReturn().getResponse().getContentAsString(), "$.members[0].user.id");
        mvc.perform(post("/api/expenses/personal").header("Authorization", auth).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"amountCentavos\":100,\"category\":\"OTHERS\"}"))
                .andExpect(status().is4xxClientError());
        String body = "{\"amountCentavos\":%d,\"category\":\"%s\",\"note\":\"Lunch\",\"date\":\"2026-11-11\",\"payerId\":\"%s\",\"participantIds\":[\"%s\"],\"split\":{\"type\":\"EQUAL\"}}";
        mvc.perform(post("/api/expenses/shared").header("Authorization", auth).contentType(MediaType.APPLICATION_JSON)
                        .content(body.formatted(0, "OTHERS", me, me)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Amount must be more than ₱0.00"));
        mvc.perform(post("/api/expenses/shared").header("Authorization", auth).contentType(MediaType.APPLICATION_JSON)
                        .content(body.formatted(100, "NOPE", me, me)))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/expenses/shared").header("Authorization", auth).contentType(MediaType.APPLICATION_JSON)
                        .content(body.formatted(12000, "FOOD_GROCERIES", me, me)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amountCentavos").value(12000));
    }
}
