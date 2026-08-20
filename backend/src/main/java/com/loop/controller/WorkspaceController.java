package com.loop.controller;

import com.loop.model.Workspace;
import com.loop.repository.WorkspaceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {
    private final WorkspaceRepository workspaceRepository;

    public WorkspaceController(WorkspaceRepository workspaceRepository) {
        this.workspaceRepository = workspaceRepository;
    }

    @GetMapping
    public List<Workspace> all() {
        return workspaceRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Workspace> get(@PathVariable Long id) {
        return workspaceRepository.findById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Workspace> create(@RequestBody Workspace workspace) {
        Workspace saved = workspaceRepository.save(workspace);
        return ResponseEntity.status(201).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Workspace> update(@PathVariable Long id, @RequestBody Workspace body) {
        return workspaceRepository.findById(id).map(ws -> {
            ws.setName(body.getName() != null ? body.getName() : ws.getName());
            ws.setDescription(body.getDescription() != null ? body.getDescription() : ws.getDescription());
            workspaceRepository.save(ws);
            return ResponseEntity.ok(ws);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        workspaceRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
