# Full-Stack Student Election Voting Web Application (MERN)

A secure and modern web application to facilitate college student elections. Built with the MERN stack (MongoDB, Express, React, Node.js) and styled with Tailwind CSS v4.

## Features

*   **Role-Based Access**: Separate dashboards for Students and Admins.
*   **Secure Authentication**: JWT-based auth and bcrypt password hashing.
*   **Duplicate Vote Prevention**: Backend logic and DB indices ensure one vote per student.
*   **Live Results**: Real-time charts (Bar and Pie) using Chart.js to visualize the election.
*   **Admin Controls**: Add/delete candidates and toggle the active status of the election.

## Prerequisites
*   Node.js (v18+ recommended)
*   MongoDB (running locally or a MongoDB Atlas URI)

## Setup Instructions

1.  **Clone / Download** the repository.
2.  **Environment Variables**:
    Create a `.env` file in the `backend` directory with:
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/votingweb
    JWT_SECRET=your_super_secret_key
    ```
3.  **Install Dependencies**:
    *   **Backend**: `cd backend && npm install`
    *   **Frontend**: `cd frontend && npm install`
4.  **Start the Application**:
    You can use the provided script or start them manually.
    *   *Windows Auto-Start*: Double click `start.ps1` or run `.\start.ps1` in PowerShell.
    *   *Manual*: 
        *   Terminal 1: `cd backend && npm run dev`
        *   Terminal 2: `cd frontend && npm run dev`

5.  **Access the App**:
    Open your browser to `http://localhost:3000`

## Initial Setup Considerations

*   **Admin User Creation:** A user can register at `/register`. To make the user an Admin, you will need to manually update their `role` field from `"student"` to `"admin"` directly in MongoDB for the first admin account. After that, that admin can manage the election.
