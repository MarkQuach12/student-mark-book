package com.markbook.backend.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final ConcurrentHashMap<String, Bucket> loginBuckets = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Bucket> signupBuckets = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Bucket> forgotPasswordBuckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        if (!path.startsWith("/api/auth/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = getClientIp(request);
        Bucket bucket;

        if (path.contains("/login")) {
            bucket = loginBuckets.computeIfAbsent(clientIp, k -> createBucket(10, Duration.ofMinutes(1)));
        } else if (path.contains("/signup")) {
            bucket = signupBuckets.computeIfAbsent(clientIp, k -> createBucket(10, Duration.ofHours(1)));
        } else if (path.contains("/forgot-password")) {
            bucket = forgotPasswordBuckets.computeIfAbsent(clientIp, k -> createBucket(5, Duration.ofHours(1)));
        } else {
            filterChain.doFilter(request, response);
            return;
        }

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Too many requests. Please try again later.\"}");
        }
    }

    private Bucket createBucket(int tokens, Duration period) {
        return Bucket.builder()
                .addLimit(Bandwidth.builder().capacity(tokens).refillGreedy(tokens, period).build())
                .build();
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isEmpty()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
