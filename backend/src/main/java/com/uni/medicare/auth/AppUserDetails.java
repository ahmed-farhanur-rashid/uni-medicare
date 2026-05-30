package com.uni.medicare.auth;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Unified principal for both students and staff.
 * Spring Security uses this throughout the filter chain.
 */
public class AppUserDetails implements UserDetails {

    private final int id;
    private final String password;
    private final String role;   // e.g. DOCTOR, STUDENT, ADMIN
    private final String type;   // "student" or "staff"
    private final boolean active;

    public AppUserDetails(int id, String password, String role, String type, boolean active) {
        this.id = id;
        this.password = password;
        this.role = role;
        this.type = type;
        this.active = active;
    }

    public int getId()     { return id; }
    public String getRole() { return role; }
    public String getType() { return type; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Spring Security @PreAuthorize uses "ROLE_" prefix
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override public String getPassword()   { return password; }
    @Override public String getUsername()   { return String.valueOf(id); }
    @Override public boolean isEnabled()    { return active; }
    @Override public boolean isAccountNonExpired()     { return true; }
    @Override public boolean isAccountNonLocked()      { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
}
