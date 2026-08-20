package com.loop.config;

import com.loop.model.Feedback;
import com.loop.model.Report;
import com.loop.model.User;
import com.loop.model.Workspace;
import com.loop.repository.FeedbackRepository;
import com.loop.repository.ReportRepository;
import com.loop.repository.UserRepository;
import com.loop.repository.WorkspaceRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.List;

@Component
public class SeedDataRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final WorkspaceRepository workspaceRepository;
    private final FeedbackRepository feedbackRepository;
    private final ReportRepository reportRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public SeedDataRunner(UserRepository userRepository, WorkspaceRepository workspaceRepository,
                          FeedbackRepository feedbackRepository, ReportRepository reportRepository) {
        this.userRepository = userRepository;
        this.workspaceRepository = workspaceRepository;
        this.feedbackRepository = feedbackRepository;
        this.reportRepository = reportRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed demo users if empty
        if (userRepository.count() == 0) {
            User admin = new User();
            admin.setName("Admin User");
            admin.setEmail("admin@loop.com");
            admin.setPassword(passwordEncoder.encode("password123"));
            admin.setRole(User.Role.ADMIN);
            userRepository.save(admin);

            User analyst = new User();
            analyst.setName("Analyst User");
            analyst.setEmail("analyst@loop.com");
            analyst.setPassword(passwordEncoder.encode("password123"));
            analyst.setRole(User.Role.ANALYST);
            userRepository.save(analyst);

            User viewer = new User();
            viewer.setName("Viewer User");
            viewer.setEmail("viewer@loop.com");
            viewer.setPassword(passwordEncoder.encode("password123"));
            viewer.setRole(User.Role.VIEWER);
            userRepository.save(viewer);

            System.out.println("SeedDataRunner: Created demo users (admin, analyst, viewer) with password123");
        }

        // 2. Seed default workspaces if empty
        if (workspaceRepository.count() == 0) {
            Workspace ws1 = new Workspace();
            ws1.setName("Northstar Product Workspace");
            ws1.setDescription("Primary customer feedback channel for core SaaS product features.");
            ws1.setMemberCount(4);
            ws1.setFeedbackCount(0);
            workspaceRepository.save(ws1);

            Workspace ws2 = new Workspace();
            ws2.setName("Mobile App Feedback");
            ws2.setDescription("iOS and Android app store reviews, crash reports, and UX feedback.");
            ws2.setMemberCount(2);
            ws2.setFeedbackCount(0);
            workspaceRepository.save(ws2);

            System.out.println("SeedDataRunner: Created default workspaces.");
        }

        // 3. Seed sample feedback items if empty
        if (feedbackRepository.count() == 0) {
            Workspace ws = workspaceRepository.findAll().get(0);

            Feedback f1 = new Feedback();
            f1.setContent("The new dark mode design is absolutely stunning! Very responsive and clean.");
            f1.setSource("APP_REVIEW");
            f1.setSentiment("POSITIVE");
            f1.setSentimentScore(0.95);
            f1.setCustomerName("Alex Morgan");
            f1.setCustomerEmail("alex@techcorp.io");
            f1.setRating(5);
            f1.setThemes(List.of("UI Design", "Dark Mode", "Performance"));
            f1.setWorkspace(ws);
            f1.setCreatedAt(OffsetDateTime.now().minusDays(1));
            feedbackRepository.save(f1);

            Feedback f2 = new Feedback();
            f2.setContent("CSV import failed when uploading large datasets over 10MB. Needs better error messaging.");
            f2.setSource("SUPPORT_TICKET");
            f2.setSentiment("NEGATIVE");
            f2.setSentimentScore(0.20);
            f2.setCustomerName("Sarah Jenkins");
            f2.setCustomerEmail("s.jenkins@acme.com");
            f2.setRating(2);
            f2.setThemes(List.of("CSV Import", "Error Handling", "Scalability"));
            f2.setWorkspace(ws);
            f2.setCreatedAt(OffsetDateTime.now().minusDays(2));
            feedbackRepository.save(f2);

            Feedback f3 = new Feedback();
            f3.setContent("Dashboard analytics look useful, but would love automated weekly PDF report exports.");
            f3.setSource("SURVEY");
            f3.setSentiment("NEUTRAL");
            f3.setSentimentScore(0.55);
            f3.setCustomerName("David Chen");
            f3.setCustomerEmail("dchen@innovate.org");
            f3.setRating(4);
            f3.setThemes(List.of("Analytics", "Exporting", "Automation"));
            f3.setWorkspace(ws);
            f3.setCreatedAt(OffsetDateTime.now().minusDays(3));
            feedbackRepository.save(f3);

            ws.setFeedbackCount(3);
            workspaceRepository.save(ws);
            System.out.println("SeedDataRunner: Created sample feedback records.");
        }

        // 4. Seed sample executive report if empty
        if (reportRepository.count() == 0) {
            Workspace ws = workspaceRepository.findAll().get(0);
            Report report = new Report();
            report.setTitle("Q3 Customer Feedback Executive Summary");
            report.setType("QUARTERLY");
            report.setPeriodStart("2026-07-01");
            report.setPeriodEnd("2026-09-30");
            report.setSummary("Overall positive reception regarding new UI features, with negative feedback concentrated around bulk CSV import error handling.");
            report.setInsights("[{\"category\":\"UI/UX\",\"description\":\"High praise for dark mode themes\",\"impact\":\"HIGH\"}]");
            report.setStatus("COMPLETED");
            report.setWorkspace(ws);
            reportRepository.save(report);
            System.out.println("SeedDataRunner: Created sample executive report.");
        }
    }
}
