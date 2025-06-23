# 🚀 **Advanced Applicant Tracking System (ATS)**

> A comprehensive job portal and recruitment management platform built with Angular and Node.js

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Angular](https://img.shields.io/badge/Angular-17+-red.svg)](https://angular.io/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-brightgreen.svg)](https://www.mongodb.com/)

---

## 📋 **Table of Contents**

1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Technology Stack](#-technology-stack)
4. [System Architecture](#-system-architecture)
5. [Authentication & Security](#-authentication--security)
6. [Core Functionalities](#-core-functionalities)
7. [API Documentation](#-api-documentation)
8. [Installation Guide](#-installation-guide)
9. [Usage Guidelines](#-usage-guidelines)
10. [Security Features](#-security-features)
11. [Performance & Optimization](#-performance--optimization)
12. [Contributing](#-contributing)

---

## 🎯 **Project Overview**

The **Advanced Applicant Tracking System (ATS)** is a full-stack web application designed to streamline the recruitment process for organizations of all sizes. Built with modern technologies including Angular 17+, Node.js, Express.js, and MongoDB, this system provides a unified platform for job seekers, recruiters, and administrators.

### **🌟 Key Highlights**

- **Unified Login System**: Single authentication portal for all user types
- **Role-Based Access Control**: Intelligent dashboard routing based on user privileges
- **Real-Time Notifications**: WebSocket-powered live updates
- **Advanced Security**: Multi-layer authentication with OTP verification
- **Mobile-First Design**: Responsive UI optimized for all devices
- **Scalable Architecture**: Microservices-ready design pattern

### **🎨 Design System**

Based on the proven HMS (Hospital Management System) design patterns:
- **Primary Color**: `#5f6FFF` (Professional Blue-Purple)
- **Typography**: Outfit font family (Google Fonts)
- **UI Framework**: TailwindCSS with custom utility classes
- **Component Library**: Custom Angular components with consistent styling

---

## 🔥 **Key Features**

### **1. 🔐 Unified Authentication System**

#### **Single Login Portal**
All users access the system through one login page with intelligent role-based redirection:

```typescript
// Authentication Flow
┌─────────────────┐
│   Single Login  │
│      Page       │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Role Detection  │
│   & Validation  │
└─────────────────┘
         │
    ┌────┼────┐
    ▼    ▼    ▼
┌─────┐ ┌─────┐ ┌─────┐
│User │ │Recrui│ │Admin│
│Dash │ │ter  │ │Dash │
│board│ │Dash │ │board│
└─────┘ └─────┘ └─────┘
```

#### **Security Features**
- **Progressive Account Lockout**: Increasing delays after failed login attempts
- **OTP Verification**: Email-based two-factor authentication
- **Session Management**: One active session per user (concurrent login prevention)
- **Password Security**: Real-time strength validation with visual feedback
- **JWT Token Management**: Secure token-based authentication with refresh tokens

### **2. 👥 Multi-Role Dashboard System**

#### **🎯 Job Seeker Dashboard**
**Core Features**:
- **Profile Management**: Comprehensive profile builder with resume upload
- **Job Discovery**: Advanced search with filters (location, salary, company size, etc.)
- **Application Tracking**: Real-time status updates with timeline view
- **Saved Jobs**: Bookmark and organize job opportunities
- **Interview Management**: Calendar integration for scheduling
- **Personalized Recommendations**: AI-powered job matching

**Dashboard Layout**:
```
┌─────────────────────────────────────────────────────┐
│                    Header                           │
├─────────────────────────────────────────────────────┤
│ Sidebar │              Main Content               │
│         │ ┌─────────────────────────────────────┐ │
│ - Home  │ │        Application Status           │ │
│ - Jobs  │ │     ┌─────┐ ┌─────┐ ┌─────┐         │ │
│ - Apps  │ │     │ 12  │ │  8  │ │  3  │         │ │
│ - Profile│     │Applied││Under│ │Hired│         │ │
│ - Settings│     └─────┘ └─────┘ └─────┘         │ │
│         │ └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

#### **🏢 Recruiter Dashboard**  
**Core Features**:
- **Job Posting Management**: Rich text editor with media support
- **Candidate Pipeline**: Drag-and-drop application management
- **Interview Coordination**: Scheduling and communication tools
- **Team Collaboration**: Multi-recruiter job assignments
- **Analytics & Reporting**: Recruitment metrics and insights
- **Bulk Operations**: Mass actions for efficiency

#### **⚡ Admin Dashboard**
**Core Features**:
- **User Management**: Complete control over all system users
- **Account Expiry Control**: Flexible user lifecycle management
- **Activity Monitoring**: Comprehensive audit logs
- **Skills Database Management**: System-wide skills and qualifications
- **System Configuration**: Platform settings and customization
- **Analytics & Reporting**: System-wide performance metrics

### **3. 💼 Advanced Job Management**

#### **Job Posting System**
```typescript
Job Posting Features:
├── Rich Text Editor (with media support)
├── Multi-Category Classification
├── Skills-Based Requirements
├── Salary Range Configuration
├── Application Deadline Management
├── Auto-Posting to Multiple Platforms
└── SEO Optimization
```

#### **Application Pipeline**
```
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│ Applied │ → │Screening│ → │Interview│ → │  Hired  │
└─────────┘   └─────────┘   └─────────┘   └─────────┘
     │             │             │             │
     ▼             ▼             ▼             ▼
  Auto-ACK    Skills Test   Schedule Meet   Send Offer
```

### **4. 🔔 Real-Time Notification System**

#### **Notification Types**
- **Application Updates**: Status changes, interview invitations
- **Job Alerts**: New job matches based on profile
- **System Notifications**: Account expiry warnings, security alerts
- **Communication**: Messages between recruiters and candidates

#### **Delivery Channels**
```typescript
Notification Channels:
├── In-App Notifications (Real-time WebSocket)
├── Email Notifications (Customizable templates)
├── Browser Push Notifications
└── SMS Notifications (Optional integration)

Features:
├── Read/Unread Status Tracking
├── Notification History & Archive
├── User Preference Management
├── Bulk Notification Operations
└── Template Customization
```

---

## 🛠️ **Technology Stack**

### **Frontend (Angular 17+)**
```typescript
├── Angular 17+ (TypeScript Framework)
├── TailwindCSS (Utility-first CSS Framework)
├── Angular Material (UI Component Library)
├── RxJS (Reactive Programming)
├── Socket.IO Client (Real-time Communication)
├── Chart.js (Data Visualization)
├── Angular CDK (Component Development Kit)
└── PWA Support (Service Workers)
```

### **Backend (Node.js/Express)**
```javascript
├── Node.js 18+ (JavaScript Runtime)
├── Express.js (Web Application Framework)
├── MongoDB with Mongoose (Database & ODM)
├── Socket.IO (Real-time Bidirectional Communication)
├── JWT (JSON Web Tokens for Authentication)
├── Bcrypt (Password Hashing)
├── Multer (File Upload Handling)
├── Nodemailer (Email Service)
├── Winston (Logging)
└── Redis (Caching & Session Storage)
```

### **Database Design (MongoDB)**
```javascript
Collections Structure:
├── users
│   ├── _id, name, email, password, role
│   ├── profile, preferences, settings
│   └── accountExpiry, isActive, lastLogin
├── jobs
│   ├── _id, title, description, requirements
│   ├── company, location, salary, type
│   └── status, createdBy, applications[]
├── applications
│   ├── _id, jobId, userId, status
│   ├── resume, coverLetter, appliedAt
│   └── interviewSchedule, feedback
├── companies
│   ├── _id, name, description, logo
│   └── locations[], industry, size
├── skills
│   ├── _id, name, category, level
│   └── isActive, createdAt, updatedAt
├── notifications
│   ├── _id, userId, type, title, message
│   └── isRead, createdAt, expiresAt
└── activityLogs
    ├── _id, userId, action, details
    └── ipAddress, userAgent, timestamp
```

---

## 🏗️ **System Architecture**

### **Frontend Architecture Pattern**
```
src/app/
├── core/                    # Singleton services, guards, interceptors
│   ├── auth/               # Authentication service & guards
│   ├── guards/             # Route protection
│   ├── interceptors/       # HTTP request/response handling
│   ├── services/           # Core business services
│   └── models/             # TypeScript interfaces & models
├── shared/                  # Reusable components & utilities
│   ├── components/         # Common UI components
│   ├── pipes/              # Custom Angular pipes
│   ├── directives/         # Custom Angular directives
│   └── utils/              # Helper functions
├── features/               # Feature modules (lazy-loaded)
│   ├── auth/              # Authentication module
│   ├── dashboard/         # Dashboard module
│   ├── jobs/              # Job management module
│   ├── applications/      # Application tracking module
│   ├── profile/           # User profile module
│   └── admin/             # Admin panel module
└── assets/                # Static resources
```

### **Backend Architecture Pattern**
```
backend/
├── controllers/            # Request handlers
├── models/                # Mongoose schemas
├── routes/                # API endpoint definitions
├── middleware/            # Custom middleware functions
├── services/              # Business logic layer
├── utils/                 # Helper functions
├── config/                # Configuration files
├── uploads/               # File storage
└── tests/                 # Test suites
```

---

## 🔐 **Authentication & Security**

### **🎯 Single Login System Implementation**

#### **Login Flow Diagram**
```typescript
┌─────────────────┐
│ User Login Page │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Credential      │
│ Validation      │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Generate JWT    │
│ with Role Info  │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Frontend Route  │
│ Guard Check     │
└─────────────────┘
         │
    ┌────┼────┐
    ▼    ▼    ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│ User    │ │Recruiter│ │ Admin   │
│Dashboard│ │Dashboard│ │Dashboard│
└─────────┘ ├─────────┤ └─────────┘
```

### **🔒 Advanced Security Features**

#### **One User Per Session Implementation**
```typescript
// Session Management Logic
class SessionManager {
  async login(userId: string): Promise<string> {
    // 1. Check for existing active sessions
    const existingSessions = await this.getActiveSessions(userId);
    
    // 2. Invalidate all existing sessions
    await this.invalidateSessions(existingSessions);
    
    // 3. Create new session token
    const sessionToken = this.generateUniqueToken();
    
    // 4. Store session in database
    await this.storeSession(userId, sessionToken);
    
    return sessionToken;
  }
  
  async validateSession(token: string): Promise<boolean> {
    const session = await this.getSession(token);
    return session && !session.isExpired;
  }
}
```

#### **Progressive Account Lockout**
```typescript
Login Attempt Handling:
├── Attempt 1-3: Immediate response
├── Attempt 4-6: 5-minute delay
├── Attempt 7-9: 15-minute delay
├── Attempt 10+: 1-hour delay
└── After 24 hours: Reset counter
```

#### **Password Security System**
```typescript
Password Requirements:
├── Minimum 8 characters
├── At least 1 uppercase letter
├── At least 1 lowercase letter  
├── At least 1 number
├── At least 1 special character
├── No common passwords (dictionary check)
└── Visual strength indicator with color coding
```

---

## 🎛️ **Core Functionalities**

### **1. 📊 Account Expiry Management System**

#### **Flexible Expiry Configuration**
```typescript
Account Expiry Features:
├── Granular Time Setting
│   ├── Minutes (for testing)
│   ├── Hours (short-term access)
│   ├── Days (standard accounts)
│   └── Months (premium accounts)
├── Automated Notification System
│   ├── 7 days before expiry
│   ├── 3 days before expiry
│   ├── 1 day before expiry
│   └── On expiry day
├── Grace Period Management
├── Bulk Expiry Operations
├── Account Reactivation Workflow
└── Expiry Analytics & Reporting
```

#### **Implementation Details**
```typescript
// Cron Job for Expiry Management
class ExpiryManager {
  @Cron('0 * * * *') // Run every hour
  async checkAccountExpiry() {
    const expiringAccounts = await this.getExpiringAccounts();
    
    for (const account of expiringAccounts) {
      const timeLeft = this.calculateTimeLeft(account.expiresAt);
      
      if (timeLeft <= 0) {
        await this.suspendAccount(account.userId);
        await this.sendExpiryNotification(account);
      } else if (timeLeft <= 24 * 60 * 60 * 1000) { // 24 hours
        await this.sendWarningNotification(account, timeLeft);
      }
    }
  }
}
```

### **2. 🎓 Skills & Qualification Management**

#### **Centralized Skills Database**
```typescript
Skills Management Features:
├── Hierarchical Skill Categories
│   ├── Technical Skills
│   ├── Soft Skills  
│   ├── Industry-Specific Skills
│   └── Certifications
├── Skill Level Assessment
│   ├── Beginner
│   ├── Intermediate
│   ├── Advanced
│   └── Expert
├── Auto-Suggestion System
├── Skills Verification
├── Skills Gap Analysis
└── Industry Trend Analytics
```

#### **Qualification Verification System**
```typescript
class SkillsManager {
  async addSkill(skillData: SkillData) {
    // Validate skill against industry standards
    const validation = await this.validateSkill(skillData);
    
    if (validation.isValid) {
      // Add to centralized database
      const skill = await this.skillRepository.create(skillData);
      
      // Update related job postings
      await this.updateJobRecommendations(skill);
      
      return skill;
    }
  }
  
  async getSkillSuggestions(query: string) {
    return await this.skillRepository.findSimilar(query);
  }
}
```

### **3. 📝 Comprehensive Activity Logging**

#### **Activity Tracking System**
```typescript
Logged Activities:
├── Authentication Events
│   ├── Login attempts (successful/failed)
│   ├── Password changes
│   ├── Account lockouts
│   └── Session management
├── Profile Management
│   ├── Profile updates
│   ├── Resume uploads
│   ├── Skill additions
│   └── Preference changes
├── Job-Related Activities
│   ├── Job searches
│   ├── Job applications
│   ├── Job saves/bookmarks
│   └── Application status updates
├── Communication Events
│   ├── Messages sent/received
│   ├── Interview scheduling
│   └── Notification interactions
└── Administrative Actions
    ├── User management
    ├── System configuration
    ├── Report generation
    └── Bulk operations
```

#### **Activity Log Structure**
```typescript
interface ActivityLog {
  _id: ObjectId;
  userId: ObjectId;
  sessionId: string;
  action: string;
  category: 'AUTH' | 'PROFILE' | 'JOB' | 'ADMIN' | 'SYSTEM';
  details: {
    resource?: string;
    oldValue?: any;
    newValue?: any;
    metadata?: any;
  };
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}
```

### **4. 🔔 Real-Time Notification Engine**

#### **WebSocket Implementation**
```typescript
class NotificationService {
  private io: SocketIOServer;
  
  async sendRealTimeNotification(userId: string, notification: Notification) {
    // Store notification in database
    await this.notificationRepository.create(notification);
    
    // Send real-time update to connected clients
    this.io.to(`user_${userId}`).emit('notification', notification);
    
    // Send email notification if user is offline
    const isOnline = this.isUserOnline(userId);
    if (!isOnline) {
      await this.emailService.sendNotification(userId, notification);
    }
  }
  
  async markAsRead(userId: string, notificationId: string) {
    await this.notificationRepository.markAsRead(notificationId);
    this.io.to(`user_${userId}`).emit('notification_read', notificationId);
  }
}
```

---

## 🚀 **API Documentation**

### **Authentication Endpoints**

#### **POST /api/auth/login**
Unified login endpoint for all user types.

```typescript
Request Body:
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Success Response (200):
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "_id": "user-id",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "JOB_SEEKER" // or "RECRUITER" or "ADMIN"
  },
  "redirectTo": "/user-dashboard" // Role-based redirect
}

Error Responses:
400 - Invalid credentials
423 - Account locked
410 - Account expired
```

#### **POST /api/auth/register**
User registration with OTP verification.

```typescript
Request Body:
{
  "name": "John Doe",
  "email": "user@example.com", 
  "password": "SecurePass123!",
  "role": "JOB_SEEKER"
}

Success Response (200):
{
  "success": true,
  "message": "OTP sent to your email"
}
```

#### **POST /api/auth/verify-otp**
OTP verification for registration completion.

```typescript
Request Body:
{
  "email": "user@example.com",
  "otp": "123456"
}

Success Response (200):
{
  "success": true,
  "token": "jwt-token-here",
  "user": { /* user object */ }
}
```

### **Job Management Endpoints**

#### **GET /api/jobs**
Get job listings with advanced filtering (Authenticated users).

```typescript
Query Parameters:
- page: number (default: 1)
- limit: number (default: 10)
- search: string
- category: string
- location: string
- salaryMin: number
- salaryMax: number
- jobType: "FULL_TIME" | "PART_TIME" | "CONTRACT"
- remote: boolean

Success Response (200):
{
  "success": true,
  "jobs": [
    {
      "_id": "job-id",
      "title": "Senior Software Engineer",
      "company": "Tech Corp",
      "location": "San Francisco, CA",
      "salary": { "min": 100000, "max": 150000 },
      "type": "FULL_TIME",
      "remote": true,
      "skills": ["JavaScript", "React", "Node.js"],
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "pages": 15,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### **GET /api/public/jobs**
Public job listings (No authentication required).

```typescript
// Same structure as authenticated endpoint
// but with limited fields for public access
```

#### **POST /api/jobs**
Create new job posting (Recruiter/Admin only).

```typescript
Request Body:
{
  "title": "Senior Software Engineer",
  "description": "Job description here...",
  "requirements": ["5+ years experience", "React expertise"],
  "skills": ["JavaScript", "React", "Node.js"],
  "salary": { "min": 100000, "max": 150000 },
  "location": "San Francisco, CA",
  "type": "FULL_TIME",
  "remote": true,
  "applicationDeadline": "2024-12-31T23:59:59Z"
}
```

### **Application Management Endpoints**

#### **POST /api/applications**
Submit job application.

```typescript
Request Body (multipart/form-data):
{
  "jobId": "job-id-here",
  "coverLetter": "Cover letter text...",
  "resume": File // PDF/DOC file
}

Success Response (201):
{
  "success": true,
  "application": {
    "_id": "application-id",
    "status": "SUBMITTED",
    "appliedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### **GET /api/applications/user**
Get user's job applications.

```typescript
Success Response (200):
{
  "success": true,
  "applications": [
    {
      "_id": "application-id",
      "job": { /* job details */ },
      "status": "UNDER_REVIEW",
      "appliedAt": "2024-01-01T00:00:00Z",
      "lastUpdated": "2024-01-02T00:00:00Z"
    }
  ]
}
```

---

## 📦 **Installation Guide**

### **Prerequisites**
```bash
System Requirements:
├── Node.js 18.x or higher
├── MongoDB 6.x or higher  
├── Angular CLI 17.x or higher
├── Git for version control
└── Redis (optional, for caching)
```

### **Step 1: Backend Setup**

```bash
# Clone the repository
git clone https://github.com/your-org/ats-project.git
cd ats-project

# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure environment variables
nano .env
```

#### **Environment Configuration (.env)**
```env
# Application
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:4200

# Database
MONGODB_URI=mongodb://localhost:27017/ats
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=24h
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRE=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880  # 5MB
ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png

# Security
BCRYPT_ROUNDS=12
OTP_EXPIRE=600000  # 10 minutes
SESSION_TIMEOUT=1800000  # 30 minutes
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_TIME=900000  # 15 minutes

# Rate Limiting
RATE_LIMIT_WINDOW=900000  # 15 minutes
RATE_LIMIT_MAX=100
```

```bash
# Start the backend server
npm run dev

# Backend should be running on http://localhost:5000
```

### **Step 2: Frontend Setup**

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies  
npm install

# Create environment file
cp src/environments/environment.example.ts src/environments/environment.ts

# Configure environment
nano src/environments/environment.ts
```

#### **Frontend Environment Configuration**
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  socketUrl: 'http://localhost:5000',
  uploadUrl: 'http://localhost:5000/uploads',
  
  // File upload settings
  maxFileSize: 5 * 1024 * 1024, // 5MB
  supportedFileTypes: ['.pdf', '.doc', '.docx'],
  
  // Session settings
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  tokenRefreshThreshold: 5 * 60 * 1000, // 5 minutes
  
  // Feature flags
  features: {
    realTimeNotifications: true,
    fileUpload: true,
    videoInterviews: false,
    advancedAnalytics: true
  }
};
```

```bash
# Start the frontend development server
ng serve

# Frontend should be running on http://localhost:4200
```

### **Step 3: Database Setup**

```bash
# Start MongoDB (if using local installation)
mongod --dbpath /data/db

# Create database and initial data
mongo ats < scripts/init-db.js

# Import sample data (optional)
mongoimport --db ats --collection skills --file data/skills.json
mongoimport --db ats --collection companies --file data/companies.json
```

### **Step 4: Verification**

```bash
# Check if all services are running
curl http://localhost:5000/api/health    # Backend health check
curl http://localhost:4200               # Frontend access
mongo ats --eval "db.stats()"            # Database connection
```

---

## 📖 **Usage Guidelines**

### **👨‍💼 Administrator Guide**

#### **Initial System Setup**
1. **First-Time Login**: Use default admin credentials (change immediately)
2. **System Configuration**: 
   - Configure email settings
   - Set up notification templates
   - Configure file upload limits
   - Set security policies

#### **User Management Workflow**
```typescript
Admin Dashboard → User Management:

1. View All Users
   ├── Filter by role (Job Seeker/Recruiter/Admin)
   ├── Search by name, email, or ID
   ├── Sort by registration date, last activity
   └── Export user data (CSV/Excel)

2. Account Expiry Management
   ├── Set individual user expiry dates
   ├── Bulk expiry operations
   ├── Monitor expiry notifications
   ├── Handle reactivation requests
   └── View expiry analytics

3. Activity Monitoring
   ├── Real-time activity feed
   ├── Filter by user, action, or time range
   ├── Export audit logs
   ├── Set up automated alerts
   └── Generate compliance reports
```

#### **Skills Database Management**
```typescript
Admin Dashboard → Skills Management:

1. Skills CRUD Operations
   ├── Add new skills and categories
   ├── Edit existing skill definitions
   ├── Deactivate obsolete skills
   └── Merge duplicate skills

2. Skill Analytics
   ├── Most in-demand skills
   ├── Skill trend analysis
   ├── Skills gap identification
   └── Industry benchmarking
```

### **🏢 Recruiter Guide**

#### **Job Posting Workflow**
```typescript
Recruiter Dashboard → Job Management:

1. Create Job Posting
   ├── Use rich text editor for description
   ├── Set required skills and qualifications
   ├── Configure salary range and benefits
   ├── Set application deadline
   ├── Choose visibility settings
   └── Preview and publish

2. Application Management
   ├── Review incoming applications
   ├── Filter and sort candidates
   ├── Schedule interviews
   ├── Collaborate with team members
   ├── Update application status
   └── Send personalized responses
```

#### **Interview Management**
```typescript
Interview Workflow:
├── Schedule Interview
│   ├── Select available time slots
│   ├── Choose interview type (phone/video/in-person)
│   ├── Add interview panel members
│   └── Send calendar invitations
├── Conduct Interview
│   ├── Access candidate profile
│   ├── Use interview templates
│   ├── Record feedback and scores
│   └── Share notes with team
└── Post-Interview Actions
    ├── Update application status
    ├── Schedule follow-up interviews
    ├── Send feedback to candidate
    └── Make hiring decision
```

### **🔍 Job Seeker Guide**

#### **Profile Setup & Optimization**
```typescript
User Dashboard → Profile Management:

1. Basic Information
   ├── Personal details and contact info
   ├── Professional summary
   ├── Career objectives
   └── Preferred job locations

2. Experience & Education
   ├── Work history with descriptions
   ├── Educational background
   ├── Certifications and licenses
   └── Projects and achievements

3. Skills & Preferences
   ├── Technical and soft skills
   ├── Skill level assessments
   ├── Job preferences (salary, type, remote)
   └── Availability and notice period
```

#### **Job Search Strategy**
```typescript
Effective Job Search Process:

1. Advanced Search & Filters
   ├── Keyword-based search
   ├── Location and remote options
   ├── Salary range filtering
   ├── Company size preferences
   ├── Job type (full-time/part-time/contract)
   └── Industry and role level

2. Application Management
   ├── Track application status
   ├── Set up job alerts
   ├── Save interesting opportunities
   ├── Monitor application deadlines
   └── Follow up on applications

3. Interview Preparation
   ├── Research company information
   ├── Prepare for common questions
   ├── Practice technical assessments
   ├── Schedule and manage interviews
   └── Follow up after interviews
```

---

## 🛡️ **Security Features**

### **🔐 Multi-Layer Security Architecture**

#### **Authentication Security**
```typescript
Security Layers:
├── Input Validation & Sanitization
├── Rate Limiting & DDoS Protection
├── JWT Token Management
├── Session Security
├── Password Security
├── Account Lockout Protection
└── Audit Logging
```

#### **Data Protection Measures**
```typescript
Data Security Implementation:
├── Encryption at Rest (MongoDB)
├── Encryption in Transit (HTTPS/TLS)
├── Personal Data Anonymization
├── GDPR Compliance Features
├── Data Retention Policies
├── Secure File Upload Handling
└── XSS & CSRF Protection
```

### **🔒 Password Security System**

#### **Password Policy Enforcement**
```typescript
class PasswordValidator {
  static requirements = {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventCommonPasswords: true,
    preventUserInfoInPassword: true
  };

  static validatePassword(password: string, userData: any): ValidationResult {
    const results = [];
    
    // Length check
    if (password.length < this.requirements.minLength) {
      results.push({ 
        valid: false, 
        message: `Password must be at least ${this.requirements.minLength} characters` 
      });
    }
    
    // Complexity checks
    if (!/[A-Z]/.test(password)) {
      results.push({ valid: false, message: 'Must contain uppercase letter' });
    }
    
    // ... other validation rules
    
    return {
      isValid: results.every(r => r.valid),
      errors: results.filter(r => !r.valid),
      strength: this.calculateStrength(password)
    };
  }
}
```

### **🛡️ Session Management**

#### **Single Session Enforcement**
```typescript
class SessionManager {
  private sessions = new Map<string, SessionData>();
  
  async createSession(userId: string): Promise<string> {
    // Invalidate existing sessions
    await this.invalidateUserSessions(userId);
    
    // Create new session
    const sessionId = this.generateSecureId();
    const sessionData = {
      userId,
      createdAt: new Date(),
      lastActivity: new Date(),
      ipAddress: this.getClientIP(),
      userAgent: this.getUserAgent()
    };
    
    // Store in database and memory
    await this.storeSession(sessionId, sessionData);
    this.sessions.set(sessionId, sessionData);
    
    return sessionId;
  }
  
  async validateSession(sessionId: string): Promise<boolean> {
    const session = await this.getSession(sessionId);
    
    if (!session) return false;
    
    // Check if session is expired
    const now = new Date();
    const maxAge = 30 * 60 * 1000; // 30 minutes
    
    if (now.getTime() - session.lastActivity.getTime() > maxAge) {
      await this.invalidateSession(sessionId);
      return false;
    }
    
    // Update last activity
    await this.updateLastActivity(sessionId);
    return true;
  }
}
```

---

## 📈 **Performance & Optimization**

### **Frontend Performance Strategies**

#### **Angular Optimization Techniques**
```typescript
Performance Optimizations:
├── Lazy Loading Modules
│   └── Route-based code splitting
├── OnPush Change Detection Strategy
│   └── Minimizes unnecessary re-renders
├── Virtual Scrolling for Large Lists
│   └── Job listings and application lists
├── Image Optimization
│   ├── WebP format support
│   ├── Lazy loading images
│   └── Responsive image sizing
├── Service Worker Implementation
│   ├── Offline functionality
│   ├── Background sync
│   └── Push notifications
└── Bundle Optimization
    ├── Tree shaking
    ├── Minification
    └── Compression
```

#### **Caching Strategy**
```typescript
// Frontend Caching Service
@Injectable()
export class CacheService {
  private cache = new Map<string, CacheItem>();
  
  set(key: string, data: any, ttl: number = 300000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  get(key: string): any {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
}
```

### **Backend Performance Optimization**

#### **Database Optimization**
```javascript
// MongoDB Indexing Strategy
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1, "isActive": 1 });
db.jobs.createIndex({ "skills": 1, "location": 1, "status": 1 });
db.jobs.createIndex({ "createdAt": -1 });
db.applications.createIndex({ "userId": 1, "status": 1 });
db.applications.createIndex({ "jobId": 1, "appliedAt": -1 });
```

#### **Caching Implementation**
```javascript
// Redis Caching Service
class CacheService {
  constructor(redisClient) {
    this.redis = redisClient;
  }
  
  async get(key) {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }
  
  async set(key, data, ttl = 300) {
    await this.redis.setex(key, ttl, JSON.stringify(data));
  }
  
  async invalidate(pattern) {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

---

## 🧪 **Testing Strategy**

### **Frontend Testing**
```bash
# Unit Tests
ng test --watch=false --code-coverage

# E2E Tests
ng e2e

# Specific test suites
ng test --include='**/auth/**/*.spec.ts'
ng test --include='**/dashboard/**/*.spec.ts'
```

### **Backend Testing**
```bash
# Unit Tests
npm test

# Integration Tests  
npm run test:integration

# API Tests
npm run test:api

# Test Coverage
npm run test:coverage
```

### **Test Configuration**
```typescript
// Jest Configuration (jest.config.js)
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.spec.js',
    '!src/config/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

---

## 🚀 **Deployment**

### **Production Deployment Checklist**

#### **Environment Preparation**
```bash
Production Deployment Steps:
├── Configure production environment variables
├── Set up SSL certificates (HTTPS)
├── Configure reverse proxy (Nginx)
├── Set up monitoring and logging
├── Configure database backups
├── Set up CI/CD pipeline
└── Perform security audit
```

#### **Docker Deployment**
```dockerfile
# Multi-stage Dockerfile for Backend
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS production
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

#### **Nginx Configuration**
```nginx
# nginx.conf
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Frontend
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # WebSocket Support
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## 🤝 **Contributing**

### **Development Workflow**
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### **Code Standards**
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks
- **Conventional Commits**: Standardized commit messages

### **Pull Request Guidelines**
- Include comprehensive test coverage
- Update documentation as needed
- Follow the existing code style
- Add screenshot for UI changes
- Reference related issues

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

---

## 📞 **Support & Community**

- **📚 Documentation**: [Wiki](https://github.com/your-org/ats-project/wiki)
- **🐛 Bug Reports**: [Issues](https://github.com/your-org/ats-project/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/your-org/ats-project/discussions)
- **📧 Email Support**: support@yourcompany.com
- **💬 Discord**: [Join our community](https://discord.gg/your-invite)

---

## 🎉 **Acknowledgments**

- **Angular Team** for the excellent framework
- **TailwindCSS** for the utility-first CSS framework  
- **MongoDB** for the flexible document database
- **Socket.IO** for real-time communication
- **All Contributors** who helped improve this project

---

## 📊 **Project Statistics**

![GitHub stars](https://img.shields.io/github/stars/your-org/ats-project)
![GitHub forks](https://img.shields.io/github/forks/your-org/ats-project)
![GitHub issues](https://img.shields.io/github/issues/your-org/ats-project)
![GitHub license](https://img.shields.io/github/license/your-org/ats-project)

---

**⭐ Star this repository if you found it helpful!**

**🔄 Last Updated**: December 2024
** Version**: 1.0.0 
