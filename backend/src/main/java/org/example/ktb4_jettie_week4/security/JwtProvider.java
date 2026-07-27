package org.example.ktb4_jettie_week4.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtProvider {

    private static final String SECRET_KEY =
            "my-super-secret-key-for-jwt-authentication-123456";

    private static final long ACCESS_TOKEN_EXPIRE_TIME = 1000 * 60 * 60;

    private final SecretKey key = Keys.hmacShaKeyFor( // 시크릿키 객체 생성
            SECRET_KEY.getBytes(StandardCharsets.UTF_8)
    );

    public String createAccessToken(String email) {
        Date now = new Date(); // 현재 시간
        Date expireDate = new Date(now.getTime() + ACCESS_TOKEN_EXPIRE_TIME); // 만료 시간

        return Jwts.builder()
                .subject(email)
                .issuedAt(now)
                .expiration(expireDate)
                .signWith(key)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);

            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }
}