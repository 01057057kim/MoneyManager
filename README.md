# Money Manager (Currently under development)

A comprehensive financial, time, and productivity platform built with the MERN stack. This application allows users to track income, expenses, budgets, tasks, and clients within unified group workspaces.

## Features

- **Financial Tracking**: Record income, expenses, and budgets with automatic calculations
- **Group Collaboration**: Create and join groups with role-based permissions
- **Time Management**: Shared calendars and task management
- **Client Management**: Track clients, deals, and invoices
- **Real-time Dashboard**: Live financial insights and analytics

## Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs for password hashing

### Frontend
- React + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- React Router
- Zustand (state management)
- Axios (API client)

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
MONGO_URI=mongodb://localhost:27017/money-manager
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
```

4. Start the backend server:
```bash
npm run dev
```

The backend will be running on `http://localhost:5000`

### Frontend Setup

1. Navigate to the root directory:
```bash
cd ..
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the frontend development server:
```bash
npm run dev
```

The frontend will be running on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Groups
- `POST /api/groups/create` - Create a new group (protected)
- `POST /api/groups/join` - Join a group with invite key (protected)
- `GET /api/groups/my-groups` - Get user's groups (protected)

## Project Structure

```
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── groupController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── Group.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── groups.js
│   └── server.js
├── src/
│   ├── components/
│   │   ├── ui/ (shadcn components)
│   │   └── layout/
│   │       └── Sidebar.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── utils.ts
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   └── Dashboard.tsx
│   ├── store/
│   │   ├── authStore.ts
│   │   └── groupStore.ts
│   └── types/
│       └── index.ts
└── components.json
```

## Usage

1. **Landing Page**: Visit the homepage to learn about the platform
2. **Sign Up**: Create a new account with name, email, and password
3. **Login**: Sign in with your credentials
4. **Dashboard**: Access the main dashboard with sidebar navigation
5. **Create Group**: Set up a new workspace with currency and tax settings
6. **Join Group**: Use an invite key to join an existing group
7. **Manage**: View and manage your groups from the dashboard

## Development

### Running Both Servers

To run both frontend and backend simultaneously:

1. Start the backend:
```bash
cd backend && npm run dev
```

2. In a new terminal, start the frontend:
```bash
npm run dev
```

### Environment Variables

Make sure to set up the environment variables as shown in the setup instructions. The JWT_SECRET should be a strong, random string for production use.

## Next Steps

This is Step 1 of the Money Manager application. Future steps will include:
- Transaction management
- Budget tracking
- Task management
- Calendar integration
- Client relationship management
- Advanced analytics and reporting

