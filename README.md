# ✅ Full-Stack To-Do App

A full-stack task management application built using **React**, **Node.js**, and **PostgreSQL** that allows users to create, edit, delete, and manage tasks with push notifications for overdue and upcoming deadlines.


##  Live-Link
https://todo-app-1-sigma.vercel.app/

## 🎯 Features

- ✅ Create, edit, and delete tasks  
- 📋 View all tasks with:
  - Title
  - Description
  - Due date
  - Priority (Low / Medium / High)
  - Completion status  
- 📌 Mark tasks as completed   
- 🔔 Browser push notifications for:
  - Overdue tasks (grouped by date and priority)

    ## 🚀 Getting Started

### Prerequisites

- Node.js
- PostgreSQL
- Vite (Frontend Bundler)

### Installation

#### Backend

```bash
cd backend
npm install
# Configure .env for DB and VAPID keys


--frontend

cd frontend
npm install
npm run dev

--- backend
Create a .env file in your backend:
PORT=5000
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/todoapp
VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
