package com.loop.config;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**").allowedOrigins(frontendUrl).allowedMethods("GET","POST","PUT","DELETE","OPTIONS").allowCredentials(true);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve static files from the static folder
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        // If the requested resource doesn't exist and it's not an API endpoint,
                        // redirect to index.html for SPA routing
                        Resource resource = super.getResource(resourcePath, location);
                        if (resource == null || !resource.exists()) {
                            if (!resourcePath.startsWith("api")) {
                                return new ClassPathResource("/static/index.html");
                            }
                        }
                        return resource;
                    }
                });
    }
}
