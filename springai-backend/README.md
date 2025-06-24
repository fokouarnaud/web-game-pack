# Spring AI Dialect Game Backend

## Overview

Backend API for the Dialect Game language learning application, powered by Spring AI for intelligent conversation and voice processing capabilities.

## Features

- **Spring AI Integration**: Multi-provider AI support (OpenAI, Anthropic, Ollama)
- **Voice Processing**: Audio transcription and pronunciation analysis
- **User Management**: JWT-based authentication and authorization
- **Lesson Management**: Structured language learning content
- **Progress Tracking**: Detailed user progression analytics
- **RESTful API**: Comprehensive REST endpoints with OpenAPI documentation

## Technology Stack

- **Framework**: Spring Boot 3.2+
- **AI**: Spring AI Framework
- **Database**: PostgreSQL (production) / H2 (development)
- **Security**: Spring Security 6 with JWT
- **Documentation**: OpenAPI 3 / Swagger UI
- **Testing**: JUnit 5, TestContainers

## Quick Start

### Prerequisites

- Java 21+
- Gradle 8+
- Docker (for Ollama)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd springai-backend
   ```

2. **Install Ollama (for local AI)**
   ```bash
   # Install Ollama
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Pull models
   ollama pull llama3.1
   ollama pull mistral
   ```

3. **Configure environment variables**
   ```bash
   export OPENAI_API_KEY=your_openai_key_here
   export ANTHROPIC_API_KEY=your_anthropic_key_here
   ```

4. **Run the application**
   ```bash
   ./gradlew bootRun
   ```

The API will be available at `http://localhost:8080/api`

## Configuration

### AI Providers

The application supports multiple AI providers configured via `application.yml`:

```yaml
app:
  ai:
    provider: ollama          # Primary: ollama, openai, anthropic
    fallback-provider: openai # Fallback provider
    enable-fallback: true     # Enable fallback on primary failure
```

### Database

- **Development**: H2 in-memory database
- **Production**: PostgreSQL

Configure database connection in `application-production.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/dialectgame
    username: dialectgame
    password: your_password
```

## API Documentation

### Swagger UI
Access interactive API documentation at: `http://localhost:8080/api/swagger-ui.html`

### Core Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token

#### Lessons
- `GET /lessons` - Get all lessons (with filters)
- `GET /lessons/{id}` - Get lesson by ID
- `GET /lessons/{id}/content` - Get lesson with full content

#### Voice Processing
- `POST /voice/process` - Process audio for speech recognition
- `GET /voice/sessions` - Get user voice sessions

#### Progress
- `GET /progress` - Get user progress
- `POST /progress` - Update lesson progress

## AI Features

### Voice Processing
- Audio transcription using OpenAI Whisper
- Pronunciation accuracy scoring
- Real-time feedback generation
- Support for multiple audio formats (MP3, WAV, M4A, OGG)

### Conversation AI
- Context-aware dialogue management
- Educational feedback generation
- Multi-language support
- Adaptive difficulty adjustment

### Content Generation
- Dynamic lesson content creation
- Personalized exercise generation
- Vocabulary expansion

## Development

### Running Tests
```bash
./gradlew test
```

### Code Style
The project follows standard Spring Boot conventions and uses:
- Lombok for boilerplate reduction
- MapStruct for object mapping
- SLF4J for logging

### Database Migrations
Database schema is managed via JPA/Hibernate with:
- Development: `ddl-auto: create-drop`
- Production: `ddl-auto: validate` with Flyway migrations

## Deployment

### Docker
```bash
# Build image
docker build -t dialectgame-backend .

# Run container
docker run -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=production \
  -e DB_HOST=your_db_host \
  -e OPENAI_API_KEY=your_key \
  dialectgame-backend
```

### Health Checks
Monitor application health at `/actuator/health`

## Security

- JWT-based stateless authentication
- Password encryption with BCrypt
- CORS configuration for frontend integration
- Role-based access control (USER, ADMIN, TEACHER)

## Monitoring

The application includes:
- Actuator endpoints for health monitoring
- Structured logging with correlation IDs
- Performance metrics collection
- Error tracking and reporting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure code follows project conventions
5. Submit a pull request

## License

This project is licensed under the MIT License.