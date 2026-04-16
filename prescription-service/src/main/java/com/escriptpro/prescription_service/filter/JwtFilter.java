package com.escriptpro.prescription_service.filter;

import com.escriptpro.prescription_service.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String authorizationHeader = request.getHeader("Authorization");

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7);

            if (jwtUtil.validateToken(token)
                    && SecurityContextHolder.getContext().getAuthentication() == null) {
                String username = jwtUtil.extractUsername(token);
                String role = jwtUtil.extractRole(token);
                Long doctorId = jwtUtil.extractDoctorId(token);

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                username,
                                null,
                                role == null || role.isBlank()
                                        ? List.of()
                                        : List.of(new SimpleGrantedAuthority(role))
                        );

                authentication.setDetails(buildAuthenticationDetails(request, role, doctorId));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }

    private Map<String, Object> buildAuthenticationDetails(
            HttpServletRequest request,
            String role,
            Long doctorId) {
        Map<String, Object> details = new LinkedHashMap<>();
        details.put("remoteAddress", request.getRemoteAddr());
        details.put("sessionId", request.getRequestedSessionId());
        details.put("role", role);
        details.put("doctorId", doctorId);
        return details;
    }
}
