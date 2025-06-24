package com.dialectgame.service.auth;

import com.dialectgame.model.dto.auth.AuthResponse;
import com.dialectgame.model.dto.auth.LoginRequest;
import com.dialectgame.model.dto.auth.RegisterRequest;
import com.dialectgame.model.dto.user.UserDto;
import com.dialectgame.model.entity.User;
import com.dialectgame.repository.UserRepository;
import com.dialectgame.service.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserMapper userMapper;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering new user: {}", request.getUsername());

        // Vérifier si l'utilisateur existe déjà
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AuthException("Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AuthException("Email already exists");
        }

        // Créer le nouvel utilisateur
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .preferredLanguage(request.getPreferredLanguage())
                .difficultyLevel(request.getDifficultyLevel())
                .voiceEnabled(request.getVoiceEnabled())
                .roles(Set.of(User.Role.USER))
                .isActive(true)
                .build();

        user = userRepository.save(user);

        // Générer les tokens
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        UserDto userDto = userMapper.toDto(user);

        log.info("User registered successfully: {}", user.getUsername());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(jwtService.getAccessTokenExpiration())
                .user(userDto)
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        log.info("User login attempt: {}", request.getIdentifier());

        // Authentifier l'utilisateur
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getIdentifier(), request.getPassword())
        );

        User user = (User) authentication.getPrincipal();

        // Générer les tokens
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        UserDto userDto = userMapper.toDto(user);

        log.info("User logged in successfully: {}", user.getUsername());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(jwtService.getAccessTokenExpiration())
                .user(userDto)
                .build();
    }

    public AuthResponse refreshToken(String refreshToken) {
        log.debug("Refreshing token");

        if (!jwtService.isValidRefreshToken(refreshToken)) {
            throw new AuthException("Invalid refresh token");
        }

        String username = jwtService.extractUsername(refreshToken);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AuthException("User not found"));

        if (!user.getIsActive()) {
            throw new AuthException("User account is deactivated");
        }

        // Générer un nouveau access token
        String newAccessToken = jwtService.generateAccessToken(user);
        UserDto userDto = userMapper.toDto(user);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken) // Garder le même refresh token
                .expiresIn(jwtService.getAccessTokenExpiration())
                .user(userDto)
                .build();
    }

    public void logout(String token) {
        log.debug("User logout");
        // Ajouter le token à une blacklist si nécessaire
        jwtService.invalidateToken(token);
    }

    public static class AuthException extends RuntimeException {
        public AuthException(String message) {
            super(message);
        }
    }
}