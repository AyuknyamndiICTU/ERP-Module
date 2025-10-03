# CRUD Operations Test Report

**Test Date:** 2025-09-16T00:19:13.129Z
**Overall Success Rate:** 58.33%
**Total Tests:** 12 (7 passed, 5 failed)

## Summary by Module

| Module | Total | Passed | Failed | Success Rate |
|--------|-------|--------|--------|--------------|
| Academic | 2 | 1 | 1 | 50.0% |
| HR | 2 | 1 | 1 | 50.0% |
| Finance | 2 | 1 | 1 | 50.0% |
| Auth | 3 | 2 | 1 | 66.7% |
| RBAC | 3 | 2 | 1 | 66.7% |

## Detailed Test Results

### Academic Module

✅ **Get Students** (GET /students)

❌ **Get Student by ID** (GET /students/1)
   - Error: Request failed with status code 500

### HR Module

✅ **Get Employees** (GET /hr/employees)

❌ **Get Employee by ID** (GET /hr/employees/1)
   - Error: Request failed with status code 500

### Finance Module

✅ **Get Invoices** (GET /finance/invoices)

❌ **Get Invoice by ID** (GET /finance/invoices/1)
   - Error: Request failed with status code 500

### Auth Module

✅ **Login Admin** (POST /auth/login)

✅ **Login Student** (POST /auth/login)

❌ **Get Profile** (GET /auth/profile)
   - Error: Request failed with status code 500

### RBAC Module

❌ **Student Access Admin Endpoint** (GET /hr/employees)
   - Error: Request failed with status code 403

✅ **Student Access Denied** (GET /hr/employees)

✅ **Lecturer Access Academic** (GET /academic/courses)

