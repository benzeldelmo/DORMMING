package com.dormming.config;

import java.io.IOException;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

/**
 * In a deployed build the React app is packed into the jar (classpath:/static). Its files are served
 * as they are, and any other page address (/home, /join/AB12CD) gets index.html, so React's router
 * shows the right screen. /api stays with the controllers. In development Vite serves the app instead.
 */
@Configuration
public class WebAppConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String path, Resource location) throws IOException {
                        Resource file = location.createRelative(path);
                        if (file.exists() && file.isReadable()) {
                            return file;
                        }
                        // the API, and missing files (like an old /assets/x.js after a redeploy), are a real 404;
                        // only page addresses such as /home or /join/AB12CD get the app
                        if (path.startsWith("api/") || path.substring(path.lastIndexOf('/') + 1).contains(".")) {
                            return null;
                        }
                        Resource app = new ClassPathResource("/static/index.html");
                        return app.exists() ? app : null;
                    }
                });
    }
}
