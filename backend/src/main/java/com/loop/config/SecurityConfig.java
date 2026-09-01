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
                        // Public static assets and frontend routes
                        .requestMatchers("/", "/index.html", "/favicon.ico", "/manifest.json", "/robots.txt", 
                                         "/assets/**", "/static/**", "/public/**", "/images/**", "/css/**", "/js/**").permitAll()
                        // SPA routing - allow GET requests without auth for frontend URLs
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/**").permitAll()
                        // API authentication routes - public
                        .requestMatchers("/api/auth/**", "/api/public/**").permitAll()
                        // Documentation
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        // Health check
                        .requestMatchers("/api/ai/health").permitAll()
                        // All other API requests require authentication
                        .requestMatchers("/api/**").authenticated()
                        // Anything else requires authentication
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
