package com.loop.controller;

import com.loop.model.Feedback;
import com.loop.model.Report;
import com.loop.model.Workspace;
import com.loop.repository.FeedbackRepository;
import com.loop.repository.ReportRepository;
import com.loop.repository.WorkspaceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    private final ReportRepository reportRepository;
    private final WorkspaceRepository workspaceRepository;
    private final FeedbackRepository feedbackRepository;

    public ReportController(ReportRepository reportRepository, WorkspaceRepository workspaceRepository,
                            FeedbackRepository feedbackRepository) {
        this.reportRepository = reportRepository;
        this.workspaceRepository = workspaceRepository;
        this.feedbackRepository = feedbackRepository;
    }

    @GetMapping
    public List<Report> list(@RequestParam(required = false) Long workspaceId) {
        return (List<Report>) (workspaceId != null ? reportRepository.findAll().stream().filter(r -> r.getWorkspace() != null && r.getWorkspace().getId().equals(workspaceId)).toList() : reportRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Report> get(@PathVariable Long id) {
        return reportRepository.findById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/generate")
    public ResponseEntity<Report> generate(@RequestBody Map<String, Object> body) {
        Long workspaceId;
        LocalDate periodStart;
        LocalDate periodEnd;
        try {
            workspaceId = Long.valueOf(body.get("workspaceId").toString());
            periodStart = LocalDate.parse(body.get("periodStart").toString());
            periodEnd = LocalDate.parse(body.get("periodEnd").toString());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
        if (periodEnd.isBefore(periodStart)) {
            return ResponseEntity.badRequest().build();
        }

        Workspace workspace = workspaceRepository.findById(workspaceId).orElse(null);
        if (workspace == null) {
            return ResponseEntity.notFound().build();
        }

        List<Feedback> feedback = feedbackRepository.findByWorkspaceId(workspaceId).stream()
                .filter(item -> item.getCreatedAt() != null)
                .filter(item -> {
                    LocalDate created = item.getCreatedAt().toLocalDate();
                    return !created.isBefore(periodStart) && !created.isAfter(periodEnd);
                })
                .toList();
        long positive = feedback.stream().filter(item -> "POSITIVE".equalsIgnoreCase(item.getSentiment())).count();
        long negative = feedback.stream().filter(item -> "NEGATIVE".equalsIgnoreCase(item.getSentiment())).count();
        String topThemes = feedback.stream()
                .filter(item -> item.getThemes() != null)
                .flatMap(item -> item.getThemes().stream())
                .collect(Collectors.groupingBy(theme -> theme, Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue(Comparator.reverseOrder()))
                .limit(3)
                .map(Map.Entry::getKey)
                .collect(Collectors.joining(", "));

        Report r = new Report();
        String type = String.valueOf(body.getOrDefault("type", "WEEKLY"));
        r.setTitle(String.valueOf(body.getOrDefault("title", type + " customer feedback report")));
        r.setType(type);
        r.setPeriodStart(periodStart.toString());
        r.setPeriodEnd(periodEnd.toString());
        r.setSummary(buildSummary(feedback.size(), positive, negative, topThemes));
        r.setInsights("[]");
        r.setStatus("COMPLETED");
        r.setWorkspace(workspace);
        Report saved = reportRepository.save(r);
        return ResponseEntity.status(201).body(saved);
    }

    private String buildSummary(int total, long positive, long negative, String topThemes) {
        if (total == 0) {
            return "No feedback was recorded for the selected period. Import feedback or choose a period with data to produce insights.";
        }
        String themesSentence = topThemes.isBlank() ? "No recurring themes were tagged." : "Top themes: " + topThemes + ".";
        return String.format("%d feedback items were received: %d positive and %d negative. %s",
                total, positive, negative, themesSentence);
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> getPdf(@PathVariable Long id) {
        var opt = reportRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Report report = opt.get();
        try (java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream()) {
            org.apache.pdfbox.pdmodel.PDDocument doc = new org.apache.pdfbox.pdmodel.PDDocument();
            org.apache.pdfbox.pdmodel.PDPage page = new org.apache.pdfbox.pdmodel.PDPage();
            doc.addPage(page);
            org.apache.pdfbox.pdmodel.PDPageContentStream cs = new org.apache.pdfbox.pdmodel.PDPageContentStream(doc, page);
            org.apache.pdfbox.pdmodel.font.PDFont font = org.apache.pdfbox.pdmodel.font.PDType1Font.HELVETICA;
            int y = 750;
            cs.beginText();
            cs.setFont(font, 16);
            cs.newLineAtOffset(50, y);
            cs.showText(report.getTitle() == null ? "Report" : report.getTitle());
            cs.endText();

            cs.beginText();
            cs.setFont(font, 10);
            cs.newLineAtOffset(50, y - 30);
            cs.showText("Period: " + (report.getPeriodStart() == null ? "" : report.getPeriodStart()) + " - " + (report.getPeriodEnd() == null ? "" : report.getPeriodEnd()));
            cs.endText();

            String summary = report.getSummary() == null ? "" : report.getSummary();
            // split summary into lines of ~80 chars
            java.util.List<String> lines = new java.util.ArrayList<>();
            for (int i = 0; i < summary.length(); i += 80) {
                lines.add(summary.substring(i, Math.min(i + 80, summary.length())));
            }
            int offset = 0;
            for (String line : lines) {
                cs.beginText();
                cs.setFont(font, 12);
                cs.newLineAtOffset(50, y - 80 - (offset * 14));
                cs.showText(line);
                cs.endText();
                offset++;
            }

            cs.close();
            doc.save(baos);
            doc.close();
            byte[] pdfBytes = baos.toByteArray();
            return ResponseEntity.ok()
                    .header("Content-Type", "application/pdf")
                    .header("Content-Disposition", "attachment; filename=report_" + id + ".pdf")
                    .body(pdfBytes);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        reportRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
