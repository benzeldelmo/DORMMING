package com.dormming.service;

import static com.dormming.service.World.c;
import static org.assertj.core.api.Assertions.assertThat;

import com.dormming.model.Dorm;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import org.junit.jupiter.api.RepeatedTest;

/** Several phones poll every 5 seconds; their requests overlap. */
class ConcurrencyTest {

    static void together(int n, Runnable task) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(n);
        CountDownLatch go = new CountDownLatch(1);
        List<Future<?>> all = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            all.add(pool.submit(() -> {
                go.await();
                task.run();
                return null;
            }));
        }
        go.countDown();
        for (Future<?> f : all) {
            try {
                f.get();
            } catch (Exception ignored) {
                // a rejected payment is fine; we check the totals
            }
        }
        pool.shutdown();
    }

    @RepeatedTest(5)
    void doubleTappedPaymentNeverOverpays() throws Exception {
        World w = new World();
        Dorm dorm = w.dormOfThree();
        w.sharedEqual(dorm, w.a, 20000, List.of(w.a, w.b)); // b owes a 10000
        together(16, () -> w.payments.record(w.b, w.a, c(10000), "", w.today));
        assertThat(w.transactions.paymentsByDorm(dorm.id())).hasSize(1);
    }
}
