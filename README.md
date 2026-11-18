# ⚡ AWS Smart Access & Campus IT Assistant

> A modern, Neo-Brutalist cloud application combining **Amazon Rekognition** biometric verification and **Amazon Bedrock** generative AI for secure campus IT assistance.

---

## 🌟 Key Highlights

- **👁️ Live Biometric Verification**: Real-time facial analysis and liveness presence check powered by **Amazon Rekognition** (`DetectFaces`).
- **🧠 Campus IT Bedrock Assistant**: AI chatbot with modern formatting, Markdown tables, and quick-prompt chips powered by **Amazon Bedrock Architecture** (with high-speed Groq inference fallback for AWS Academy Learner Labs).
- **🎮 Interactive Rekognition Explorer**: Live Cyberpunk HUD simulator to experiment with 100+ facial landmarks, smile detection, eye tracking, sunglasses obstruction, tailgating intruder detection, and 2D photo anti-spoofing.
- **📚 Interactive Bedrock Explorer**: Educational visualizer exploring:
  - **Knowledge Bases & RAG**: Eliminates hallucinations by retrieving private S3 documents with citations.
  - **Autonomous Agents**: Visualizes the **ReAct (Reason + Act)** loop invoking external AWS Lambda functions.
  - **Bedrock Guardrails**: 4-layer defense shield (Content Filters, Denied Topics, PII Masking, and Contextual Grounding).
  - **Foundation Model Matrix**: Specs and latency for Amazon Nova, Anthropic Claude 3.5, Meta Llama 3.3, and Mistral Large.
- **🎨 Neo-Brutalist UI Design System**: High-contrast borders, tactile drop shadows, vibrant accents, and responsive layout.
- **🚀 One-Click Launch & Shutdown**: Dedicated Windows scripts (`start.bat` and `stop.bat`) for instant execution.

---

## 🏗️ Architecture

```
Browser (React + Vite)
  ├── 1. Webcam Frame (HTML5 Canvas) ──> Express Backend (Node.js)
  │                                            │
  │                                            ├──> Amazon Rekognition (DetectFaces SigV4)
  │                                            └──> Amazon Bedrock / Groq LLM Inference
  │
  └── 2. Interactive Explorers (Client-side interactive state engines)
```

---

## 🚀 Quick Start (Windows)

### Option 1: One-Click Scripts (Easiest)
1. **Launch**: Double-click `start.bat` in the project root.
   - Frontend starts on: `http://localhost:5173`
   - Backend API starts on: `http://localhost:4000`
2. **Stop**: Double-click `stop.bat` to instantly terminate all servers and release ports.

### Option 2: Manual Start
```powershell
# 1. Start Backend (Terminal 1)
cd backend
npm install
npm run dev

# 2. Start Frontend (Terminal 2)
cd frontend
npm install
npm run dev
```

---

## 🔐 Environment Configuration

### Backend (`backend/.env`)
Copy `backend/.env.example` to `backend/.env`:
```env
# AWS Academy Learner Lab Credentials (paste directly from "AWS Details > AWS CLI")
aws_access_key_id=YOUR_ACCESS_KEY_ID
aws_secret_access_key=YOUR_SECRET_ACCESS_KEY
aws_session_token=YOUR_SESSION_TOKEN

# Cloud Settings
AWS_REGION=us-east-1
PORT=4000
LIVENESS_THRESHOLD=90
FRONTEND_ORIGIN=http://localhost:5173

# Bedrock Model Configuration
BEDROCK_MODEL_ID=mistral.mistral-7b-instruct-v0:2

# Groq API Key (High-Speed LLM Inference fallback)
GROQ_API_KEY=your_groq_api_key_here
```

> **Note for AWS Academy Users:** The backend automatically recognizes both lowercase (`aws_access_key_id`) and uppercase (`AWS_ACCESS_KEY_ID`) variables and trims accidental whitespace. You can paste the whole block directly from AWS Academy!

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:4000
VITE_AWS_REGION=us-east-1
```

---

## 🧪 Demo Credentials

For classroom evaluation, use the pre-configured credentials on the login screen:
- **Email:** `demo@example.com`
- **Password:** `Demo123!`
*(Or simply click the **"⚡ Fill Demo Credentials"** button on the UI)*

---

## 🛡️ Security & Privacy Notice
- `.env` files containing AWS keys and API tokens are strictly ignored by `.gitignore` and **must never be committed to public repositories**.
- The hardcoded credentials are for classroom presentation only and should be replaced with Amazon Cognito User Pools for production deployment.
