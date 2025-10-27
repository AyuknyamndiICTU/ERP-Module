# 🏫 Educational ERP System - Codebase Index

## 📋 Project Overview

**Educational ERP System** is a comprehensive full-stack web application designed to streamline operations for educational institutions. The system integrates three core modules: Academic, Marketing & Finance, and Administration & Human Resources.

- **Project Status**: 91.7% Complete (5 of 6 phases completed)
- **Architecture**: Full-stack with React frontend and Node.js backend
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT-based with role-based access control
- **Deployment**: Docker containers with cloud hosting

## 🏗️ System Architecture

```
educational-erp-system/
├── frontend/                 # React.js frontend application
├── backend/                  # Node.js/Express.js backend API
├── docker-compose.dev.yml    # Docker development configuration
├── package.json             # Root package configuration
└── README.md                # Project documentation
```

## 📁 Frontend Structure (`frontend/`)

### Core Files
- **`package.json`** - Frontend dependencies and scripts
- **`craco.config.js`** - CRACO configuration for build customization
- **`cleanup-script.js`** - Code cleanup utilities
- **`cleanup-unused-imports.js`** - Import cleanup utilities

### Source Code (`src/`)
```
src/
├── App.js                    # Main application component with routing
├── index.js                  # Application entry point
├── index.css                 # Global styles
├── theme.js                  # Material-UI theme configuration
├── components/               # Reusable UI components
├── pages/                    # Page components organized by module
├── services/                 # API service layer
├── context/                  # React context providers
├── hooks/                    # Custom React hooks
└── utils/                    # Utility functions
```

### Components (`src/components/`)
```
components/
├── AnimatedBackground.js     # Animated background component
├── GlassCard.js             # Glass-morphism card component
├── GlassCard.test.js        # GlassCard component tests
├── LazyComponents.js        # Lazy-loaded components
├── Layout/                   # Layout components
├── Chat/                     # Community chat system
│   ├── ChatButton.js        # Floating chat button
│   ├── CommunityChat.js    # Main chat component
│   ├── ChatSidebar.js       # Chat sidebar with channels
│   ├── MessageInput.js      # Message input component
│   ├── MessageList.js       # Message list component
│   └── index.js             # Chat components export
├── Common/                   # Common UI components
└── Transcript/               # Transcript-related components
```

### Pages (`src/pages/`)
```
pages/
├── Auth/                     # Authentication pages
│   └── LoginPage.js         # Login page component
├── Dashboard/                # Dashboard pages
│   └── DashboardPage.js     # Main dashboard
├── Academic/                 # Academic module pages
│   ├── CoursesPage.js       # Course management
│   ├── StudentsPage.js      # Student management
│   ├── GradesPage.js        # Grade management
│   └── AttendancePage.js    # Attendance tracking
├── Finance/                  # Finance module pages
│   ├── InvoicesPage.js      # Invoice management
│   ├── PaymentsPage.js      # Payment tracking
│   ├── BudgetsPage.js       # Budget management
│   └── CampaignsPage.js     # Marketing campaigns
├── HR/                       # HR module pages
│   ├── EmployeesPage.js     # Employee management
│   ├── PayrollPage.js       # Payroll system
│   ├── LeavePage.js         # Leave management
│   └── AssetsPage.js        # Asset management
└── Profile/                  # User profile pages
    └── ProfilePage.js       # User profile management
```

### Services (`src/services/`)
- **`api.js`** - Centralized API service with axios configuration

### Context (`src/context/`)
- Authentication context for user state management

### Hooks (`src/hooks/`)
- Custom React hooks for reusable logic

### Utils (`src/utils/`)
- Utility functions and helpers

## 🔧 Backend Structure (`backend/`)

### Core Files
- **`package.json`** - Backend dependencies and scripts
- **`server.js`** - Main server entry point
- **`test-*.js`** - Various test utilities
- **`generate-password-hash.js`** - Password hashing utility
- **`minimal-server.js`** - Minimal server for testing

### Source Code (`src/`)
```
src/
├── server.js                # Main server configuration
├── config/                   # Configuration files
├── database/                 # Database setup and migrations
├── middleware/               # Express middleware
├── routes/                   # API route handlers
└── utils/                    # Utility functions
```

### Configuration (`src/config/`)
```
config/
├── database.js              # Database connection configuration
└── swagger.js               # API documentation configuration
```

### Database (`src/database/`)
```
database/
├── migrate.js               # Database migration scripts
└── seed.js                  # Database seeding scripts
```

### Middleware (`src/middleware/`)
```
middleware/
├── auth.js                  # Authentication middleware
├── errorHandler.js          # Error handling middleware
└── notFound.js              # 404 handler middleware
```

### Routes (`src/routes/`)
```
routes/
├── auth.js                  # Authentication routes
├── users.js                 # User management routes
├── academic.js              # Academic module routes
├── attendance.js            # Attendance management routes
├── courses.js               # Course management routes
├── finance.js               # Finance module routes
├── grades.js                # Grade management routes
├── hr.js                    # HR module routes
└── students.js              # Student management routes
```

### Utils (`src/utils/`)
- Logger configuration and utility functions

## 🗄️ Database Schema

The system uses PostgreSQL with a comprehensive schema including:

### Core Tables
- **Users** - User accounts and authentication
- **Students** - Student information and records
- **Faculty** - Faculty and staff information
- **Courses** - Course catalog and curriculum
- **Grades** - Academic performance tracking
- **Attendance** - Attendance records
- **Payments** - Financial transactions
- **Employees** - HR employee records
- **Assets** - Asset and inventory management

## 🔐 Authentication & Authorization

### User Roles
- **Admin** - Full system access
- **Academic Staff** - Academic module access
- **Finance Staff** - Finance module access
- **HR Personnel** - HR module access
- **Marketing Team** - Marketing features access
- **Student** - Limited student-specific access

### Security Features
- JWT token-based authentication
- bcrypt password hashing
- Role-based access control (RBAC)
- Protected routes and middleware
- Rate limiting and security headers

## 🚀 Key Features

### Phase 1: Foundation ✅
- Authentication system
- Database architecture
- API framework
- Frontend foundation

### Phase 2: Academic Module ✅
- Student management
- Course management
- Grade tracking
- Attendance system

### Phase 3: Finance Module ✅
- Fee management
- Payment processing
- Budget tracking
- Financial reporting

### Phase 4: HR Module ✅
- Employee management
- Payroll system
- Leave management
- Asset tracking

### Phase 5: Integration ✅
- System integration
- Community chat system
- Advanced analytics

### Phase 6: Deployment ⏳
- Production deployment
- Documentation completion

## 💬 Community Chat System

### Features
- Real-time messaging interface
- Multi-channel support (General, Academic, Announcements, Social)
- File sharing capabilities
- User presence indicators
- Role-based user identification
- Responsive design with glass-morphism UI

### Components
- **ChatButton** - Floating chat trigger
- **CommunityChat** - Main chat interface
- **ChatSidebar** - Channel navigation
- **MessageList** - Message display
- **MessageInput** - Message composition

## 🛠️ Development Tools

### Frontend
- **React 18** - UI framework
- **Material-UI** - Component library
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Query** - Data fetching
- **Formik + Yup** - Form handling
- **Recharts** - Data visualization

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Sequelize** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Swagger** - API documentation

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework

## 📊 Project Statistics

- **Total Files**: 100+ files
- **Frontend Components**: 20+ components
- **Backend Routes**: 9 route modules
- **Database Tables**: 50+ tables
- **API Endpoints**: 100+ endpoints
- **Test Coverage**: Comprehensive test suite

## 🚀 Getting Started

### Prerequisites
- Node.js >= 16.0.0
- npm >= 8.0.0
- PostgreSQL database
- Docker (optional)

### Installation
```bash
# Clone repository
git clone <repository-url>
cd educational-erp-system

# Install dependencies
npm run setup

# Start development servers
npm run dev
```

### Available Scripts
- `npm run dev` - Start development servers
- `npm run build` - Build frontend for production
- `npm run test` - Run all tests
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data
- `npm run lint` - Run code linting
- `npm run format` - Format code with Prettier

## 📚 API Documentation

- **Development**: http://localhost:3001/api-docs
- **Health Check**: http://localhost:3001/health
- **API Base URL**: http://localhost:3001/api

## 🔍 Code Quality

- **ESLint** - JavaScript/React linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **lint-staged** - Pre-commit linting
- **Jest** - Unit and integration testing

## 📈 Performance

- **Frontend**: Optimized with React.memo and lazy loading
- **Backend**: Compression, rate limiting, and caching
- **Database**: Optimized queries and indexing
- **Assets**: Image optimization and CDN ready

## 🔒 Security

- **Authentication**: JWT tokens with secure storage
- **Authorization**: Role-based access control
- **Input Validation**: Comprehensive validation with Joi
- **Security Headers**: Helmet.js implementation
- **Rate Limiting**: Express rate limiting
- **CORS**: Proper CORS configuration

## 📝 Documentation

- **README.md** - Comprehensive project documentation
- **API Docs** - Swagger-generated API documentation
- **Code Comments** - Inline code documentation
- **Component Documentation** - React component documentation

---

*This codebase index was generated automatically and provides a comprehensive overview of the Educational ERP System architecture and implementation.*