# Job Portal API

A fully structured backend project for a job portal using Node.js, Express.js, Sequelize ORM, and MySQL.

## Features

- Complete MVC architecture with proper separation of concerns
- Authentication system with JWT tokens and role-based access control
- Full CRUD operations for all models with Sequelize ORM
- Comprehensive error handling and logging
- API documentation with detailed endpoint descriptions
- Messaging system between job seekers and employers
- Job recommendation engine based on user profiles

## Project Structure

```
├── config/             # Database and app configuration
├── controllers/        # Route handlers
├── middleware/         # Middleware functions
├── models/             # Sequelize models
├── routes/             # Express routes
├── utils/              # Utility functions
├── logs/               # Application logs
├── .env.example        # Example environment variables
├── .gitignore          # Git ignore file
├── package.json        # Dependencies and scripts
├── server.js           # Entry point
└── README.md           # Project documentation
```

## API Endpoints

The API provides the following endpoints:

### Authentication

- `POST /api/auth/job-seeker/register` - Register a new job seeker
- `POST /api/auth/job-seeker/login` - Login as a job seeker
- `POST /api/auth/employer/register` - Register a new employer
- `POST /api/auth/employer/login` - Login as an employer
- `POST /api/auth/admin/login` - Login as an admin
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/change-password` - Change password

### Jobs

- `GET /api/jobs` - Get all jobs (with filtering options)
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create a new job (employer only)
- `PUT /api/jobs/:id` - Update job by ID (employer only)
- `DELETE /api/jobs/:id` - Delete job by ID (employer only)
- `GET /api/jobs/featured` - Get featured jobs
- `GET /api/jobs/recommendations` - Get job recommendations (job seeker only)

### Employers

- `GET /api/employers/profile` - Get employer profile
- `PUT /api/employers/profile` - Update employer profile
- `PUT /api/employers/change-email` - Change email address
- `GET /api/employers/jobs` - Get employer's jobs
- `GET /api/employers/dashboard` - Get employer dashboard stats

### Job Seekers

- `GET /api/job-seekers/profile` - Get job seeker profile
- `PUT /api/job-seekers/profile` - Update job seeker profile
- `PUT /api/job-seekers/change-email` - Change email address
- `GET /api/job-seekers/favorite-jobs` - Get favorite jobs
- `POST /api/job-seekers/favorite-jobs` - Add job to favorites
- `DELETE /api/job-seekers/favorite-jobs/:id` - Remove job from favorites

### Applications

- `POST /api/applications` - Apply for a job
- `GET /api/applications/job-seeker` - Get job seeker applications
- `GET /api/applications/employer` - Get employer applications
- `GET /api/applications/:id` - Get application details

### Messages

- `GET /api/messages/chats` - Get all chats for user
- `GET /api/messages/chats/:id` - Get chat messages
- `POST /api/messages/chats/:id` - Send a message
- `POST /api/messages/start-chat` - Start a new chat
- `GET /api/messages/unread-count` - Get unread message count

### Admin

- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/employers` - Get all employers
- `GET /api/admin/job-seekers` - Get all job seekers
- `GET /api/admin/jobs` - Get all jobs
- `POST /api/admin/create` - Create a new admin
- `PUT /api/admin/users/:id/deactivate` - Deactivate a user
- `PUT /api/admin/users/:id/reactivate` - Reactivate a user
- `GET /api/admin/analytics` - Get analytics data

### Analytics

- `GET /api/analytics/job/:id` - Get analytics for a specific job

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env` and update the configuration
3. Install dependencies: `npm install`
4. Start the server: `npm start` or `npm run dev` for development

## Environment Variables

The following environment variables need to be configured:

- `PORT` - Port for the server (default: 3000)
- `NODE_ENV` - Environment (development, test, production)
- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - Secret key for JWT
- `JWT_EXPIRATION` - JWT expiration time (e.g., "1d")

## License

[MIT](LICENSE)