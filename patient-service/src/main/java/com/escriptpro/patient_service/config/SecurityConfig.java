package com.escriptpro.patient_service.config;

import com.escriptpro.patient_service.filter.JwtFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/health", "/error").permitAll()
                        .requestMatchers("/calendar/google/callback").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/patients")
                        .hasAnyAuthority("DOCTOR", "RECEPTIONIST")
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/patients", "/patients/*", "/patients/search", "/patients/appointments")
                        .hasAnyAuthority("DOCTOR", "RECEPTIONIST")
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/patients/*/calendar.ics")
                        .hasAnyAuthority("DOCTOR", "RECEPTIONIST")
                        .requestMatchers(org.springframework.http.HttpMethod.PUT, "/patients/*")
                        .hasAuthority("DOCTOR")
                        .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/patients/*")
                        .hasAuthority("DOCTOR")
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/calendar/google/connect", "/calendar/google/status")
                        .hasAuthority("DOCTOR")
                        .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/calendar/google/disconnect")
                        .hasAuthority("DOCTOR")
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/calendar/google/sync/patients/*")
                        .hasAnyAuthority("DOCTOR", "RECEPTIONIST")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> {
            throw new UsernameNotFoundException("User not found");
        };
    }
}
