package com.loop.controller;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class FallbackController implements ErrorController {

    /**
     * Handles the /error endpoint by returning index.html for SPA routing
     */
    @RequestMapping("/error")
    public String handleError() {
        return "forward:/index.html";
    }

    /**
     * Fallback for unmatched routes - returns index.html so React Router handles them
     */
    @GetMapping(value = "/**", produces = "text/html")
    public String forward() {
        return "forward:/index.html";
    }
}
