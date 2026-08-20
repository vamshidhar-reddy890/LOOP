package com.loop.tenant;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class TenantService {
    private final JdbcTemplate jdbc;

    public TenantService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void createSchemaForUser(Long userId) {
        if (userId == null) return;
        String schema = "loop_user_" + userId;
        // create schema if not exists
        jdbc.execute("CREATE SCHEMA IF NOT EXISTS " + schema);

        // create minimal tables in that schema if they do not exist
        // feedback table
        jdbc.execute("CREATE TABLE IF NOT EXISTS " + schema + ".feedback (" +
                "id BIGSERIAL PRIMARY KEY, " +
                "content text, " +
                "source varchar(255), " +
                "sentiment varchar(50), " +
                "sentiment_score double precision, " +
                "customer_name varchar(255), " +
                "customer_email varchar(255), " +
                "rating integer, " +
                "created_at timestamptz DEFAULT now()" +
                ")");

        // reports table
        jdbc.execute("CREATE TABLE IF NOT EXISTS " + schema + ".reports (" +
                "id BIGSERIAL PRIMARY KEY, " +
                "title varchar(1024), " +
                "type varchar(255), " +
                "period_start varchar(255), " +
                "period_end varchar(255), " +
                "summary text, " +
                "insights jsonb, " +
                "status varchar(255), " +
                "created_at timestamptz DEFAULT now()" +
                ")");

        // workspaces table
        jdbc.execute("CREATE TABLE IF NOT EXISTS " + schema + ".workspaces (" +
                "id BIGSERIAL PRIMARY KEY, " +
                "name varchar(255), " +
                "description text, " +
                "created_at timestamptz DEFAULT now(), " +
                "member_count integer DEFAULT 1, " +
                "feedback_count integer DEFAULT 0" +
                ")");
    }
}
