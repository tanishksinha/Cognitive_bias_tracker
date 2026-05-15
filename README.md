# 🧠 Cognitive Bias Tracker

**A Decision Intelligence System blending Psychology, Data Science, and Bayesian Inference.**

[![Python](https://img.shields.io/badge/Python-3.13-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.0-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646cff.svg)](https://vitejs.dev/)

---

## 🚀 Overview

The **Cognitive Bias Tracker** is a sophisticated tool designed to help individuals identify and mitigate systematic patterns of deviation from rationality in judgment. Unlike simple trackers, this system uses **Bayesian Inference** to quantify bias by combining a user's psychological baseline (Priors) with their real-world decision-making behavior (Likelihood).

### Key Features
*   **Psychometric Baseline:** Uses validated instruments (CRT, BNT, NFC, AOT) to build a cognitive profile.
*   **Decision Logic Engine:** Analyze real-world decisions for markers of Anchoring, Confirmation Bias, Sunk Cost Fallacy, and more.
*   **Confidence Tiers:** A dynamic system that moves from "Baseline" to "Established" as more data is collected.
*   **Modern UX:** A high-performance, dark-themed dashboard built for clarity and focus.
*   **Secure Auth:** JWT-based authentication with direct bcrypt hashing (compatible with Python 3.13).

---

## 🧬 The Science

### Psychological Instruments
The system benchmarks users against four key cognitive dimensions:
1.  **CRT (Cognitive Reflection Test):** Measures the ability to override intuitive but incorrect responses.
2.  **BNT (Berlin Numeracy Test):** Measures statistical literacy and risk understanding.
3.  **NFC (Need for Cognition):** Measures the enjoyment of effortful thinking.
4.  **AOT (Actively Open-minded Thinking):** Measures willingness to consider contradictory evidence.

### Bayesian Engine
The system calculates bias probability ($$P(B|D)$$) using:
$$P(B|D) = \frac{P(D|B) \cdot P(B)}{P(D)}$$
*   **$P(B)$ (The Prior):** Your initial profile scores.
*   **$P(D|B)$ (The Likelihood):** Behavioral signals detected during decision logging.

---

## 🛠️ Technology Stack

*   **Frontend:** React 18, Vite, Axios, Lucide Icons.
*   **Backend:** FastAPI, Uvicorn, SQLAlchemy ORM.
*   **Database:** SQLite (Relational).
*   **Communication:** SMTP/Web-API integration for automated verification emails.

---

## ⚙️ Installation & Setup

### Prerequisites
*   Python 3.13+
*   Node.js 18+
*   Gmail App Password (for email features)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```
**Configure `.env`:**
Create a `.env` file in the `backend/` directory:
```env
DATABASE_URL=sqlite:///./bias_tracker.db
SECRET_KEY=your_secret_key
FRONTEND_URL=http://localhost:5173

# Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_USE_TLS=false
EMAIL_FROM=your_email@gmail.com
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```

---

## 🏃 Running the Application

Open two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Access the app at `http://localhost:5173`.

---

## 🛡️ Technical Challenges Overcome
*   **Python 3.13 Compatibility:** Refactored the entire security layer to use direct `bcrypt` calls, bypassing `passlib` incompatibilities with the latest Python runtime.
*   **Network Resilience:** Implemented a dual-mode email system (SMTP and HTTP API) to ensure reliability across restricted corporate and university networks.
*   **State Management:** Built a custom multi-step decision flow in React to capture "micro-behaviors" during the logging process.

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
