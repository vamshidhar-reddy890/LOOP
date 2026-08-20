package com.loop.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.loop.model.User;
import com.loop.repository.UserRepository;
import com.loop.security.JwtUtil;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final com.loop.tenant.TenantService tenantService;

    public AuthController(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder, JwtUtil jwtUtil, com.loop.tenant.TenantService tenantService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.tenantService = tenantService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and password are required."));
        }

        return userRepository.findByEmail(email.trim())
                .map(user -> {
                    if (passwordEncoder.matches(password, user.getPassword())) {
                        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
                        return ResponseEntity.ok(Map.of(
                                "token", token,
                                "user", Map.of(
                                        "id", user.getId(),
                                        "name", user.getName(),
                                        "email", user.getEmail(),
                                        "role", user.getRole() != null ? user.getRole().name() : User.Role.VIEWER.name(),
                                        "createdAt", user.getCreatedAt()
                                )
                        ));
                    }
                    return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials."));
                }).orElseGet(() -> ResponseEntity.status(401).body(Map.of("message", "Invalid credentials.")));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String email = body.get("email");
        String password = body.get("password");
        String roleStr = body.get("role");

        if (name == null || name.isBlank() || email == null || email.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Name, email and password are required."));
        }

        String normalizedEmail = email.trim();
        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            return ResponseEntity.status(409).body(Map.of("message", "A user with that email already exists."));
        }

        User user = new User();
        user.setName(name.trim());
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(password));

        User.Role role = User.Role.VIEWER;
        if (roleStr != null && !roleStr.isBlank()) {
            try {
                role = User.Role.valueOf(roleStr.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                role = User.Role.VIEWER;
            }
        }
        user.setRole(role);

        userRepository.save(user);

        try {
            tenantService.createSchemaForUser(user.getId());
        } catch (Exception ex) {
            System.out.println("Error creating tenant schema for user " + user.getId() + ": " + ex.getMessage());
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return ResponseEntity.ok(Map.of(
                "token", token,
                "user", Map.of(
                        "id", user.getId(),
                        "name", user.getName(),
                        "email", user.getEmail(),
                        "role", user.getRole().name(),
                        "createdAt", user.getCreatedAt()
                )
        ));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole() != null ? user.getRole().name() : "VIEWER",
                "createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : ""
        ));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                           @RequestBody Map<String, String> body) {
        User user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        if (body.containsKey("name") && body.get("name") != null) {
            user.setName(body.get("name"));
        }
        userRepository.save(user);
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole() != null ? user.getRole().name() : "VIEWER",
                "createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : ""
        ));
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                            @RequestBody Map<String, String> body) {
        User user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        String oldPassword = body.get("oldPassword");
        String newPassword = body.get("newPassword");
        if (oldPassword == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Old password and new password are required."));
        }
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Incorrect current password."));
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Password updated successfully."));
    }

    private User getAuthenticatedUser(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtUtil.validateToken(token)) {
                Long userId = jwtUtil.getUserIdFromToken(token);
                if (userId != null) {
                    return userRepository.findById(userId).orElse(null);
                }
            }
        }
        return null;
    }
}
