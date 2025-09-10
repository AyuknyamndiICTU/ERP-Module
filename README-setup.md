# 🚀 Educational ERP System - Development Setup

## Quick Start

### Development Mode with Hot Reloading

Choose your platform:

**Windows:**
```bash
# Double-click or run in command prompt
dev-start.bat
```

**Linux/macOS:**
```bash
# Make executable and run
chmod +x dev-start.sh
./dev-start.sh
```

**Manual Start (Advanced):**
```bash
# Backend (with hot reload)
cd backend
npm run dev

# Frontend (separate terminal)
cd frontend
npm start

# Or with custom port
PORT=3002 REACT_APP_API_URL=http://localhost:3001/api npm start
```

## 🎯 Working Credentials

| Role | Email | Password |
|------|-------|----------|
| **Test User** | `test@example.com` | `password123` ✅ |
| **Admin** | `admin@erp.local` | `password123` |
| **Coordinator** | `ict.coordinator@ictu.edu.cm` | `password123` |
| **Student** | `student.james@ictu.edu.cm` | `password123` |

## 🔄 Development Features

### ✅ Hot Reloading
- **Backend**: Auto-restarts on file changes
- **Frontend**: Live reload in browser
- **Database**: Changes sync automatically

### 📊 Environment Setup
- Separate dev/prod configurations
- Automatic dependency checking
- Process management
- Colored logging

## 🏗️ Project Structure

```
ERP Project/
├── backend/                 # Node.js/Express Backend
│   ├── src/
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── config/         # Database & app config
│   │   └── utils/          # Helper utilities
│   ├── nodemon.json        # Watch configuration
│   └── package.json        # Backend dependencies
│
├── frontend/                # React Frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── context/        # React context
│   └── package.json        # Frontend dependencies
│
├── database/                # Database files
│   ├── schema/            # SQL schema files
│   ├── seeds/             # Seed data
│   └── migrations/        # Database migrations
│
├── dev-start.bat          # Windows development launcher
├── dev-start.sh           # Linux/macOS development launcher
└── logs/                  # Application logs
```

## 🛠️ Available Scripts

### Backend
```bash
npm run dev          # Start with hot reload
npm start            # Production mode
npm run db:reset     # Reset database (dev only)
npm run seed         # Seed database
npm test             # Run tests
npm run lint         # Lint code
```

### Frontend
```bash
npm start           # Start with hot reload (React default)
npm run build       # Production build
npm test            # Run tests
npm run lint        # Lint code
```

## 🔧 Configuration

### Backend Environment Variables
Create `backend/.env`:
```env
NODE_ENV=development
PORT=3001
JWT_SECRET=your-super-secret-jwt-key
DATABASE_URL=postgresql://user:password@localhost:5432/erp_db
```

### Frontend Environment Variables
These are set automatically by our startup scripts:
```env
REACT_APP_API_URL=http://localhost:3001/api
PORT=3002
```

## 📊 Testing the System

### 🎓 Academic Management
- **Login**: `student.james@ictu.edu.cm`
- **Test**: View grades, attendance, enroll in courses
- **Grade Access**: See different status grades (published/draft)

### 💰 Finance Management
- **Login**: `admin@erp.local`
- **Test**: Fee payments, installments, block/unblock students
- **Scenarios**: Paid students, overdue payments, partial payments

### 📞 Complaint System
- **Login**: Any student account
- **Test**: Submit complaints, check status, view responses
- **Types**: Grade appeals, course issues, harassment reports

### 🔔 Notification Center
- Automatic notifications for grades, fees, deadlines
- Real-time updates and different priority levels

## 🚀 Production Deployment

### Build for Production
```bash
# Backend
cd backend
npm run build
NODE_ENV=production npm start

# Frontend
cd frontend
npm run build
npm run serve  # or deploy build/ folder
```

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure production database
- [ ] Set secure JWT secrets
- [ ] Enable HTTPS/TLS
- [ ] Configure reverse proxy (nginx)
- [ ] Set up monitoring (logs, health checks)
- [ ] Configure backups

## 🔍 Troubleshooting

### Hot Reload Not Working
```bash
# Backend not restarting? Check nodemon config
cd backend
npm run dev:legacy  # Alternative watch mode

# Frontend not live reloading?
cd frontend
rm -rf node_modules/.cache  # Clear React cache
npm start
```

### Database Issues
```bash
# Reset and seed database
cd backend
npm run db:reset

# Check database logs
tail -f ../logs/backend.log | grep -i database
```

### Port Conflicts
```bash
# Kill processes on ports
npx kill-port 3001 3002

# Or manually find PIDs
lsof -ti:3001 | xargs kill -9
```

### Logs and Debugging
```bash
# View real-time logs
tail -f logs/backend.log
tail -f logs/frontend.log

# Debug mode
cd backend
npm run dev:inspect  # Debug backend
cd frontend
npm start -- --inspect  # Debug frontend
```

## 📈 Performance Optimization

### Development
- Hot reloading enabled
- Source maps for debugging
- Bundle analysis available

### Production
- Code minification
- Bundle splitting
- Service worker caching
- Database query optimization

## 🎯 Development Workflow

```mermaid
graph LR
A[Code Change] --> B[Hot Reload]
B --> C[Test in Browser]
C --> D[Debug/Improve]
D --> A

E[Database Change] --> F[Auto Migration]
F --> G[Test Data]
G --> H[Verify API]
```

## 📞 Support

For issues:
1. Check application logs in `logs/` directory
2. Verify environment variables are set
3. Ensure database is running and accessible
4. Check network connectivity between services

**Happy developing! 🎉**
