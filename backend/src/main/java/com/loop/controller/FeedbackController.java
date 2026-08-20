package com.loop.controller;

import com.loop.model.Feedback;
import com.loop.model.Workspace;
import com.loop.repository.FeedbackRepository;
import com.loop.repository.WorkspaceRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/feedback","/api/feedbacks"})
public class FeedbackController {

    private final FeedbackRepository feedbackRepository;
    private final WorkspaceRepository workspaceRepository;

    public FeedbackController(FeedbackRepository feedbackRepository, WorkspaceRepository workspaceRepository) {
        this.feedbackRepository = feedbackRepository;
        this.workspaceRepository = workspaceRepository;
    }

    @GetMapping
    public Map<String, Object> list(
            @RequestParam(name = "page") Optional<Integer> page,
            @RequestParam(name = "size") Optional<Integer> size,
            @RequestParam(name = "search") Optional<String> search,
            @RequestParam(name = "sentiment") Optional<String> sentiment,
            @RequestParam(name = "source") Optional<String> source,
            @RequestParam(name = "workspaceId") Optional<Long> workspaceId
    ) {
        int p = page.orElse(0);
        int s = size.orElse(10);
        var pr = PageRequest.of(p, s, Sort.by(Sort.Direction.DESC, "createdAt"));
        Specification<Feedback> spec = buildSpecification(search, sentiment, source, workspaceId);
        var pg = feedbackRepository.findAll(spec, pr);
        return Map.of(
                "content", pg.getContent(),
                "totalPages", pg.getTotalPages(),
                "totalElements", pg.getTotalElements(),
                "size", pg.getSize(),
                "number", pg.getNumber(),
                "first", pg.isFirst(),
                "last", pg.isLast()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Feedback> get(@PathVariable Long id) {
        return feedbackRepository.findById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Feedback> create(@RequestBody Map<String, Object> body) {
        Feedback f = buildFeedbackFromBody(body);
        Feedback saved = feedbackRepository.save(f);
        updateWorkspaceFeedbackCount(saved.getWorkspace());
        return ResponseEntity.status(201).body(saved);
    }

    @PostMapping(path = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> importCsv(@RequestParam("file") MultipartFile file,
                                                         @RequestParam("workspaceId") Long workspaceId) throws IOException {
        var workspace = workspaceRepository.findById(workspaceId).orElse(null);
        if (workspace == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Workspace not found"));
        }

        String originalFilename = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase();

        // Accept CSV or other documents. If CSV -> parse rows; otherwise extract text and create one feedback
        boolean isCsv = originalFilename.endsWith(".csv") || contentType.contains("csv") || originalFilename.endsWith(".tsv");

        if (!isCsv) {
            // If the uploaded file is an image, store the file as an attachment and create a placeholder feedback
            if (contentType.startsWith("image/")) {
                try {
                    java.nio.file.Path uploadDir = java.nio.file.Paths.get("uploads", "workspace_" + workspaceId);
                    java.nio.file.Files.createDirectories(uploadDir);
                    String filename = java.util.UUID.randomUUID().toString() + "_" + (originalFilename.isEmpty() ? "image" : originalFilename);
                    java.nio.file.Path out = uploadDir.resolve(filename);
                    try (var in = file.getInputStream()) {
                        java.nio.file.Files.copy(in, out, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                    }

                    Feedback feedback = new Feedback();
                    feedback.setContent("");
                    feedback.setSource(filename);
                    feedback.setSentiment("NEUTRAL");
                    feedback.setSentimentScore(0.5);
                    feedback.setCustomerName(null);
                    feedback.setCustomerEmail(null);
                    feedback.setRating(3);
                    feedback.setWorkspace(workspace);
                    feedback.setCreatedAt(OffsetDateTime.now());
                    feedbackRepository.save(feedback);
                    updateWorkspaceFeedbackCount(workspace);
                    return ResponseEntity.ok(Map.of("totalRows", 1, "importedRows", 1, "errors", List.of()));
                } catch (Exception ex) {
                    return ResponseEntity.status(500).body(Map.of("error", "Failed to save image file: " + ex.getMessage()));
                }
            }

            // For other document types, use Apache Tika to extract text (e.g., PDF, DOCX)
            org.apache.tika.Tika tika = new org.apache.tika.Tika();
            try {
                String text = tika.parseToString(file.getInputStream());
                Feedback feedback = new Feedback();
                feedback.setContent(text == null ? "" : text.trim());
                feedback.setSource(originalFilename.isEmpty() ? "FILE_UPLOAD" : originalFilename);
                feedback.setSentiment("NEUTRAL");
                feedback.setSentimentScore(0.5);
                feedback.setCustomerName(null);
                feedback.setCustomerEmail(null);
                feedback.setRating(3);
                feedback.setWorkspace(workspace);
                feedback.setCreatedAt(OffsetDateTime.now());
                feedbackRepository.save(feedback);
                updateWorkspaceFeedbackCount(workspace);
                return ResponseEntity.ok(Map.of("totalRows", 1, "importedRows", 1, "errors", List.of()));
            } catch (Exception ex) {
                return ResponseEntity.status(500).body(Map.of("error", "Failed to parse file: " + ex.getMessage()));
            }
        }

        // existing CSV handling follows

        try (var reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String headerLine = reader.readLine();
            if (headerLine == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Empty CSV file"));
            }
            List<String> headers = parseCsvLine(headerLine).stream()
                    .map(String::trim)
                    .map(header -> header.replace("\uFEFF", ""))
                    .map(String::toLowerCase)
                    .collect(Collectors.toList());
            List<Feedback> imported = new ArrayList<>();
            List<String> errors = new ArrayList<>();
            String line;
            int row = 1;
            while ((line = reader.readLine()) != null) {
                row++;
                if (line.isBlank()) {
                    continue;
                }
                List<String> values = parseCsvLine(line);
                if (values.isEmpty()) {
                    continue;
                }
                var valuesByHeader = new HashMap<String, String>();
                for (int i = 0; i < headers.size() && i < values.size(); i++) {
                    valuesByHeader.put(headers.get(i), values.get(i).trim());
                }
                try {
                    Feedback feedback = new Feedback();
                    feedback.setContent(valuesByHeader.getOrDefault("content", valuesByHeader.getOrDefault("feedback", "")).trim());
                    feedback.setSource(valuesByHeader.getOrDefault("source", "SUPPORT_TICKET"));
                    feedback.setSentiment(valuesByHeader.getOrDefault("sentiment", "NEUTRAL"));
                    feedback.setSentimentScore(parseDouble(valuesByHeader.get("sentimentscore"), 0.5));
                    feedback.setCustomerName(valuesByHeader.getOrDefault("customername", valuesByHeader.getOrDefault("customer_name", null)));
                    feedback.setCustomerEmail(valuesByHeader.getOrDefault("customeremail", valuesByHeader.getOrDefault("customer_email", null)));
                    feedback.setRating(parseInteger(valuesByHeader.get("rating"), 3));
                    feedback.setWorkspace(workspace);
                    feedback.setCreatedAt(OffsetDateTime.now());
                    imported.add(feedback);
                } catch (Exception e) {
                    errors.add("Row " + row + ": " + e.getMessage());
                }
            }
            feedbackRepository.saveAll(imported);
            updateWorkspaceFeedbackCount(workspace);
            return ResponseEntity.ok(Map.of(
                    "totalRows", row - 1,
                    "importedRows", imported.size(),
                    "errors", errors
            ));
        }
    }

    @GetMapping("/stats")
    public Map<String, Object> stats(@RequestParam(name = "workspaceId") Optional<Long> workspaceId) {
        List<Feedback> allFeedback = workspaceId.map(feedbackRepository::findByWorkspaceId).orElseGet(feedbackRepository::findAll);
        long totalFeedback = allFeedback.size();
        long positiveCount = countBySentiment(allFeedback, "POSITIVE");
        long neutralCount = countBySentiment(allFeedback, "NEUTRAL");
        long negativeCount = countBySentiment(allFeedback, "NEGATIVE");

        List<Map<String, Object>> sentimentDistribution = List.of(
                Map.of("name", "POSITIVE", "value", positiveCount, "color", "#10B981"),
                Map.of("name", "NEUTRAL", "value", neutralCount, "color", "#60A5FA"),
                Map.of("name", "NEGATIVE", "value", negativeCount, "color", "#EF4444")
        );

        List<Map<String, Object>> feedbackTrend = buildFeedbackTrend(allFeedback);
        List<Map<String, Object>> themeDistribution = buildThemeDistribution(allFeedback);
        List<Feedback> recentFeedback = allFeedback.stream()
                .sorted(Comparator.comparing(Feedback::getCreatedAt).reversed())
                .limit(5)
                .collect(Collectors.toList());

        return Map.of(
                "totalFeedback", totalFeedback,
                "positiveCount", positiveCount,
                "neutralCount", neutralCount,
                "negativeCount", negativeCount,
                "sentimentDistribution", sentimentDistribution,
                "feedbackTrend", feedbackTrend,
                "themeDistribution", themeDistribution,
                "recentFeedback", recentFeedback
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Feedback> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return feedbackRepository.findById(id).map(existing -> {
            if (body.containsKey("content")) existing.setContent((String) body.get("content"));
            if (body.containsKey("sentiment")) existing.setSentiment((String) body.get("sentiment"));
            if (body.containsKey("rating")) existing.setRating(Integer.valueOf(body.get("rating").toString()));
            feedbackRepository.save(existing);
            return ResponseEntity.ok(existing);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        feedbackRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private Specification<Feedback> buildSpecification(Optional<String> search, Optional<String> sentiment,
                                                       Optional<String> source, Optional<Long> workspaceId) {
        return (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            workspaceId.ifPresent(id -> predicates.add(cb.equal(root.get("workspace").get("id"), id)));
            sentiment.ifPresent(s -> predicates.add(cb.equal(root.get("sentiment"), s)));
            source.ifPresent(s -> predicates.add(cb.equal(root.get("source"), s)));
            search.ifPresent(queryText -> {
                String pattern = "%" + queryText.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("content")), pattern),
                        cb.like(cb.lower(root.get("customerName")), pattern),
                        cb.like(cb.lower(root.get("customerEmail")), pattern)
                ));
            });
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    private Feedback buildFeedbackFromBody(Map<String, Object> body) {
        Feedback f = new Feedback();
        f.setContent((String) body.getOrDefault("content", ""));
        f.setSource((String) body.getOrDefault("source", "SUPPORT_TICKET"));
        f.setSentiment((String) body.getOrDefault("sentiment", "NEUTRAL"));
        f.setSentimentScore(Double.valueOf(body.getOrDefault("sentimentScore", 0.5).toString()));
        f.setCustomerName((String) body.getOrDefault("customerName", null));
        f.setCustomerEmail((String) body.getOrDefault("customerEmail", null));
        f.setRating(Integer.valueOf(body.getOrDefault("rating", 3).toString()));
        Long workspaceId = Long.valueOf(body.getOrDefault("workspaceId", 1).toString());
        Workspace w = workspaceRepository.findById(workspaceId).orElse(null);
        f.setWorkspace(w);
        f.setCreatedAt(OffsetDateTime.now());
        return f;
    }

    private void updateWorkspaceFeedbackCount(Workspace workspace) {
        if (workspace == null) {
            return;
        }
        int count = (int) feedbackRepository.findAll().stream()
                .filter(fe -> fe.getWorkspace() != null && fe.getWorkspace().getId().equals(workspace.getId()))
                .count();
        workspace.setFeedbackCount(count);
        workspaceRepository.save(workspace);
    }

    private long countBySentiment(List<Feedback> feedbacks, String sentiment) {
        return feedbacks.stream().filter(f -> sentiment.equals(f.getSentiment())).count();
    }

    private List<Map<String, Object>> buildFeedbackTrend(List<Feedback> feedbacks) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        Map<String, Long> counts = feedbacks.stream()
                .map(Feedback::getCreatedAt)
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(date -> date.toLocalDate().format(formatter), Collectors.counting()));

        List<String> days = new ArrayList<>();
        var now = OffsetDateTime.now();
        for (int i = 6; i >= 0; i--) {
            days.add(now.minusDays(i).toLocalDate().format(formatter));
        }

        return days.stream()
                .map(day -> Map.<String, Object>of("date", day, "count", counts.getOrDefault(day, 0L), "sentiment", ""))
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> buildThemeDistribution(List<Feedback> feedbacks) {
        Map<String, Long> counts = feedbacks.stream()
                .filter(fe -> fe.getThemes() != null)
                .flatMap(fe -> fe.getThemes().stream())
                .collect(Collectors.groupingBy(theme -> theme, Collectors.counting()));

        return counts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(entry -> Map.<String, Object>of("name", entry.getKey(), "count", entry.getValue()))
                .collect(Collectors.toList());
    }

    private List<String> parseCsvLine(String line) {
        List<String> result = new ArrayList<>();
        if (line == null) return result;
        StringBuilder sb = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    // escaped quote
                    sb.append('"');
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (c == ',' && !inQuotes) {
                result.add(sb.toString().trim());
                sb.setLength(0);
            } else {
                sb.append(c);
            }
        }
        result.add(sb.toString().trim());
        return result;
    }

    private double parseDouble(String value, double defaultValue) {
        if (value == null || value.isBlank()) {
            return defaultValue;
        }
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    private int parseInteger(String value, int defaultValue) {
        if (value == null || value.isBlank()) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }
}
