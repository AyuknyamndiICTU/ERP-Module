# 🗺️ File Map - Educational ERP System

## 🔍 Quick File Finder

### 🖥️ Backend Files (18 modules)

#### Core Server
- `backend/src/server.js` - Main Express server setup

#### API Routes (9 files)
- `backend/src/routes/auth.js` - Authentication endpoints
- `backend/src/routes/users.js` - User management APIs
- `backend/src/routes/academic.js` - Academic module APIs
- `backend/src/routes/courses.js` - Course management
- `backend/src/routes/students.js` - Student management
- `backend/src/routes/grades.js` - Grade management
- `backend/src/routes/attendance.js` - Attendance tracking
- `backend/src/routes/finance.js` - Financial operations
- `backend/src/routes/hr.js` - HR management

#### Configuration
- `backend/src/config/database.js` - PostgreSQL connection setup
- `backend/src/config/swagger.js` - API documentation config

#### Database
- `backend/src/database/migrate.js` - Database migrations
- `backend/src/database/seed.js` - Sample data seeding

#### Middleware
- `backend/src/middleware/auth.js` - JWT authentication
- `backend/src/middleware/errorHandler.js` - Global error handling
- `backend/src/middleware/notFound.js` - 404 handler

#### Utilities
- `backend/src/utils/logger.js` - Winston logging setup

### 🎨 Frontend Files (49 modules)

#### Core App
- `frontend/src/index.js` - React app entry point
- `frontend/src/App.js` - Main app component with routing
- `frontend/src/theme.js` - Material-UI theme configuration

#### Pages (14 files)
**Authentication**
- `frontend/src/pages/Auth/LoginPage.js`

**Dashboard**
- `frontend/src/pages/Dashboard/DashboardPage.js`
- `frontend/src/pages/Dashboard/DashboardPage.test.js`

**Academic Module (4 files)**
- `frontend/src/pages/Academic/CoursesPage.js`
- `frontend/src/pages/Academic/StudentsPage.js`
- `frontend/src/pages/Academic/GradesPage.js`
- `frontend/src/pages/Academic/AttendancePage.js`

**Finance Module (4 files)**
- `frontend/src/pages/Finance/InvoicesPage.js`
- `frontend/src/pages/Finance/PaymentsPage.js`
- `frontend/src/pages/Finance/BudgetsPage.js`
- `frontend/src/pages/Finance/CampaignsPage.js`

**HR Module (4 files)**
- `frontend/src/pages/HR/EmployeesPage.js`
- `frontend/src/pages/HR/PayrollPage.js`
- `frontend/src/pages/HR/LeavePage.js`
- `frontend/src/pages/HR/AssetsPage.js`

**Profile**
- `frontend/src/pages/Profile/ProfilePage.js`

#### Components (12 files)
**Common Components**
- `frontend/src/components/Common/DialogComponents.js` - Modal dialogs
- `frontend/src/components/Common/ErrorBoundary.js` - Error handling
- `frontend/src/components/Common/FormDialog.js` - Form modals
- `frontend/src/components/Common/LoadingSpinner.js` - Loading indicators

**Layout**
- `frontend/src/components/Layout/Layout.js` - Main app layout

**UI Components**
- `frontend/src/components/AnimatedBackground.js` - Background animations
- `frontend/src/components/GlassCard.js` - Glass morphism cards
- `frontend/src/components/GlassCard.test.js` - Component tests
- `frontend/src/components/LazyComponents.js` - Code splitting

**Feature Components**
- `frontend/src/components/Chat/ChatButton.js`
- `frontend/src/components/Chat/ChatSidebar.js`
- `frontend/src/components/Chat/CommunityChat.js`
- `frontend/src/components/Chat/index.js`
- `frontend/src/components/Chat/MessageInput.js`
- `frontend/src/components/Chat/MessageList.js`
- `frontend/src/components/Transcript/TranscriptGenerator.js`

#### Services & State
- `frontend/src/services/api.js` - HTTP client and API calls
- `frontend/src/context/AuthContext.js` - Authentication state
- `frontend/src/hooks/useApiData.js` - Data fetching hook
- `frontend/src/utils/logger.js` - Frontend logging

## 🔍 Finding Files by Feature

### 🔐 Authentication
- Backend: `backend/src/routes/auth.js`, `backend/src/middleware/auth.js`
- Frontend: `frontend/src/pages/Auth/LoginPage.js`, `frontend/src/context/AuthContext.js`

### 📚 Academic Management
- Backend: `backend/src/routes/academic.js`, `courses.js`, `students.js`, `grades.js`, `attendance.js`
- Frontend: `frontend/src/pages/Academic/` (4 page files)

### 💰 Finance & Marketing
- Backend: `backend/src/routes/finance.js`
- Frontend: `frontend/src/pages/Finance/` (4 page files)

### 👥 Human Resources
- Backend: `backend/src/routes/hr.js`
- Frontend: `frontend/src/pages/HR/` (4 page files)

### 🎨 UI & Layout
- Layout: `frontend/src/components/Layout/Layout.js`
- Common: `frontend/src/components/Common/` (4 component files)
- Theme: `frontend/src/theme.js`

### 💬 Community Features
- Chat: `frontend/src/components/Chat/` (6 component files)
- Transcripts: `frontend/src/components/Transcript/TranscriptGenerator.js`

---
*File count: 67 JavaScript/TypeScript files*
*Last updated: $(date)*