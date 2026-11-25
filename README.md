# ClassPilot MVP

ClassPilot is a privacy-first classroom utility dashboard for teachers.

## Stack

- Frontend: React, Vite, TypeScript, React Router, CSS
- Backend: Node.js, Express, TypeScript
- Database: MongoDB Atlas with Mongoose
- Auth: JWT + bcrypt password hashing
- Hosting target:
  - Frontend: GitHub Pages
  - Backend: Render

## Privacy Rules

ClassPilot intentionally stores only minimal student data:

- displayName (first name + last initial)
- optional readingScore
- optional mathScore
- optional tags

Do not enter full names, student IDs, birthdates, addresses, or school identifiers.

## Project Structure

- client: React frontend
- server: Express API backend

## Local Setup

### 1. Backend setup

1. Open terminal in server:
   - cd server
2. Install dependencies:
   - npm install
3. Copy environment file:
   - copy .env.example .env
4. Set environment values in .env:
   - MONGO_URI
   - JWT_SECRET
   - PORT
   - CLIENT_ORIGIN
5. Run backend:
   - npm run dev

Backend defaults to http://localhost:5000

### 2. Frontend setup

1. Open terminal in client:
   - cd client
2. Install dependencies:
   - npm install
3. Copy environment file:
   - copy .env.example .env
4. Set API base URL in .env:
   - VITE_API_URL=http://localhost:5000
5. Run frontend:
   - npm run dev

Frontend defaults to http://localhost:5173

## API Endpoints

### Auth

- POST /auth/register
- POST /auth/login
- GET /auth/me

### Classes

- GET /classes
- POST /classes
- DELETE /classes/:id

### Students

- GET /classes/:classId/students
- POST /classes/:classId/students
- DELETE /students/:id

### Pair Rules

- GET /classes/:classId/rules
- POST /classes/:classId/rules
- DELETE /rules/:id

### Tools

- POST /tools/random-student
- POST /tools/generate-pairs
- POST /tools/generate-groups

## Pairing Algorithm

Pair generation logic:

1. Shuffle students
2. Create pairs
3. Validate against never-pair rules
4. Retry until valid pairing is found (max retries enforced)

If no valid pairing can be found due to constraints, the API returns a helpful error.

## Deployment

### Backend to Render

1. Push repository to GitHub.
2. In Render, create a new Web Service using the repository.
3. Configure service:
   - Root Directory: server
   - Build Command: npm install && npm run build
   - Start Command: npm start
4. Add environment variables:
   - MONGO_URI
   - JWT_SECRET
   - PORT
   - CLIENT_ORIGIN (set to GitHub Pages frontend URL)
5. Deploy.

### Frontend to GitHub Pages

1. In client/package.json, homepage is set to:
   - https://alex-j-miller.github.io/classpilot
2. Set frontend env in CI/local build:
   - VITE_API_URL=https://your-render-service-url.onrender.com
3. Deploy manually from client:
   - npm run deploy
4. In GitHub repository settings:
   - Pages source should point to gh-pages branch.

## MVP Features Included

- Teacher registration/login
- Teacher-scoped class management
- Minimal student roster management
- Never-pair rule management
- Random student picker
- Pair generator respecting never-pair rules
- Group generator by selected size
- Privacy warning in UI

## Production Notes

- Use HTTPS in production (Render + GitHub Pages provide TLS)
- Keep JWT_SECRET strong and private
- Restrict CORS CLIENT_ORIGIN to your frontend URL
