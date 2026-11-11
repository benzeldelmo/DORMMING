package com.dormming.web;

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
    void rejectsZeroAmountAndUnknownCategory() throws Exception {
        String auth = "Bearer " + token();
        mvc.perform(post("/api/expenses/personal").header("Authorization", auth).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"amountCentavos\":0,\"category\":\"OTHERS\",\"note\":\"\",\"date\":\"2026-11-11\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Amount must be more than ₱0.00"));
        mvc.perform(post("/api/expenses/personal").header("Authorization", auth).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"amountCentavos\":100,\"category\":\"NOPE\",\"note\":\"\",\"date\":\"2026-11-11\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/expenses/personal").header("Authorization", auth).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"amountCentavos\":12000,\"category\":\"FOOD_GROCERIES\",\"note\":\"Lunch\",\"date\":\"2026-11-11\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amountCentavos").value(12000));
    }
}
