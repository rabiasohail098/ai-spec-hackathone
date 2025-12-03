# Database Models Specification

## Overview
This document specifies the database models for the PostgreSQL database used in the Physical AI & Humanoid Robotics RAG Chatbot system.

## Database Configuration

### Connection
- Database: PostgreSQL (Neon Serverless)
- Connection string format: `postgresql://username:password@host:port/database?sslmode=require`
- SSL mode: `require` (mandatory encryption)

## User Model

### Table: `users`
**Purpose**: Store user information for personalized experiences

#### Fields
| Name | Type | Constraints | Description |
|------|------|-------------|-------------|
| id | Integer | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| email | String(255) | UNIQUE, NULLABLE | User's email address |
| username | String(255) | UNIQUE, NULLABLE | User's chosen username |
| created_at | DateTime | NOT NULL | Timestamp of user creation |

#### Example Record
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "robotics_enthusiast",
  "created_at": "2025-01-15T10:30:00Z"
}
```

## Conversation Model

### Table: `conversations`
**Purpose**: Group related messages into conversation threads

#### Fields
| Name | Type | Constraints | Description |
|------|------|-------------|-------------|
| id | Integer | PRIMARY KEY, AUTO_INCREMENT | Unique conversation identifier |
| user_id | Integer | FOREIGN KEY (users.id) | Reference to user who owns conversation |
| title | String(500) | NOT NULL | Auto-generated title for the conversation |
| created_at | DateTime | NOT NULL | Timestamp of conversation creation |

#### Relationships
- One-to-many with `messages` (one conversation can have many messages)
- Many-to-one with `users` (many conversations belong to one user)

#### Example Record
```json
{
  "id": 1,
  "user_id": 1,
  "title": "Digital Twins in Robotics",
  "created_at": "2025-01-15T10:35:00Z"
}
```

## Message Model

### Table: `messages`
**Purpose**: Store individual messages within conversations

#### Fields
| Name | Type | Constraints | Description |
|------|------|-------------|-------------|
| id | Integer | PRIMARY KEY, AUTO_INCREMENT | Unique message identifier |
| conversation_id | Integer | FOREIGN KEY (conversations.id) | Reference to parent conversation |
| content | Text | NOT NULL | Message content/text |
| role | String(10) | NOT NULL | 'user' or 'assistant' |
| timestamp | DateTime | NOT NULL | Timestamp of message creation |

#### Relationships
- Many-to-one with `conversations` (many messages belong to one conversation)

#### Example Record
```json
{
  "id": 1,
  "conversation_id": 1,
  "content": "Explain how digital twins work in robotics?",
  "role": "user",
  "timestamp": "2025-01-15T10:35:15Z"
}
```

## Document Model

### Table: `documents`
**Purpose**: Store document metadata for the RAG system (for future reference)

#### Fields
| Name | Type | Constraints | Description |
|------|------|-------------|-------------|
| id | Integer | PRIMARY KEY, AUTO_INCREMENT | Unique document identifier |
| title | String(500) | NOT NULL | Document title |
| source | String(500) | NOT NULL | Source identifier (file path, URL, etc.) |
| content_hash | String(64) | UNIQUE, NOT NULL | SHA-256 hash of content for deduplication |
| content | Text | NOT NULL | Full text content of the document |
| uploaded_at | DateTime | NOT NULL | Timestamp of document upload |

#### Example Record
```json
{
  "id": 1,
  "title": "Chapter 4: Introduction to Digital Twins",
  "source": "docs/chapter-4/introduction-digital-twins.mdx",
  "content_hash": "a1b2c3d4e5f6...",
  "content": "Full content of the document...",
  "uploaded_at": "2025-01-10T09:00:00Z"
}
```

## Indexes and Performance Optimization

### Required Indexes
1. **users.email**: For efficient user lookup by email
2. **conversations.user_id**: For retrieving user's conversations
3. **messages.conversation_id**: For retrieving messages in a conversation
4. **messages.timestamp**: For chronological message retrieval
5. **documents.content_hash**: For deduplication
6. **documents.source**: For document lookup by source

### Performance Considerations
- Implement soft deletes instead of hard deletes where appropriate
- Use connection pooling for database connections
- Implement caching for frequently accessed data
- Optimize queries with proper indexing

## Security Requirements

### Data Protection
- Encrypt sensitive data at rest where possible
- Sanitize inputs to prevent injection attacks
- Use parameterized queries to prevent SQL injection
- Validate and sanitize all user-provided content

### Privacy
- Implement data retention policies
- Provide data deletion capabilities per user request
- Anonymize data for analytics where possible
- Comply with privacy regulations (GDPR, etc.)

## Backup and Recovery

### Backup Strategy
- Daily automated backups
- Transaction logs for point-in-time recovery
- Encrypted backup storage
- Regular backup verification

### Recovery Procedures
- Document recovery process
- Regular recovery testing
- Point-in-time recovery capability
- Minimal data loss target: < 1 hour

## Scalability Considerations

### Horizontal Scaling
- Design for read replicas
- Consider sharding for large datasets
- Connection pooling configuration
- Asynchronous operations for write-heavy tasks

### Performance Monitoring
- Query performance monitoring
- Slow query logging
- Connection pool utilization
- Database resource utilization

## Migration Strategy

### Schema Changes
- Version-controlled migrations
- Backward compatibility when possible
- Staged rollout of schema changes
- Rollback procedures for failed migrations

## Validation Rules

### Data Integrity
- Foreign key constraints to maintain referential integrity
- NOT NULL constraints where required
- UNIQUE constraints to prevent duplicates
- Check constraints for value validation

### Business Rules
- Users may have multiple conversations
- Conversations must belong to a user
- Messages must have a valid role ('user' or 'assistant')
- Documents must have unique content (via hash)