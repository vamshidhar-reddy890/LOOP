package com.loop.repository;

import com.loop.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long>, JpaSpecificationExecutor<Feedback> {
    @Query("SELECT f FROM Feedback f WHERE f.workspace.id = :workspaceId")
    List<Feedback> findByWorkspaceId(@Param("workspaceId") Long workspaceId);
}
