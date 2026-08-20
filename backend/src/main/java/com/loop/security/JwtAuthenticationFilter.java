package com.loop.security;

import com.loop.model.User;
import com.loop.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                System.out.println("JwtAuthFilter: token received");
                if (jwtUtil.validateToken(token)) {
                    Long userId = jwtUtil.getUserIdFromToken(token);
                    System.out.println("JwtAuthFilter: token valid, userId=" + userId);
                    if (userId != null) {
                        userRepository.findById(userId).ifPresent(user -> {
                            // map role to GrantedAuthority (prefix with ROLE_)
                            String role = user.getRole() != null ? user.getRole().name() : "VIEWER";
                            SimpleGrantedAuthority ga = new SimpleGrantedAuthority("ROLE_" + role);
                            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(user, null, List.of(ga));
                            SecurityContextHolder.getContext().setAuthentication(auth);
                            System.out.println("JwtAuthFilter: authentication set for user=" + user.getEmail() + ", authorities=" + auth.getAuthorities());
                        });
                    }
                } else {
                    System.out.println("JwtAuthFilter: token invalid");
                }
            } catch (Exception ex) {
                System.out.println("JwtAuthFilter: exception while validating token: " + ex.getMessage());
                // ignore and continue; request will be unauthorized if endpoint requires auth
            }
        }
        filterChain.doFilter(request, response);
    }
}
