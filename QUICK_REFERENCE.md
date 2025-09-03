# 🚀 Quick Reference - Educational ERP System

## 📋 Essential Commands

### Development Setup
```bash
npm run setup          # Install all dependencies
npm run dev           # Start both frontend and backend
npm run migrate       # Run database migrations
npm run seed          # Seed sample data
```

### Individual Services
```bash
npm run server        # Backend only (port 3001)
npm run client        # Frontend only (port 3000)
```

### Code Quality
```bash
npm run lint          # Lint both frontend and backend
npm run format        # Format code with Prettier
npm run test          # Run all tests
```

## 🔗 Important URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **API Documentation**: http://localhost:3001/api-docs
- **Health Check**: http://localhost:3001/health

## 📁 Key File Locations

### Backend
- **Main Server**: `backend/src/server.js`
- **Routes**: `backend/src/routes/` (auth, users, academic, finance, hr)
- **Database**: `backend/src/config/database.js`
- **Middleware**: `backend/src/middleware/`

### Frontend
- **App Entry**: `frontend/src/App.js`
- **Pages**: `frontend/src/pages/` (Dashboard, Academic, Finance, HR, Auth)
- **Components**: `frontend/src/components/`
- **API Service**: `frontend/src/services/api.js`
- **Auth Context**: `frontend/src/context/AuthContext.js`

## 🔐 User Roles
- **Admin**: Full system access
- **Faculty**: Academic module access
- **Student**: Limited academic access
- **HR**: HR module access
- **Marketing**: Finance module access

## 🗄️ Database Schema
- **ORM**: Sequelize with PostgreSQL
- **Tables**: 50+ tables covering all modules
- **Migrations**: `backend/src/database/migrate.js`
- **Seeding**: `backend/src/database/seed.js`

## 🧪 Testing
- **Backend**: Jest + Supertest for API testing
- **Frontend**: React Testing Library + Jest
- **Coverage**: Configured for both layers

## 📦 Key Dependencies

### Backend
- Express.js, Sequelize, JWT, bcrypt, Stripe, Swagger

### Frontend  
- React, Material-UI, React Router, Axios, React Query, Formik

## 🚨 Common Issues & Solutions
1. **Database Connection**: Ensure PostgreSQL is running
2. **CORS Errors**: Check CORS_ORIGIN environment variable
3. **Authentication**: Verify JWT token in localStorage
4. **Port Conflicts**: Backend uses 3001, frontend uses 3000