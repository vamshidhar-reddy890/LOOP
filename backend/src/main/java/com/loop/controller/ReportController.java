package com.loop.controller;

import com.loop.model.Report;
import com.loop.model.Workspace;
import com.loop.repository.ReportRepository;
import com.loop.repository.WorkspaceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    private final ReportRepository reportRepository;
    private final WorkspaceRepository workspaceRepository;

    public ReportController(ReportRepository reportRepository, WorkspaceRepository workspaceRepository) {
        this.reportRepository = reportRepository;
        this.workspaceRepository = workspaceRepository;
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
        Report r = new Report();
        r.setTitle((String) body.getOrDefault("title", body.getOrDefault("type", "Report")));
        r.setType((String) body.getOrDefault("type", "WEEKLY"));
        r.setPeriodStart((String) body.getOrDefault("periodStart", ""));
        r.setPeriodEnd((String) body.getOrDefault("periodEnd", ""));
        r.setSummary((String) body.getOrDefault("summary", "Auto-generated report."));
        // notes: DB column 'insights' is jsonb; avoid inserting a plain string literal which causes a type error
        // default to null when insights not provided so Hibernate/Postgres won't attempt to cast a string to jsonb
        // ensure insights has a safe default that matches DB expectations
        r.setInsights("[]");
        r.setStatus("COMPLETED");
        Long workspaceId = Long.valueOf(body.getOrDefault("workspaceId", 1).toString());
        Workspace w = workspaceRepository.findById(workspaceId).orElse(null);
        r.setWorkspace(w);
        Report saved = reportRepository.save(r);
        return ResponseEntity.status(201).body(saved);
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
