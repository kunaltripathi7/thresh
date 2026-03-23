package com.cdn.thresh_backend;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.beans.BeanProperty;
import java.io.IOException;

@Configuration
public class WebConfig {

    @Bean
    public Filter addGlobalHeaderFilter() {
        return new Filter() {
            @Override
            public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) {
                if (response instanceof HttpServletResponse httpServletResponse) {
                    httpServletResponse.setHeader("X-Served-By", "origin");
                }
                chain.doFilter(request, response);
            }
        };
    }

    @Bean
    public Filter edgeAuthFilter(@Value("${edge.secret}") String edgeSecret) {
        return new Filter() {
            @Override
            public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
                    throws IOException, ServletException {

                HttpServletRequest httpRequest = (HttpServletRequest) request;
                HttpServletResponse httpResponse = (HttpServletResponse) response;

                String incomingToken = httpRequest.getHeader("X-Edge-Token");

                if (incomingToken == null || !incomingToken.equals(edgeSecret)) {
                    httpResponse.setStatus(403);
                    httpResponse.getWriter().write("Forbidden: Invalid Edge Token");
                    return;
                }

                chain.doFilter(request, response);
            }
        };
    }
}
