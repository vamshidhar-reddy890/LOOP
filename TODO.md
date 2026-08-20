# Project LOOP - Build Plan

## Phase 1: Frontend Foundation
- [ ] package.json with dependencies
- [ ] vite.config.ts
- [ ] tsconfig.json
- [ ] tailwind.config.js & postcss.config.js
- [ ] index.html
- [ ] src/main.tsx, App.tsx, index.css, env.d.ts

## Phase 2: Frontend Types & Services
- [ ] src/types/index.ts (User, Feedback, Workspace, etc.)
- [ ] src/services/api.ts (Axios instance)
- [ ] src/services/auth.ts (Auth API calls)
- [ ] src/services/feedback.ts (Feedback API calls)
- [ ] src/services/workspace.ts (Workspace API calls)
- [ ] src/services/report.ts (Report API calls)

## Phase 3: Frontend Context & Auth
- [ ] src/context/AuthContext.tsx
- [ ] src/context/FeedbackContext.tsx

## Phase 4: Frontend Components
- [ ] Navbar.tsx
- [ ] Sidebar.tsx
- [ ] ProtectedRoute.tsx
- [ ] FeedbackTable.tsx
- [ ] FeedbackForm.tsx
- [ ] Pagination.tsx
- [ ] SearchBar.tsx
- [ ] FilterDropdown.tsx
- [ ] CSVUpload.tsx
- [ ] StatsCard.tsx
- [ ] PieChart.tsx
- [ ] LineChart.tsx
- [ ] BarChart.tsx

## Phase 5: Frontend Pages
- [ ] Landing.tsx
- [ ] Login.tsx
- [ ] Signup.tsx
- [ ] Dashboard.tsx
- [ ] Feedback.tsx
- [ ] Reports.tsx
- [ ] Settings.tsx
- [ ] Profile.tsx

## Phase 6: Backend Foundation
- [ ] pom.xml
- [ ] application.properties
- [ ] LoopApplication.java (Main class)

## Phase 7: Backend Models & Repositories
- [ ] User.java
- [ ] Feedback.java
- [ ] Workspace.java
- [ ] Theme.java
- [ ] Report.java
- [ ] UserRepository.java
- [ ] FeedbackRepository.java
- [ ] WorkspaceRepository.java
- [ ] ThemeRepository.java
- [ ] ReportRepository.java

## Phase 8: Backend DTOs
- [ ] LoginRequest.java
- [ ] SignupRequest.java
- [ ] AuthResponse.java
- [ ] FeedbackDTO.java
- [ ] WorkspaceDTO.java
- [ ] ReportDTO.java
- [ ] ApiResponse.java
- [ ] PageResponse.java

## Phase 9: Backend Security
- [ ] JwtTokenProvider.java
- [ ] JwtAuthenticationFilter.java
- [ ] CustomUserDetailsService.java
- [ ] SecurityConfig.java

## Phase 10: Backend Services
- [ ] UserService.java
- [ ] FeedbackService.java
- [ ] WorkspaceService.java
- [ ] ReportService.java
- [ ] FileService.java (CSV handling)

## Phase 11: Backend AI Services
- [ ] ClaudeService.java
- [ ] SentimentAnalysisService.java
- [ ] ThemeDetectionService.java

## Phase 12: Backend Controllers
- [ ] AuthController.java
- [ ] FeedbackController.java
- [ ] WorkspaceController.java
- [ ] ReportController.java
- [ ] AIController.java

## Phase 13: Backend Config
- [ ] CorsConfig.java
- [ ] WebConfig.java
- [ ] SeedDataRunner.java (120+ records)

## Phase 14: Integration & Final
- [ ] Verify frontend-backend connection
- [ ] README.md documentation

