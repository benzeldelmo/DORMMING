package com.dormming.service;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.dormming.service.exception.TooManyAttemptsException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;

class AttemptLimiterTest {

    /** A clock the test can move forward. */
    static final class TestClock extends Clock {
        Instant now = Instant.parse("2026-11-15T08:00:00Z");

        @Override
        public ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return now;
        }
    }

    TestClock clock = new TestClock();
    AttemptLimiter limiter = new AttemptLimiter(clock);

    @Test
    void blocksAfterTooManyFailuresInTheWindow() {
        for (int i = 0; i < 5; i++) {
            limiter.check("k", 5, Duration.ofMinutes(15));
            limiter.fail("k");
        }
        assertThatThrownBy(() -> limiter.check("k", 5, Duration.ofMinutes(15)))
                .isInstanceOf(TooManyAttemptsException.class)
                .hasMessage("Too many tries. Wait 15 minutes and try again.");
    }

    @Test
    void letsYouTryAgainOnceTheWindowHasPassed() {
        for (int i = 0; i < 5; i++) {
            limiter.fail("k");
        }
        clock.now = clock.now.plus(Duration.ofMinutes(15)).plusSeconds(1);
        assertThatCode(() -> limiter.check("k", 5, Duration.ofMinutes(15))).doesNotThrowAnyException();
    }

    @Test
    void aSuccessClearsTheCountAndOtherKeysAreSeparate() {
        for (int i = 0; i < 5; i++) {
            limiter.fail("k");
        }
        assertThatCode(() -> limiter.check("other", 5, Duration.ofMinutes(15))).doesNotThrowAnyException();
        limiter.succeed("k");
        assertThatCode(() -> limiter.check("k", 5, Duration.ofMinutes(15))).doesNotThrowAnyException();
    }

    @Test
    void saysHowLongIsLeft() {
        for (int i = 0; i < 5; i++) {
            limiter.fail("k");
        }
        clock.now = clock.now.plus(Duration.ofMinutes(14));
        assertThatThrownBy(() -> limiter.check("k", 5, Duration.ofMinutes(15))).hasMessage("Too many tries. Wait 1 minute and try again.");
    }
}
