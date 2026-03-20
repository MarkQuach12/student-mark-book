package com.markbook.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Slf4j
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String method = request.getMethod();
        String uri = request.getRequestURI();
        String origin = request.getHeader("Origin");
        log.debug("[JWT Filter] {} {} from origin={}", method, uri, origin);

        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            log.debug("[JWT Filter] No Bearer token present for {} {}", method, uri);
            chain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);
        if (jwtUtil.isValid(token)) {
            String userId = jwtUtil.getUserId(token);
            String role = jwtUtil.getRole(token);
            log.debug("[JWT Filter] Valid token for user={} role={}", userId, role);
            var auth = new UsernamePasswordAuthenticationToken(
                    userId,
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_" + role))
            );
            SecurityContextHolder.getContext().setAuthentication(auth);
        } else {
            log.warn("[JWT Filter] Invalid/expired token for {} {}", method, uri);
        }
        chain.doFilter(request, response);
    }
}
