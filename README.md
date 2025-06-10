# SYTE Consultants - Full Stack Application

A comprehensive full-stack consultancy platform featuring a modern React frontend and robust backend API, designed to deliver end-to-end consulting solutions.

## 🚀 Overview

SYTE Consultants is a complete full-stack web application that serves as a comprehensive digital platform for consulting services. The project combines a modern React frontend with a powerful backend API to provide seamless user experiences for both consultants and clients.

## 🏗️ Architecture

This project follows a **monorepo structure** with clear separation between frontend and backend:

```
SYTE-Consultants/
├── frontend/               # React + Vite Frontend Application
├── backend/                # Backend API Server
├── shared/                 # Shared utilities and types
├── docs/                   # Documentation
└── docker-compose.yml      # Development environment setup
```

## ✨ Features

### Frontend Features
- **Modern React Architecture**: Built with React 18+ and Vite for optimal performance
- **Responsive Design**: Mobile-first approach with seamless cross-device experience
- **Interactive UI**: Dynamic components for service showcases and client interactions
- **Real-time Updates**: Live data synchronization with backend services
- **Professional Dashboard**: Admin panel for consultants to manage services and clients

### Backend Features
- **RESTful API**: Well-structured API endpoints for all business operations
- **Database Integration**: Robust data persistence and management
- **Authentication System**: Secure user authentication and authorization
- **Business Logic**: Core consulting workflow management
- **File Management**: Document upload and management capabilities
- **Email Integration**: Automated notifications and communication

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18+
- **Build Tool**: Vite
- **Language**: JavaScript/JSX
- **Styling**: CSS3 / Styled Components / Tailwind CSS
- **State Management**: Redux / Context API
- **HTTP Client**: Axios
- **Routing**: React Router

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js / Fastify
- **Database**: MongoDB / PostgreSQL / MySQL
- **Authentication**: JWT / Passport.js
- **File Storage**: Multer / AWS S3
- **Email Service**: Nodemailer / SendGrid
- **API Documentation**: Swagger/OpenAPI

### DevOps & Tools
- **Containerization**: Docker & Docker Compose
- **Version Control**: Git
- **Code Quality**: ESLint, Prettier
- **Testing**: Jest, Cypress
- **CI/CD**: GitHub Actions

## 📋 Prerequisites

- **Node.js** (version 16.0 or higher)
- **npm** or **yarn** package manager
- **Database**: MongoDB/PostgreSQL/MySQL (depending on backend choice)
- **Docker** (optional, for containerized development)
- **Git** for version control

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/LokeshAlli21/SYTE-Consultants.git
cd SYTE-Consultants
```

### 2. Environment Setup

Create environment files for both frontend and backend:

**Backend Environment** (`.env` in backend folder):
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_SERVICE_API_KEY=your_email_service_key
```

**Frontend Environment** (`.env` in frontend folder):
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=SYTE Consultants
```

### 3. Install Dependencies

#### Install Backend Dependencies
```bash
cd backend
npm install
```

#### Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 4. Database Setup

```bash
# Navigate to backend
cd backend

# Run database migrations (if applicable)
npm run migrate

# Seed initial data (if applicable)
npm run seed
```

### 5. Start Development Servers

#### Option 1: Start Both Servers Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

#### Option 2: Using Docker Compose (Recommended)

```bash
# From project root
docker-compose up --build
```

### 6. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api-docs

## 📁 Detailed Project Structure

```
SYTE-Consultants/
├── frontend/                   # Frontend React Application
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API service functions
│   │   ├── store/            # State management
│   │   ├── utils/            # Utility functions
│   │   ├── assets/           # Images, fonts, icons
│   │   ├── styles/           # Global styles
│   │   ├── App.jsx           # Main App component
│   │   └── main.jsx          # Application entry point
│   ├── package.json
│   ├── vite.config.js
│   └── .env
│
├── backend/                    # Backend API Server
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── models/           # Database models
│   │   ├── routes/           # API route definitions
│   │   ├── middleware/       # Custom middleware
│   │   ├── services/         # Business logic
│   │   ├── utils/            # Utility functions
│   │   ├── config/           # Configuration files
│   │   ├── validators/       # Input validation schemas
│   │   └── app.js            # Express app setup
│   ├── tests/                # Backend tests
│   ├── uploads/              # File upload directory
│   ├── package.json
│   ├── server.js             # Server entry point
│   └── .env
│
├── shared/                     # Shared Code
│   ├── types/                # TypeScript type definitions
│   ├── constants/            # Shared constants
│   └── utils/                # Shared utility functions
│
├── docs/                       # Documentation
│   ├── api/                  # API documentation
│   ├── deployment/           # Deployment guides
│   └── development/          # Development guides
│
├── docker-compose.yml          # Development environment
├── .gitignore
├── README.md
└── package.json               # Root package.json for scripts
```

## 📜 Available Scripts

### Root Level Scripts
```bash
npm run dev          # Start both frontend and backend
npm run build        # Build both applications
npm run test         # Run all tests
npm run lint         # Lint both codebases
npm run clean        # Clean all node_modules and builds
```

### Frontend Scripts
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run frontend tests
```

### Backend Scripts
```bash
cd backend
npm run dev          # Start with nodemon
npm run start        # Start production server
npm run test         # Run backend tests
npm run migrate      # Run database migrations
npm run seed         # Seed database with initial data
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Consultants
- `GET /api/consultants` - Get all consultants
- `GET /api/consultants/:id` - Get consultant by ID
- `POST /api/consultants` - Create new consultant
- `PUT /api/consultants/:id` - Update consultant
- `DELETE /api/consultants/:id` - Delete consultant

### Services
- `GET /api/services` - Get all services
- `POST /api/services` - Create new service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

## 🗄️ Database Schema

### Users Table
```sql
- id (Primary Key)
- name
- email (Unique)
- password (Hashed)
- role (client/consultant/admin)
- created_at
- updated_at
```

### Consultants Table
```sql
- id (Primary Key)
- user_id (Foreign Key)
- specialization
- experience_years
- hourly_rate
- bio
- availability
```

### Services Table
```sql
- id (Primary Key)
- consultant_id (Foreign Key)
- title
- description
- duration
- price
- category
```

## 🚀 Deployment

### Environment Variables

**Production Backend Environment:**
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=production_database_url
JWT_SECRET=strong_production_secret
CORS_ORIGIN=https://your-frontend-domain.com
```

**Production Frontend Environment:**
```env
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_APP_NAME=SYTE Consultants
```

### Deployment Options

#### 1. Traditional VPS/Server
```bash
# Build applications
npm run build

# Deploy backend
cd backend
pm2 start server.js --name "syte-backend"

# Deploy frontend (serve static files with nginx)
cd ../frontend/dist
# Copy to web server directory
```

#### 2. Cloud Platforms

**Backend (Heroku/Railway/DigitalOcean)**:
- Deploy backend as Node.js application
- Set environment variables
- Configure database connection

**Frontend (Vercel/Netlify)**:
- Connect GitHub repository
- Set build command: `cd frontend && npm run build`
- Set publish directory: `frontend/dist`

#### 3. Docker Deployment
```bash
# Build and deploy with Docker
docker-compose -f docker-compose.prod.yml up -d
```

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm run test              # Run unit tests
npm run test:coverage     # Run with coverage
npm run test:e2e         # Run end-to-end tests
```

### Backend Testing
```bash
cd backend
npm run test              # Run unit tests
npm run test:integration  # Run integration tests
npm run test:coverage     # Run with coverage
```

## 🔧 Development Guidelines

### Code Style
- Use ESLint and Prettier for consistent formatting
- Follow component naming conventions (PascalCase)
- Use meaningful variable and function names
- Write descriptive commit messages

### Git Workflow
1. Create feature branches from `main`
2. Make atomic commits with clear messages
3. Write tests for new features
4. Submit pull requests for code review
5. Merge after approval and tests pass

### Database Migrations
```bash
# Create new migration
npm run migration:create add_new_table

# Run pending migrations
npm run migration:up

# Rollback last migration
npm run migration:down
```

## 🔮 Future Enhancements

### Technical Improvements
- **TypeScript Migration**: Convert entire codebase to TypeScript
- **GraphQL API**: Implement GraphQL for more efficient data fetching
- **Microservices Architecture**: Split backend into microservices
- **Real-time Features**: WebSocket integration for live chat and notifications
- **PWA Features**: Service workers for offline functionality
- **Mobile App**: React Native application for mobile users

### Business Features
- **Payment Integration**: Stripe/PayPal integration for online payments
- **Video Conferencing**: Integrated video calls for consultations
- **Document Management**: Advanced file sharing and collaboration
- **Calendar Integration**: Sync with Google Calendar/Outlook
- **Reporting Dashboard**: Analytics and business intelligence
- **Multi-tenant Support**: Support for multiple consultancy firms

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes in the appropriate directory (frontend/backend)
4. Write tests for your changes
5. Ensure all tests pass (`npm run test`)
6. Commit your changes (`git commit -m 'Add some amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Development Setup for Contributors
```bash
# Install dependencies for both frontend and backend
npm run install:all

# Run in development mode
npm run dev

# Run tests before committing
npm run test:all

# Lint code
npm run lint:all
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Lokesh Alli**
- GitHub: [@LokeshAlli21](https://github.com/LokeshAlli21)
- Project: [SYTE-Consultants](https://github.com/LokeshAlli21/SYTE-Consultants)

## 🙏 Acknowledgments

- React and Vite teams for excellent frontend tools
- Express.js community for robust backend framework
- Open source community for continuous inspiration
- Contributors and testers who help improve the platform

## 📞 Support & Contact

### Issues & Bugs
- Create an issue: [GitHub Issues](https://github.com/LokeshAlli21/SYTE-Consultants/issues)
- Provide detailed reproduction steps
- Include environment details (OS, Node.js version, browser)

### Questions & Discussions
- Start a discussion: [GitHub Discussions](https://github.com/LokeshAlli21/SYTE-Consultants/discussions)
- Join our community for help and collaboration

### Documentation
- API Documentation: Available at `/api-docs` when backend is running
- Development guides: Check the `docs/` directory
- Deployment guides: See deployment section above

---

**Happy Coding! 🚀**

> Built with ❤️ using React, Node.js, and modern web technologies

## 📊 Project Status

- ✅ **Frontend**: React application with modern UI/UX
- ✅ **Backend**: RESTful API with authentication
- ✅ **Database**: Data persistence and relationships
- 🔄 **Testing**: Unit and integration tests in progress
- 🔄 **Documentation**: API documentation and guides
- 📋 **Deployment**: Production deployment guides ready