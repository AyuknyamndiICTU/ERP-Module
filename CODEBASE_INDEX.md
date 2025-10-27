# 📁 Codebase Index - Educational ERP System

## 🏗️ Project Overview
**Name**: Educational ERP System  
**Type**: Full-stack web application  
**Architecture**: Frontend (React) + Backend (Node.js/Express) + Database (PostgreSQL)  
**Status**: 91.7% complete (5 of 6 phases done)

## 🛠️ Technology Stack

### Backend Technologies
- **Runtime**: Node.js (>=16.0.0)
- **Framework**: Express.js 4.18.2
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT + bcrypt
- **Payment**: Stripe integration
- **Documentation**: Swagger UI
- **Security**: Helmet, CORS, Rate limiting
- **Testing**: Jest + Supertest
- **Logging**: Winston + Morgan

### Frontend Technologies
- **Framework**: React 18.2.0
- **UI Library**: Material-UI (MUI) 5.14.5
- **Routing**: React Router 6.15.0
- **Forms**: React Hook Form + Formik + Yup validation
- **HTTP Client**: Axios
- **State Management**: React Context API + React Query
- **Charts**: Recharts
- **PDF Generation**: jsPDF + html2canvas
- **Excel Export**: ExcelJS

## 📂 Directory Structure

```
/workspace/
├── 📁 backend/                    # Server-side application
│   ├── 📁 src/
│   │   ├── 📁 routes/             # API route handlers
│   │   │   ├── 📄 auth.js         # Authentication endpoints
│   │   │   ├── 📄 users.js        # User management
│   │   │   ├── 📄 academic.js     # Academic module APIs
│   │   │   ├── 📄 courses.js      # Course management
│   │   │   ├── 📄 students.js     # Student management
│   │   │   ├── 📄 grades.js       # Grade management
│   │   │   ├── 📄 attendance.js   # Attendance tracking
│   │   │   ├── 📄 finance.js      # Financial operations
│   │   │   └── 📄 hr.js           # HR management
│   │   ├── 📁 config/             # Configuration files
│   │   │   ├── 📄 database.js     # Database connection config
│   │   │   └── 📄 swagger.js      # API documentation config
│   │   ├── 📁 database/           # Database operations
│   │   │   ├── 📄 migrate.js      # Database migrations
│   │   │   └── 📄 seed.js         # Sample data seeding
│   │   ├── 📁 middleware/         # Express middleware
│   │   │   ├── 📄 auth.js         # Authentication middleware
│   │   │   ├── 📄 errorHandler.js # Global error handling
│   │   │   └── 📄 notFound.js     # 404 handler
│   │   ├── 📁 utils/              # Utility functions
│   │   │   └── 📄 logger.js       # Logging utilities
│   │   └── 📄 server.js           # Main server entry point
│   ├── 📄 package.json            # Backend dependencies
│   └── 📄 package-lock.json       # Dependency lock file
├── 📁 frontend/                   # Client-side application
│   ├── 📁 src/
│   │   ├── 📁 components/         # Reusable React components
│   │   │   ├── 📁 Common/         # Shared components
│   │   │   │   ├── 📄 DialogComponents.js  # Modal dialogs
│   │   │   │   ├── 📄 ErrorBoundary.js     # Error handling
│   │   │   │   ├── 📄 FormDialog.js        # Form modals
│   │   │   │   └── 📄 LoadingSpinner.js    # Loading indicators
│   │   │   ├── 📁 Layout/         # Layout components
│   │   │   │   └── 📄 Layout.js   # Main app layout
│   │   │   ├── 📁 Chat/           # Community chat feature
│   │   │   ├── 📁 Transcript/     # Transcript components
│   │   │   ├── 📄 AnimatedBackground.js # Background animations
│   │   │   ├── 📄 GlassCard.js    # Glass morphism cards
│   │   │   └── 📄 LazyComponents.js # Code splitting
│   │   ├── 📁 pages/              # Page components
│   │   │   ├── 📁 Auth/           # Authentication pages
│   │   │   ├── 📁 Dashboard/      # Main dashboard
│   │   │   │   └── 📄 DashboardPage.js # Main dashboard view
│   │   │   ├── 📁 Academic/       # Academic module pages
│   │   │   │   ├── 📄 CoursesPage.js    # Course management
│   │   │   │   ├── 📄 StudentsPage.js   # Student management
│   │   │   │   ├── 📄 GradesPage.js     # Grade management
│   │   │   │   └── 📄 AttendancePage.js # Attendance tracking
│   │   │   ├── 📁 Finance/        # Finance module pages
│   │   │   │   ├── 📄 InvoicesPage.js   # Invoice management
│   │   │   │   ├── 📄 PaymentsPage.js   # Payment processing
│   │   │   │   ├── 📄 BudgetsPage.js    # Budget management
│   │   │   │   └── 📄 CampaignsPage.js  # Marketing campaigns
│   │   │   ├── 📁 HR/             # HR module pages
│   │   │   │   ├── 📄 EmployeesPage.js  # Employee management
│   │   │   │   ├── 📄 PayrollPage.js    # Payroll management
│   │   │   │   ├── 📄 LeavePage.js      # Leave management
│   │   │   │   └── 📄 AssetsPage.js     # Asset management
│   │   │   └── 📁 Profile/        # User profile pages
│   │   ├── 📁 services/           # API service layer
│   │   │   └── 📄 api.js          # HTTP client and API calls
│   │   ├── 📁 context/            # React Context providers
│   │   │   └── 📄 AuthContext.js  # Authentication state
│   │   ├── 📁 hooks/              # Custom React hooks
│   │   │   └── 📄 useApiData.js   # Data fetching hook
│   │   ├── 📁 utils/              # Frontend utilities
│   │   ├── 📄 App.js              # Main app component
│   │   ├── 📄 index.js            # React app entry point
│   │   ├── 📄 index.css           # Global styles
│   │   └── 📄 theme.js            # MUI theme configuration
│   ├── 📄 package.json            # Frontend dependencies
│   ├── 📄 package-lock.json       # Dependency lock file
│   └── 📄 craco.config.js         # Create React App config
├── 📄 package.json                # Root package.json (monorepo scripts)
├── 📄 docker-compose.dev.yml      # Development Docker setup
├── 📄 .gitignore                  # Git ignore rules
├── 📄 README.md                   # Project documentation
├── 📄 fix-issues.js               # Utility script for fixes
└── 📁 .git/                       # Git repository

```

## 🔗 Key Components & Modules

### 🔐 Authentication System
- **Location**: `backend/src/routes/auth.js`, `frontend/src/context/AuthContext.js`
- **Features**: JWT tokens, role-based access, secure login/logout
- **Roles**: Admin, Faculty, Student, HR, Marketing

### 📚 Academic Module
- **Backend Routes**: `backend/src/routes/academic.js`, `courses.js`, `students.js`, `grades.js`, `attendance.js`
- **Frontend Pages**: `frontend/src/pages/Academic/`
- **Features**: 
  - Course management and curriculum planning
  - Student enrollment and records
  - Grade calculation and GPA tracking
  - Attendance monitoring with analytics

### 💰 Finance Module
- **Backend Routes**: `backend/src/routes/finance.js`
- **Frontend Pages**: `frontend/src/pages/Finance/`
- **Features**:
  - Invoice generation and payment processing
  - Budget management and financial reporting
  - Stripe payment integration
  - Marketing campaign tracking

### 👥 HR Module
- **Backend Routes**: `backend/src/routes/hr.js`
- **Frontend Pages**: `frontend/src/pages/HR/`
- **Features**:
  - Employee management and profiles
  - Payroll processing and salary management
  - Leave tracking and approval workflow
  - Asset management and inventory

### 🛡️ Security & Middleware
- **Location**: `backend/src/middleware/`
- **Components**:
  - `auth.js` - JWT authentication middleware
  - `errorHandler.js` - Global error handling
  - `notFound.js` - 404 error handling
- **Security Features**: Helmet, CORS, Rate limiting, Input validation

### 🗄️ Database Layer
- **ORM**: Sequelize with PostgreSQL
- **Location**: `backend/src/database/`
- **Features**:
  - Migration system for schema versioning
  - Data seeding for development/testing
  - Connection pooling and optimization

## 📊 File Statistics

### Backend Files
- **Total Routes**: 9 route files (auth, users, academic, courses, students, grades, attendance, finance, hr)
- **Configuration**: 2 files (database, swagger)
- **Database**: 2 files (migrate, seed)
- **Middleware**: 3 files (auth, errorHandler, notFound)
- **Utilities**: 1 file (logger)
- **Main Server**: 1 file (server.js)

### Frontend Files
- **Pages**: 13+ page components across 6 modules
- **Components**: 10+ reusable components
- **Services**: 1 API service layer
- **Context**: 1 authentication context
- **Hooks**: 1 custom data fetching hook
- **Configuration**: Theme and app setup files

## 🚀 Getting Started

### Prerequisites
- Node.js >= 16.0.0
- npm >= 8.0.0
- PostgreSQL database
- Git

### Installation Commands
```bash
# Install all dependencies
npm run setup

# Start development servers
npm run dev

# Run database migrations
npm run migrate

# Seed sample data
npm run seed

# Run tests
npm run test
```

### Available Scripts
- `npm run dev` - Start both frontend and backend in development mode
- `npm run server` - Start only backend server
- `npm run client` - Start only frontend application
- `npm run build` - Build frontend for production
- `npm run docker:dev` - Run with Docker for development
- `npm run lint` - Run linting on both frontend and backend
- `npm run format` - Format code with Prettier

## 🔍 Key Entry Points

### Backend Entry Points
- **Main Server**: `backend/src/server.js` - Express app setup and middleware configuration
- **Database Config**: `backend/src/config/database.js` - PostgreSQL connection setup
- **API Routes**: `backend/src/routes/` - All REST API endpoints

### Frontend Entry Points
- **App Root**: `frontend/src/index.js` - React app initialization
- **Main Component**: `frontend/src/App.js` - Routing and protected routes
- **Layout**: `frontend/src/components/Layout/Layout.js` - Main app layout
- **API Service**: `frontend/src/services/api.js` - HTTP client configuration

## 🧪 Testing Structure
- **Backend**: Jest with Supertest for API testing
- **Frontend**: React Testing Library + Jest
- **Coverage**: Configured for both frontend and backend

## 📝 Documentation Files
- `README.md` - Comprehensive project documentation
- `SRS for Administrative and Human Resource.docx` - HR requirements
- `Software Requirements Specification Academic.docx` - Academic requirements
- `Software Requirements Specification General.docx` - General requirements
- `Software Requirements Specification Marketing & Finance.docx` - Finance requirements
- `Large System Development Project.pdf` - Project specification

## 🔧 Development Tools
- **Linting**: ESLint with Airbnb config
- **Formatting**: Prettier
- **Git Hooks**: Husky for pre-commit hooks
- **API Documentation**: Swagger UI
- **Build Tools**: Create React App with CRACO
- **Containerization**: Docker with docker-compose

## 📈 Project Status
The project is in an advanced stage with 5 out of 6 phases completed:
1. ✅ Foundation & Planning (100%)
2. ✅ Academic Module (100%)
3. ✅ Marketing & Finance (100%)
4. ✅ HR & Administration (100%)
5. ✅ Integration & Testing (100%)
6. ⏳ Deployment & Documentation (Pending)

## 🔢 Code Metrics

### File Count
- **Total JavaScript/TypeScript Files**: 67
- **Backend Files**: 18 modules with exports
- **Frontend Files**: 38 files with imports
- **Configuration Files**: 8+ (package.json, docker-compose, etc.)
- **Documentation Files**: 5 (README + 4 SRS documents)

### Code Organization
- **Backend Modules**: 18 exportable modules
- **Frontend Components**: 271+ import statements indicating rich component ecosystem
- **API Endpoints**: 9 route files covering all major functionality
- **Database Models**: Sequelize ORM with PostgreSQL
- **Testing**: Jest configuration for both frontend and backend

## 🌐 API Structure

### Base Configuration
- **Backend Port**: 3001 (configurable via PORT env var)
- **Frontend Port**: 3000 (React dev server)
- **API Base URL**: `http://localhost:3001/api`
- **Database**: PostgreSQL on port 5432
- **Documentation**: Swagger UI at `/api-docs`

### Environment Variables
Key environment variables used across the system:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - Database connection
- `PORT` - Server port configuration
- `REACT_APP_API_URL` - Frontend API endpoint
- `NODE_ENV` - Environment mode (development/production)
- `CORS_ORIGIN` - CORS configuration
- `RATE_LIMIT_WINDOW`, `RATE_LIMIT_MAX_REQUESTS` - Rate limiting

## 🔧 Development Workflow

### Backend Development
- **Entry Point**: `backend/src/server.js`
- **Development**: `nodemon` for auto-restart
- **Database**: Sequelize migrations and seeding
- **Testing**: Jest with Supertest for API testing
- **Linting**: ESLint with Airbnb configuration

### Frontend Development
- **Entry Point**: `frontend/src/index.js`
- **Development**: Create React App with hot reload
- **State Management**: React Context + React Query
- **UI Framework**: Material-UI with custom theming
- **Testing**: React Testing Library + Jest

### Code Quality
- **Pre-commit Hooks**: Husky + lint-staged
- **Formatting**: Prettier for consistent code style
- **Linting**: ESLint for both frontend and backend
- **Type Safety**: Partial TypeScript setup

---
*Index generated on: $(date)*
*Total Files Indexed: 67 JavaScript/TypeScript files + configuration and documentation*
*Backend Modules: 18 | Frontend Components: 38 | API Routes: 9*