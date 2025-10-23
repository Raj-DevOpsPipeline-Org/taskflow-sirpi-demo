# 🚀 TaskFlow

A modern, production-ready task management application built with Node.js, Express, and vanilla JavaScript.

## ✨ Features

- ✅ **User Authentication** - Secure JWT-based registration and login
- 📝 **Task Management** - Create, update, and delete tasks
- 🎯 **Priority Levels** - Organize tasks by low, medium, or high priority
- 📊 **Status Tracking** - Track tasks through pending → in progress → completed
- 📈 **Statistics Dashboard** - Real-time overview of task status
- 🎨 **Beautiful UI** - Clean, modern interface with smooth animations
- 🔒 **Secure** - Password hashing with bcrypt, JWT tokens
- 💾 **Persistent Storage** - SQLite database for data persistence

## 🛠️ Tech Stack

**Backend:**
- Node.js & Express
- JWT for authentication
- bcryptjs for password hashing
- SQLite (better-sqlite3) for database
- RESTful API design

**Frontend:**
- Vanilla JavaScript (no framework needed!)
- Modern CSS with gradients and animations
- Responsive design
- localStorage for token management

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd taskflow
```

2. Install dependencies
```bash
npm install
```

3. Create environment file
```bash
cp .env.example .env
```

4. Edit `.env` and change the JWT_SECRET:
```env
JWT_SECRET=your-super-secret-key-here
```

5. Start the server
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

6. Open your browser and navigate to:
```
http://localhost:3000
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Tasks
- `GET /api/tasks` - Get all tasks (supports ?status= and ?priority= filters)
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/stats/summary` - Get task statistics

### Health Check
- `GET /api/health` - Server health check

## 🔐 Authentication

All task endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📦 Project Structure

```
taskflow/
├── server.js           # Main Express server
├── src/
│   ├── db.js          # Database setup and schema
│   ├── routes/
│   │   ├── auth.js    # Authentication routes
│   │   └── tasks.js   # Task management routes
│   └── middleware/
│       └── auth.js    # JWT authentication middleware
└── public/
    ├── index.html     # Frontend HTML
    ├── style.css      # Styles
    └── app.js         # Frontend JavaScript
```

## 🐳 Docker Deployment

This app is ready for Docker deployment. Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t taskflow .
docker run -p 3000:3000 taskflow
```

## ☁️ Cloud Deployment

### Deploy to AWS (with Sirpi)
1. Push this code to GitHub
2. Import the repository URL to Sirpi
3. Sirpi will automatically:
   - Detect Node.js/Express
   - Generate Dockerfile
   - Create AWS infrastructure (ECS Fargate, RDS, etc.)
   - Deploy your application

### Environment Variables for Production
Make sure to set these in your production environment:
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Set to `production`
- `JWT_SECRET` - Strong secret key for JWT tokens

## 🧪 Testing

Test the API with curl:

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Create task (replace TOKEN with your JWT)
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"Build amazing app","priority":"high"}'
```

## 📝 License

MIT

## 🤝 Contributing

Feel free to submit issues and pull requests!

## 🎯 Perfect for Demos

This app is designed to be:
- ✅ **Quick to deploy** - Builds in 2-3 minutes
- ✅ **Production-ready** - Real authentication, database, error handling
- ✅ **Clean code** - Easy to understand and modify
- ✅ **Modern UI** - Looks professional
- ✅ **Feature-complete** - Full CRUD operations
- ✅ **Self-contained** - No external dependencies needed

---

Built with ❤️ for demonstrating modern web development practices
