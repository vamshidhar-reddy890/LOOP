package com.loop.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.loop.security.JwtAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthFilter) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Allow all public static assets
                        .requestMatchers(
                                "/",
                                "/index.html",
                                "/favicon.ico",
                                "/manifest.json",
                                "/robots.txt",
                                "/assets/**",
                                "/static/**",
                                "/public/**",
                                "/images/**",
                                "/css/**",
                                "/js/**"
                        ).permitAll()
                        // Allow public API routes
                        .requestMatchers("/api/auth/**", "/api/public/**").permitAll()
                        // Allow API documentation
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        // Allow health check
                        .requestMatchers("/api/ai/health").permitAll()
                        // Require authentication for all other requests
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

