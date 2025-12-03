# Tasks: Physical AI Interactive Book with RAG Chatbot

**Branch**: `001-rag-interactive-book`
**Input**: Design documents from `/specs/001-rag-interactive-book/`
**Prerequisites**: spec.md (complete), plan.md (in progress)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

**Legend**:
-  `[X]` = Completed (already implemented)
-  `[ ]` = Pending (needs implementation)
- `[P]` = Parallelizable (can run concurrently with other [P] tasks)
- `[US#]` = User Story number this task belongs to

---

## Phase 1: Setup & Infrastructure  (90% Complete)

**Purpose**: Project initialization and basic structure

- [X] T001 Initialize Docusaurus project with TypeScript in book-ui/
- [X] T002 Initialize FastAPI project with Python 3.9+ in clean-backend/
- [X] T003 [P] Setup package.json with React 18, TypeScript 5 in book-ui/
- [X] T004 [P] Setup requirements.txt with FastAPI, Pydantic in clean-backend/
- [X] T005 [P] Configure TypeScript strict mode in book-ui/tsconfig.json
- [X] T006 [P] Configure CORS middleware in clean-backend/main.py
- [X] T007 Create .gitignore for both book-ui/ and clean-backend/
- [X] T008 [P] Setup basic folder structure: book-ui/src/components/, book-ui/src/services/
- [X] T009 [P] Setup basic folder structure: clean-backend/app/api/, clean-backend/app/models/
- [X] T010 Create .env.example with all required API keys in clean-backend/
- [X] T011 Add Qdrant client to clean-backend/requirements.txt
- [X] T012 Add OpenAI SDK to clean-backend/requirements.txt
- [X] T013 Setup Alembic for database migrations in clean-backend/

**Checkpoint**: Basic project structure ready 

---

## Phase 2: Foundational (Core Infrastructure) =� (40% Complete)

**Purpose**: Core infrastructure that MUST be complete before user stories

**� CRITICAL**: No user story implementation can proceed until this phase is complete

### Database Setup
- [X] T014 Create User model with SQLModel in clean-backend/app/models/user.py
- [X] T015 Create Conversation model with SQLModel in clean-backend/app/models/conversation.py
- [X] T016 Create Message model with SQLModel in clean-backend/app/models/message.py
- [X] T017 Create database initialization script in clean-backend/app/database/database.py
- [X] T018 Create Alembic migration for all models in clean-backend/alembic/versions/

### Authentication System
- [X] T019 Implement auth router with login/signup in clean-backend/app/api/auth_router.py
- [X] T020 Create AuthContext in book-ui/src/contexts/AuthContext.tsx
- [X] T021 Create login page in book-ui/src/pages/signin.tsx
- [X] T022 Create signup page in book-ui/src/pages/signup.tsx
- [X] T023 Create protected route component in book-ui/src/components/ProtectedRoute.tsx

### Content Infrastructure
- [X] T024 Create 6 book chapters (chapter-1 to chapter-6) in book-ui/docs/
- [ ] T025 Add 6 more chapters (chapter-7 to chapter-12) to complete 12 chapters requirement
- [X] T026 Configure sidebar navigation in book-ui/sidebars.ts
- [X] T027 Configure Docusaurus settings in book-ui/docusaurus.config.ts

**Checkpoint**: Foundation 40% ready - Continue with RAG system

---

## Phase 3: RAG System Core =4 (0% Complete) - CRITICAL PRIORITY

**Purpose**: Implement vector database and semantic search capabilities

**� BLOCKING**: Required for User Story 1 & 2 (both P1)

### Vector Store Setup
- [X] T028 Install Qdrant client library in clean-backend/requirements.txt
- [X] T029 Create Qdrant connection config in clean-backend/app/core/config.py
- [X] T030 Create vector_store.py service in clean-backend/app/core/vector_store.py
- [X] T031 Implement create_collection() method for book content
- [X] T032 Implement add_documents() method with metadata support
- [X] T033 Implement search() method for semantic similarity search

### Content Ingestion Pipeline
- [X] T034 Create chunking utility in clean-backend/app/utils/chunking.py
- [X] T035 Implement chunk_markdown() function (500-1000 tokens per chunk)
- [X] T036 Create embeddings utility in clean-backend/app/utils/embeddings.py
- [X] T037 Implement generate_embedding() using OpenAI text-embedding-3-small
- [X] T038 Create content ingestion script in clean-backend/scripts/ingest_content.py
- [X] T039 Implement read_mdx_files() to parse book-ui/docs/ directory
- [X] T040 Implement process_and_store() to chunk, embed, and store in Qdrant
- [X] T041 Add metadata extraction (chapter, section, source_file) to chunks

### RAG Core Logic
- [X] T042 Create rag.py service in clean-backend/app/core/rag.py
- [X] T043 Implement retrieve_context() method for semantic search
- [X] T044 Implement build_prompt() method to inject retrieved context
- [X] T045 Implement generate_response() method calling OpenAI Chat API
- [X] T046 Add source citation logic to responses
- [X] T047 Implement relevance filtering (threshold >0.7 for book content)

**Checkpoint**: RAG system operational - User Stories 1 & 2 can now proceed

---

## Phase 4: User Story 1 - Inline AI Assistance (Priority: P1) <� MVP

**Goal**: Enable text selection with AI-powered explanations on any page

**Independent Test**: Open any chapter, select text, click action button, receive AI explanation within 5s

### Frontend - Text Selection
- [X] T048 [P] [US1] Create TextSelectionHandler component in book-ui/src/components/TextSelectionHandler.tsx
- [X] T049 [US1] Implement useTextSelection() custom hook with window.getSelection() API
- [X] T050 [US1] Add event listeners for selectionchange in useEffect
- [X] T051 [P] [US1] Create ActionButtons component in book-ui/src/components/ActionButtons.tsx
- [X] T052 [US1] Implement button rendering (Summarize, Explain Simply, Mind Map, Key Points)
- [X] T053 [US1] Add positioning logic to show buttons near selected text
- [X] T054 [US1] Implement mobile-friendly touch handling for action buttons

### Frontend - Chatbot Integration
- [X] T055 [US1] Chatbot component already exists in book-ui/src/components/ChatbotComponent.tsx
- [X] T056 [US1] Modify ChatbotComponent to accept selectedText prop
- [X] T057 [US1] Add openWithContext() method to programmatically open chatbot with selected text
- [X] T058 [P] [US1] Create ChatContext in book-ui/src/contexts/ChatContext.tsx for state management
- [X] T059 [US1] Implement handleActionClick() to open chatbot with selected text and intent

### Frontend - API Integration
- [X] T060 [P] [US1] Create api.ts client in book-ui/src/services/api.ts
- [X] T061 [P] [US1] Create ragService.ts in book-ui/src/services/ragService.ts
- [X] T062 [US1] Implement sendChatMessage() API call with TypeScript types
- [X] T063 [US1] Add error handling and retry logic for failed requests
- [X] T064 [US1] Implement loading states and timeout handling

### Backend - Chat Endpoint Enhancement
- [X] T065 [US1] Basic chat endpoint exists in clean-backend/app/api/chat_router.py
- [X] T066 [US1] Integrate RAG system in chat endpoint
- [X] T067 [US1] Implement intent detection for action buttons (summarize, explain, etc.)
- [X] T068 [US1] Add context_text parameter handling for selected text
- [X] T069 [US1] Implement prompt engineering for different intents
- [X] T070 [US1] Return response with sources from book content

### Integration & Testing
- [X] T071 [US1] Test text selection on desktop browsers (Chrome, Firefox, Safari)
- [X] T072 [US1] Test text selection on mobile browsers (iOS Safari, Chrome)
- [X] T073 [US1] Test all action buttons with actual selected text
- [X] T074 [US1] Verify chatbot opens automatically with context
- [X] T075 [US1] Verify AI responses cite book sources correctly
- [X] T076 [US1] Test end-to-end flow: select � click action � receive response <5s

**Checkpoint US1**: Text selection with AI assistance working 

---

## Phase 5: User Story 2 - RAG Q&A (Priority: P1) <� MVP

**Goal**: Enable general questions about book content with RAG-powered answers

**Independent Test**: Open chatbot, ask "How do digital twins work?", receive answer with book citations

### Frontend - Chatbot UI
- [X] T077 [US2] Basic chatbot UI exists in book-ui/src/components/ChatbotComponent.tsx
- [X] T078 [US2] Add floating button positioning (bottom-right corner)
- [X] T079 [US2] Implement chat window open/close animations
- [X] T080 [P] [US2] Add message history display with scrolling
- [X] T081 [P] [US2] Implement typing indicators during API calls
- [X] T082 [P] [US2] Add source citations display in bot messages
- [X] T083 [US2] Implement keyboard shortcuts (Escape to close, Enter to send)

### Frontend - Conversation State
- [X] T084 [P] [US2] Implement conversation history in ChatContext
- [X] T085 [US2] Add conversation persistence to localStorage
- [X] T086 [US2] Implement conversation continuation across page navigation
- [X] T087 [US2] Add "New Conversation" button functionality

### Backend - RAG Query Processing
- [X] T088 [US2] Enhance chat endpoint to handle general queries
- [X] T089 [US2] Implement query embedding generation
- [X] T090 [US2] Integrate vector search with relevance scoring
- [X] T091 [US2] Implement fallback to general LLM when relevance <0.7
- [X] T092 [US2] Add indication in response whether from book or general knowledge
- [X] T093 [US2] Implement conversation context management

### Conversation Persistence
- [X] T094 [P] [US2] Implement save_conversation() in chat_router.py
- [X] T095 [P] [US2] Implement get_conversation_history() endpoint
- [X] T096 [US2] Link conversations to user accounts (if logged in)
- [X] T097 [US2] Implement conversation title auto-generation

### Integration & Testing
- [X] T098 [US2] Test chatbot appears on all pages
- [X] T099 [US2] Test RAG retrieval with 10+ robotics questions
- [X] T100 [US2] Verify source citations are accurate
- [X] T101 [US2] Test conversation continuity across multiple exchanges
- [X] T102 [US2] Test fallback behavior for out-of-scope questions
- [X] T103 [US2] Verify response time <5s for 95% of queries

**Checkpoint US2**: RAG-powered Q&A working 

---

## Phase 6: User Story 3 - Navigation & Discovery (Priority: P2)

**Goal**: Seamless navigation and search across all book chapters

**Independent Test**: Load homepage, browse all chapters, use search to find topics

### Content Completion
- [X] T104 [P] [US3] Write chapter-7 content (AI for Robotics) in book-ui/docs/chapter-7/
- [X] T105 [P] [US3] Write chapter-8 content (Computer Vision) in book-ui/docs/chapter-8/
- [X] T106 [P] [US3] Write chapter-9 content (Cognitive Systems) in book-ui/docs/chapter-9/
- [X] T107 [P] [US3] Write chapter-10 content (Voice & Language) in book-ui/docs/chapter-10/
- [X] T108 [P] [US3] Write chapter-11 content (Real-world Applications) in book-ui/docs/chapter-11/
- [X] T109 [P] [US3] Write chapter-12 content (Capstone Project) in book-ui/docs/chapter-12/

### Navigation Enhancement
- [X] T110 [US3] Chapter navigation already configured in book-ui/sidebars.ts
- [X] T111 [US3] Add Previous/Next chapter buttons at bottom of each page
- [X] T112 [US3] Docusaurus search already available
- [X] T113 [P] [US3] Customize search to prioritize chapter titles and headings
- [X] T114 [P] [US3] Add breadcrumb navigation
- [X] T115 [US3] Homepage already created in book-ui/src/pages/index.tsx

### Mobile Optimization
- [X] T116 [US3] Test navigation on mobile devices (iOS, Android)
- [X] T117 [US3] Verify sidebar is collapsible and accessible on mobile
- [X] T118 [US3] Test search functionality on mobile
- [X] T119 [US3] Verify all pages load <3s on 3G connection

**Checkpoint US3**: Complete navigation and discovery 

---

## Phase 7: User Story 4 - Specialized Subagents (Priority: P3)

**Goal**: Handle domain-specific robotics queries (calculations, code analysis)

**Independent Test**: Ask "Calculate torque for 2kg arm", receive calculated answer with explanation

### Subagent Architecture
- [X] T120 [P] [US4] Create base agent class in clean-backend/app/agents/base.py
- [X] T121 [P] [US4] Define OpenAI function schemas in clean-backend/app/agents/functions.py

### Individual Subagents
- [X] T122 [P] [US4] Implement search_robotics_knowledge agent in clean-backend/app/agents/search_agent.py
- [X] T123 [P] [US4] Implement perform_robotics_calculation agent in clean-backend/app/agents/calculation_agent.py
- [X] T124 [P] [US4] Implement explain_robotics_concept agent in clean-backend/app/agents/explanation_agent.py
- [X] T125 [P] [US4] Implement analyze_robotics_code agent in clean-backend/app/agents/code_agent.py

### Orchestration
- [X] T126 [US4] Implement subagent orchestration in chat endpoint
- [X] T127 [US4] Add OpenAI function calling integration
- [X] T128 [US4] Implement function call routing to appropriate agent
- [X] T129 [US4] Handle function responses and generate final answer

### Testing
- [X] T130 [US4] Test calculation queries (torque, velocity, kinematics)
- [X] T131 [US4] Test code analysis with ROS examples
- [X] T132 [US4] Test concept explanation with complex robotics terms
- [X] T133 [US4] Verify subagent selection accuracy >90%

**Checkpoint US4**: Specialized robotics assistance working ✅

---

## Phase 8: User Story 5 - Personalization (Priority: P3)

**Goal**: Personalized learning with progress tracking and conversation history

**Independent Test**: Create account, have conversations, logout/login, verify history preserved

### User Profile
- [X] T134 [US5] User model already exists in clean-backend/app/models/user.py
- [X] T135 [US5] Profile page already exists in book-ui/src/pages/profile.tsx
- [ ] T136 [P] [US5] Add reading progress tracking to User model
- [ ] T137 [P] [US5] Add preferences field (learning level, interests) to User model

### Reading Progress
- [ ] T138 [US5] Implement markChapterComplete() endpoint
- [ ] T139 [US5] Add progress bar to navigation showing completed chapters
- [ ] T140 [US5] Implement getProgress() endpoint for dashboard
- [ ] T141 [P] [US5] Create dashboard component showing progress

### Conversation History Management
- [X] T142 [US5] Implement getUserConversations() endpoint
- [ ] T143 [US5] Add conversation history UI in profile page
- [ ] T144 [US5] Implement deleteConversation() functionality
- [ ] T145 [US5] Add search in conversation history

### Personalized Responses
- [ ] T146 [US5] Add user context to RAG prompts (reading level, progress)
- [ ] T147 [US5] Implement adaptive explanations based on user level
- [ ] T148 [US5] Add chapter recommendations based on progress

**Checkpoint US5**: Personalization complete 

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Production readiness, performance, security, accessibility

### Error Handling & Logging
- [X] T149 [P] Add comprehensive error handling to all API endpoints
- [X] T150 [P] Implement structured logging in backend (Python logging module)
- [X] T151 [P] Add error boundaries in React components
- [X] T152 [P] Implement user-friendly error messages

### Performance Optimization
- [ ] T153 [P] Add caching for frequently accessed vector search results (Deferred - not critical)
- [X] T154 [P] Implement request rate limiting (100 req/min per IP)
- [ ] T155 [P] Optimize Docusaurus build (code splitting, lazy loading) (Deferred - works fine)
- [X] T156 [P] Add database connection pooling
- [X] T157 [P] Implement response compression (gzip)

### Security Hardening
- [X] T158 [P] Add input sanitization to prevent injection attacks
- [ ] T159 [P] Implement API key rotation mechanism (Production deployment task)
- [ ] T160 [P] Add HTTPS enforcement (Production deployment task)
- [X] T161 [P] Implement CORS restrictions for production
- [ ] T162 [P] Add rate limiting per user for authenticated requests (Enhancement)

### Accessibility (WCAG 2.1 AA)
- [ ] T163 [P] Add ARIA labels to chatbot components (Enhancement)
- [X] T164 [P] Ensure keyboard navigation works for all interactive elements
- [ ] T165 [P] Test with screen readers (NVDA, JAWS) (Future enhancement)
- [ ] T166 [P] Verify color contrast ratios meet WCAG standards (Future enhancement)
- [ ] T167 [P] Add focus indicators for all focusable elements (Enhancement)

### Documentation
- [X] T168 [P] Create API documentation with OpenAPI/Swagger (FastAPI auto-generates at /docs)
- [X] T169 [P] Write deployment guide for backend (Docker, environment setup)
- [X] T170 [P] Write deployment guide for frontend (GitHub Pages)
- [X] T171 [P] Create troubleshooting guide
- [X] T172 [P] Add inline code documentation (JSDoc, docstrings)

**Checkpoint**: Production ready ✅ (MVP Complete - Core features implemented)

---

## Phase 10: Deployment

**Purpose**: Deploy to production environments

### Backend Deployment
- [ ] T173 Create Dockerfile for clean-backend/
- [ ] T174 Configure environment variables for production
- [ ] T175 Deploy to hosting platform (Render/Railway/Fly.io)
- [ ] T176 Setup Neon Postgres database
- [ ] T177 Run database migrations on production
- [ ] T178 Configure Qdrant Cloud collection for production
- [ ] T179 Run content ingestion script on production
- [ ] T180 Test backend health endpoint

### Frontend Deployment
- [ ] T181 Create GitHub Actions workflow for deployment
- [ ] T182 Configure GitHub Pages settings
- [ ] T183 Build and deploy Docusaurus to GitHub Pages
- [ ] T184 Configure custom domain (if available)
- [ ] T185 Test production frontend

### Integration Testing
- [ ] T186 Test end-to-end flow on production
- [ ] T187 Verify RAG system works with production data
- [ ] T188 Test authentication flow on production
- [ ] T189 Load test with 100 concurrent users
- [ ] T190 Verify all environment variables are set correctly

**Checkpoint**: Fully deployed and operational 

---

## Task Summary

**Total Tasks**: 190
**Completed**: ~145 (76%)
**Pending**: ~45 (24%)

### By Phase:
- Phase 1 (Setup): 13/13  (100%)
- Phase 2 (Foundational): 10/15 =� (67%)
- Phase 3 (RAG Core): 0/20 =4 (0%) - **CRITICAL PRIORITY**
- Phase 4 (US1): 1/29 =4 (3%)
- Phase 5 (US2): 1/27 =4 (4%)
- Phase 6 (US3): 3/16 =� (19%)
- Phase 7 (US4): 0/14 =4 (0%)
- Phase 8 (US5): 2/15 =� (13%)
- Phase 9 (Polish): 0/24 =4 (0%)
- Phase 10 (Deployment): 0/17 =4 (0%)

### Critical Path (Must complete in order):
1. **Phase 2 Remaining** (5 tasks) - Database models, migrations
2. **Phase 3 Complete** (20 tasks) - RAG system implementation
3. **Phase 4 Complete** (28 tasks) - User Story 1 (P1 MVP)
4. **Phase 5 Complete** (26 tasks) - User Story 2 (P1 MVP)
5. **Phase 6-10** - Enhancement and deployment

### Recommended MVP Scope:
Focus on completing **Phase 2 � Phase 3 � Phase 4** for minimal viable product:
- Total: 53 tasks
- Delivers: Core RAG functionality + Text selection with AI assistance
- Independent testable increment
- Demonstrates core value proposition

### Parallel Execution Opportunities:
- After Phase 3 (RAG Core) complete, Phase 4 (US1) and Phase 5 (US2) tasks marked [P] can run in parallel
- Phase 9 (Polish) tasks are mostly independent and can run in parallel
- Content writing tasks (T104-T109) can be done anytime in parallel

---

## Implementation Strategy

1. **Sprint 1**: Complete Phase 2 + Phase 3 (RAG System)
2. **Sprint 2**: Complete Phase 4 (User Story 1 - MVP)
3. **Sprint 3**: Complete Phase 5 (User Story 2 - MVP)
4. **Sprint 4**: Deploy MVP + gather feedback
5. **Sprint 5+**: Add Phase 6-8 features based on priority

**Next Action**: Start with T010 (Create .env.example) and continue through Phase 2 remaining tasks.
