# SmartStock AI – Product Inventory System

This is a full-stack project utilizing React, TailwindCSS, Node.js, Express, and MongoDB.

## Welcome to SmartStock AI!
Your basic folder architecture is prepared.

## 🚀 Setup Instructions

### 1. Database (MongoDB)
Ensure you have MongoDB installed and running locally on port `27017` (default), or update the `MONGO_URI` in `backend/.env` to point to your MongoDB Atlas cluster.
```sh
# backend/.env default configuration
# MONGO_URI=mongodb://localhost:27017/smartstock-ai
# PORT=5000
```

### 2. Backend Setup
The backend API is pre-configured with Express, Mongoose, dotenv, and cors.

**Open a new terminal and navigate to the backend directory:**
```bash
cd backend

# Install dependencies
npm install

# Start the development server (runs with nodemon on port 5000)
npm run dev
```

### 3. Frontend Setup
The frontend folder structure (`src/components`, `src/pages`, `src/services`) is set up! Now, bootstrap React using Vite and add TailwindCSS.

**Open a new terminal, navigate to the frontend directory, and run:**
```bash
# 1. Initialize React with Vite in the `frontend` folder
npm create vite@latest . -- --template react

# 2. Install React dependencies
npm install

# 3. Install TailwindCSS and its peer dependencies
npm install -D tailwindcss postcss autoprefixer

# 4. Generate Tailwind configuration files
npx tailwindcss init -p
```

### 4. Configure Tailwind CSS
After running the setup commands, configure your template paths by adding this to `frontend/tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Add the Tailwind directives to your `frontend/src/index.css` (replace the existing CSS):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 5. Start the frontend
```bash
npm run dev
```

You are all set! The React app should now be running in your browser, and communicating with the Node backend on `http://localhost:5000`.
