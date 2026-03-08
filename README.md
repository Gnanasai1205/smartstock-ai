<div align="center">

# 🚀 SmartStock AI
### Enterprise Inventory Intelligence Platform

🧠 **AI‑Driven Inventory Management System**
*A modern full‑stack platform that transforms traditional inventory tracking into an intelligent decision‑support system using real‑time AI analysis.*

</div>

---

## 🏆 Project Overview
SmartStock AI is not just a product database or CRUD inventory application.

It is a cognitive inventory intelligence platform that combines:

- 📦 **Inventory management**
- 🤖 **AI‑powered analytics**
- 👥 **Role‑based workflow**
- 📊 **Real‑time operational insights**

The platform analyzes inventory data in real time and helps businesses predict shortages, optimize restocking, and make smarter operational decisions. Instead of waiting until inventory runs out, SmartStock AI predicts risks and recommends actions automatically.

---

## 🌟 Core Highlights
- 🤖 **AI‑Powered Inventory Intelligence**
- 📊 **Real‑Time Inventory Monitoring**
- 👥 **Role‑Based Dashboards (Admin & Employee)**
- 📦 **Automated Restock Recommendations**
- 💬 **Conversational AI Inventory Assistant**
- ⚡ **Modern High‑Performance UI**

---

## 🧠 AI Intelligence Engine
SmartStock AI integrates the Groq Llama‑3.3 AI model to analyze warehouse data and provide intelligent recommendations.

### 🔮 AI Demand Forecasting
The system automatically evaluates inventory health:

| Status | Condition |
| :--- | :--- |
| 🟢 **Healthy** | Quantity ≥ 10 |
| 🟡 **Low Stock** | Quantity < 10 |
| 🔴 **Critical** | Quantity < 5 |

This allows businesses to detect risks before stockouts occur.

### 📦 Smart Restock Recommendation
The AI engine suggests optimal restock quantities based on current stock levels.

**Example:**
- Product: Mouse
- Current Quantity: 5
- AI Recommendation: Restock 25 units

This prevents supply shortages and improves operational planning.

### 💬 Conversational Inventory Assistant
SmartStock AI includes a context‑aware AI chatbot. Users can ask natural questions such as:
- *“Which products are low in stock?”*
- *“What should we restock today?”*
- *“What is the most expensive critical item?”*

The assistant queries live inventory data and returns instant AI‑generated insights.

---

## 👥 Role‑Based Access System
The platform simulates real enterprise workflows through Role‑Based Access Control (RBAC).

### 👑 Admin Dashboard
Admins have full control over the system. Capabilities include:
- Add and manage products
- Update inventory quantities
- Approve employee restock requests
- Monitor AI inventory insights
- Export inventory data
- Manage employee roles

### 👨‍💼 Employee Dashboard
Employees operate at the warehouse floor level. Capabilities include:
- View product catalog
- Monitor stock levels
- Detect low‑stock items
- Request restocks
- Interact with AI assistant

This creates a collaborative inventory management workflow.

---

## 📊 Smart Dashboard
The dashboard provides a real‑time overview of system health. Displayed metrics include:
- Total Products
- Low Stock Alerts
- Critical Inventory
- Total Inventory Value
- AI Restock Suggestions

This allows managers to instantly assess warehouse status.

---

## 🎨 Modern UI / UX
SmartStock AI features a modern and responsive interface designed for performance and usability. Highlights:
- ⚡ **React + Vite** high‑performance frontend
- 🎨 **TailwindCSS** responsive UI
- 🌙 **Dark‑mode** optimized design
- ✨ **Smooth animated transitions**
- 🧊 **Glass‑morphic UI components**

The interface is designed to resemble modern enterprise SaaS platforms.

---

## 🏗 System Architecture
SmartStock AI follows a clean full‑stack architecture.

```text
Frontend (React + Tailwind)
        │
        │ REST API
        ▼
Backend (Node.js + Express)
        │
        │ Database Queries
        ▼
MongoDB (Mongoose ORM)
        │
        │ AI Analysis
        ▼
Groq Llama 3 AI Engine
```
This modular architecture ensures scalability and maintainability.

---

## 🛠 Technology Stack
| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, Vite, TailwindCSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Authentication** | JWT, bcrypt |
| **AI Engine** | Groq API (Llama‑3.3‑70B) |
| **Tools** | Axios, Lucide Icons |

---

## 🚀 Local Setup

**1️⃣ Clone Repository**
```bash
git clone https://github.com/Gnanasai1205/smartstock-ai.git
cd smartstock-ai
```

**🗄 Backend Setup**
```bash
cd backend
npm install
```
Create `.env`
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
GROQ_API_KEY=your_api_key
```
Start backend:
```bash
npm run dev
```

**🎨 Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```
- Frontend runs on: `http://localhost:5173`
- Backend runs on: `http://localhost:5000`

---

## 📸 Application Preview

### Login Page
<img width="477" height="453" alt="image" src="https://github.com/user-attachments/assets/8131814d-4697-4884-a47f-db82bae65df7" />


### Dashboard
<img width="798" height="433" alt="image" src="https://github.com/user-attachments/assets/48460880-f2e2-445a-a2fd-f0b6f1056681" />


### AI Predictions
<img width="764" height="386" alt="image" src="https://github.com/user-attachments/assets/738dfeaa-41eb-49ce-ab91-e977499b0a3f" />


### Expanded Products
<img width="836" height="469" alt="image" src="https://github.com/user-attachments/assets/46ae2167-8610-4e6b-a328-b1f7483a1f80" />


### AI Predictions Engine
<img width="214" height="280" alt="image" src="https://github.com/user-attachments/assets/4353f989-9153-4130-9542-b6f27cbf45eb" />

### Settings
<img width="805" height="410" alt="image" src="https://github.com/user-attachments/assets/de8480c3-b281-49ae-8ac3-ef6b71aa8c9d" />



*(Note: These high-fidelity screenshots represent the local live build displaying the WebGL Live Theme and active Llama 3 AI)*

---

## 🎬 Demo Flow (For Evaluators)
1. **Login as Admin** 
2. **Add a new product**
3. **View real‑time inventory dashboard**
4. **Update product quantity**
5. **Detect low‑stock items**
6. **Trigger AI restock predictions**
7. **Ask AI assistant about inventory**

---

## 🏆 Hackathon Impact
SmartStock AI demonstrates:
- ✔ Full‑Stack System Architecture
- ✔ AI‑Powered Decision Support
- ✔ Enterprise Role‑Based Workflow
- ✔ Real‑World Inventory Simulation

Instead of just tracking products, SmartStock AI enables businesses to:
**Predict inventory risks, analyze stock health, and make intelligent restocking decisions.**

---
*Developed during Hackathon by*
### **Team SmartStock AI**
