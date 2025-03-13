openapi: 3.0.0
info:
  title: Educational Resource Platform API
  description: |
    Educational platform that allows teachers to upload content and students to access resources.
    Authentication is handled via JWT access tokens and HTTP-only cookie refresh tokens.
  version: 1.0.0
  contact:
    name: Support Team
    email: raymondomoyakhi@gmail.com

servers:
  - url: 'https://api.example.com/api/v1'
    description: Production server
  - url: 'http://localhost:3000/api/v1'
    description: Development server

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    User:
      type: object
      properties:
        _id:
          type: string
        name:
          type: string
          maxLength: 50
        email:
          type: string
          format: email
        role:
          type: string
          enum: [student, teacher, admin]
        preferred_language:
          type: string
          enum: [en, fr, es, de, zh, ar, hi, pt, sw, ru]
        isEmailVerified:
          type: boolean
        download_history:
          type: array
          items:
            type: object
            properties:
              content_id:
                type: string
              downloaded_at:
                type: string
                format: date-time
        contributions:
          type: array
          items:
            type: string
        badges:
          type: array
          items:
            type: object
            properties:
              badge_id:
                type: string
              awarded_at:
                type: string
                format: date-time
        lastLogin:
          type: string
          format: date-time
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    AuthResponse:
      type: object
      properties:
        success:
          type: boolean
        accessToken:
          type: string
        user:
          type: object
          properties:
            id:
              type: string
            name:
              type: string
            email:
              type: string
            role:
              type: string
              enum: [student, teacher, admin]
            preferred_language:
              type: string

    EmailVerificationResponse:
      type: object
      properties:
        success:
          type: boolean
        code:
          type: string
        message:
          type: string
        canResend:
          type: boolean
          description: Indicates if a new verification email can be requested

    ErrorResponse:
      type: object
      properties:
        success:
          type: boolean
        message:
          type: string
        code:
          type: string

    DownloadHistory:
      type: object
      properties:
        success:
          type: boolean
        data:
          type: array
          items:
            type: object
            properties:
              content_id:
                type: object
                properties:
                  _id:
                    type: string
                  title:
                    type: string
                  subject:
                    type: string
                  content_type:
                    type: string
                  format:
                    type: string
              downloaded_at:
                type: string
                format: date-time

    UserContributions:
      type: object
      properties:
        success:
          type: boolean
        data:
          type: array
          items:
            type: object
            properties:
              _id:
                type: string
              title:
                type: string
              description:
                type: string
              subject:
                type: string
              content_type:
                type: string
              format:
                type: string
              votes:
                type: number
              created_at:
                type: string
                format: date-time
              approved:
                type: boolean

    # Content Upload Schemas
    Content:
      type: object
      properties:
        _id:
          type: string
        title:
          type: string
          maxLength: 100
        description:
          type: string
          maxLength: 1000
        subject:
          type: string
          enum: [mathematics, science, language, social_studies, arts, physical_education, technology, other]
        grade_level:
          type: array
          items:
            type: string
        content_type:
          type: string
          enum: [lesson, quiz, assignment, resource]
        format:
          type: string
          enum: [video, document, presentation, audio, interactive]
        language:
          type: string
        creator:
          type: object
          properties:
            _id:
              type: string
            name:
              type: string
            email:
              type: string
        file_url:
          type: string
        file_size:
          type: number
        thumbnail_url:
          type: string
        tags:
          type: array
          items:
            type: string
        is_downloadable:
          type: boolean
        is_moderated:
          type: boolean
        votes:
          type: object
          properties:
            upvotes:
              type: number
            downvotes:
              type: number
            userVote:
              type: string
              enum: [up, down]
        approved:
          type: boolean
        views:
          type: number
        downloads:
          type: number
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    ContentList:
      type: object
      properties:
        success:
          type: boolean
        data:
          type: object
          properties:
            docs:
              type: array
              items:
                $ref: '#/components/schemas/Content'
            totalDocs:
              type: number
            limit:
              type: number
            totalPages:
              type: number
            page:
              type: number
            pagingCounter:
              type: number
            hasPrevPage:
              type: boolean
            hasNextPage:
              type: boolean
            prevPage:
              type: number
            nextPage:
              type: number

    Comment:
      type: object
      properties:
        _id:
          type: string
        content_id:
          type: string
        user:
          type: object
          properties:
            _id:
              type: string
            name:
              type: string
        text:
          type: string
          maxLength: 1000
        parent_id:
          type: string
        is_deleted:
          type: boolean
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    CommentList:
      type: object
      properties:
        success:
          type: boolean
        data:
          type: object
          properties:
            docs:
              type: array
              items:
                $ref: '#/components/schemas/Comment'
            totalDocs:
              type: number
            limit:
              type: number
            totalPages:
              type: number
            page:
              type: number
            pagingCounter:
              type: number
            hasPrevPage:
              type: boolean
            hasNextPage:
              type: boolean
            prevPage:
              type: number
            nextPage:
              type: number

    Badge:
      type: object
      properties:
        _id:
          type: string
        name:
          type: string
          maxLength: 50
        description:
          type: string
          maxLength: 200
        icon_url:
          type: string
        criteria_type:
          type: string
          enum: [contribution_count, download_count, upvote_count, manual]
        criteria_value:
          type: number
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    UserBadge:
      type: object
      properties:
        success:
          type: boolean
        data:
          type: array
          items:
            type: object
            properties:
              badge_id:
                $ref: '#/components/schemas/Badge'
              awarded_at:
                type: string
                format: date-time

paths:
  /auth/register:
    post:
      summary: Register a new user account
      tags:
        - Authentication
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [name, email, password]
              properties:
                name:
                  type: string
                  maxLength: 50
                email:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 8
                role:
                  type: string
                  enum: [student, teacher]
                  default: student
                preferred_language:
                  type: string
                  enum: [en, fr, es, de, zh, ar, hi, pt, sw, ru]
                  default: en
      responses:
        '201':
          description: Registration successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  message:
                    type: string
        '400':
          description: Invalid input or email already registered
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /auth/login:
    post:
      summary: User login
      tags:
        - Authentication
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
          headers:
            Set-Cookie:
              schema:
                type: string
                description: HTTP-only cookie containing refresh token
        '401':
          description: Invalid credentials or email not verified
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/EmailVerificationResponse'

  /auth/google:
    post:
      summary: Authenticate with Google
      tags:
        - Authentication
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [token]
              properties:
                token:
                  type: string
                  description: Google authentication token
                role:
                  type: string
                  enum: [student, teacher]
                preferred_language:
                  type: string
                  enum: [en, fr, es, de, zh, ar, hi, pt, sw, ru]
      responses:
        '200':
          description: Google authentication successful
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
          headers:
            Set-Cookie:
              schema:
                type: string
                description: HTTP-only cookie containing refresh token
        '401':
          description: Invalid Google token
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /auth/refresh-token:
    post:
      summary: Refresh access token using refresh token cookie
      tags:
        - Authentication
      responses:
        '200':
          description: New access token generated
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  accessToken:
                    type: string
          headers:
            Set-Cookie:
              schema:
                type: string
                description: New HTTP-only refresh token cookie
        '401':
          description: Invalid or expired refresh token
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /auth/logout:
    post:
      summary: Logout user and invalidate tokens
      tags:
        - Authentication
      security:
        - BearerAuth: []
      responses:
        '200':
          description: Successfully logged out
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  message:
                    type: string
          headers:
            Set-Cookie:
              schema:
                type: string
                description: Clears refresh token cookie

  /auth/verify-email/{token}:
    get:
      summary: Verify user email
      tags:
        - Authentication
      parameters:
        - in: path
          name: token
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Email successfully verified
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  message:
                    type: string
        '400':
          description: Invalid or expired verification token
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /auth/resend-verification:
    post:
      summary: Resend email verification token
      tags:
        - Authentication
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email]
              properties:
                email:
                  type: string
                  format: email
      responses:
        '200':
          description: Verification email sent
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  message:
                    type: string
        '400':
          description: Invalid request or rate limit exceeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /auth/forgot-password:
    post:
      summary: Initiate password reset
      tags:
        - Authentication
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email]
              properties:
                email:
                  type: string
                  format: email
      responses:
        '200':
          description: Password reset email sent
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  message:
                    type: string
        '400':
          description: User not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /auth/reset-password/{token}:
    post:
      summary: Reset password using reset token
      tags:
        - Authentication
      parameters:
        - in: path
          name: token
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [password]
              properties:
                password:
                  type: string
                  minLength: 8
      responses:
        '200':
          description: Password successfully reset
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  message:
                    type: string
        '400':
          description: Invalid or expired reset token
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /user/me:
    get:
      summary: Get current user profile
      tags:
        - User
      security:
        - BearerAuth: []
      responses:
        '200':
          description: User profile retrieved
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    $ref: '#/components/schemas/