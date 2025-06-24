package com.dialectgame.service.auth;

import com.dialectgame.model.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class JwtService {

    private final SecretKey secretKey;
    private final long accessTokenExpiration;
    private final long refreshTokenExpiration;
    private final Set<String> blacklistedTokens = ConcurrentHashMap.newKeySet();

    public JwtService(
            @Value("${spring.security.jwt.secret}") String secret,
            @Value("${spring.security.jwt.expiration}") long accessTokenExpiration,
            @Value("${spring.security.jwt.refresh-expiration}") long refreshTokenExpiration) {
        
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes());
        this.accessTokenExpiration = accessTokenExpiration;
        this.refreshTokenExpiration = refreshTokenExpiration;
    }

    public String generateAccessToken(User user) {
        Instant now = Instant.now();
        Instant expiration = now.plus(accessTokenExpiration, ChronoUnit.MILLIS);

        return Jwts.builder()
                .setSubject(user.getUsername())
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expiration))
                .claim("userId", user.getId())
                .claim("email", user.getEmail())
                .claim("roles", user.getRoles())
                .claim("type", "access")
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(User user) {
        Instant now = Instant.now();
        Instant expiration = now.plus(refreshTokenExpiration, ChronoUnit.MILLIS);

        return Jwts.builder()
                .setSubject(user.getUsername())
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expiration))
                .claim("userId", user.getId())
                .claim("type", "refresh")
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    public Long extractUserId(String token) {
        return extractClaims(token).get("userId", Long.class);
    }

    public boolean isValidAccessToken(String token) {
        try {
            Claims claims = extractClaims(token);
            String tokenType = claims.get("type", String.class);
            return "access".equals(tokenType) && !isTokenExpired(claims) && !isTokenBlacklisted(token);
        } catch (JwtException e) {
            log.debug("Invalid access token: {}", e.getMessage());
            return false;
        }
    }

    public boolean isValidRefreshToken(String token) {
        try {
            Claims claims = extractClaims(token);
            String tokenType = claims.get("type", String.class);
            return "refresh".equals(tokenType) && !isTokenExpired(claims) && !isTokenBlacklisted(token);
        } catch (JwtException e) {
            log.debug("Invalid refresh token: {}", e.getMessage());
            return false;
        }
    }

    public void invalidateToken(String token) {
        blacklistedTokens.add(token);
    }

    public long getAccessTokenExpiration() {
        return accessTokenExpiration;
    }

    private Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private boolean isTokenExpired(Claims claims) {
        return claims.getExpiration().before(new Date());
    }

    private boolean isTokenBlacklisted(String token) {
        return blacklistedTokens.contains(token);
    }
}