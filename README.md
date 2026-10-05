# AI CX Reply Assistant — Frontend

Frontend application for the AI-Powered Customer Experience (CX) Reply Assistant, built with **React**, **TypeScript**, and **Vite**.

---

## 🛠️ Tech Stack
- **Framework:** React 18 + TypeScript
- **Bundler / Dev Server:** Vite
- **Routing:** React Router v7
- **Styling:** Modular CSS

---

## 📌 Features Built

### 1. Conversation Studio (/conversation)
- **Conversation List:** Real-time customer list displaying customer names, brands, priority badges (High/Medium/Low), and ticket status.
- **Conversation Thread:** Complete message history with timestamps, sender tags (customer vs gent), and customer order context (Order ID, Item, Delivery status, Amount in ₹).
- **Persona Switcher:** Toggle between [👤 Customer Mode] (to test sending customer inquiries) and [🎧 Agent Mode] (to generate, review, and send AI-assisted replies).
- **AI Reply Assistant Panel:**
  - **Intent & Sentiment Detection:** Displays classified intent (e.g., *Refund Request*) and customer sentiment (*Neutral, Frustrated, Positive*).
  - **Knowledge Used:** Displays exact retrieved Knowledge Base articles and policy snippets grounded in the brand's rules.
  - **Editable Draft Area:** A human-in-the-loop review textarea allowing the agent to edit the AI draft before sending.
  - **Agent Actions:**
    - [✨ Generate Reply] / [↻ Regenerate]
    - [📋 Copy Reply] (copies to clipboard with toast notification)
    - [📤 Send to Customer] (appends message directly to thread)
    - Direct manual messaging independent of AI.

### 2. Brand Knowledge Base Management (/knowledge-base)
- Brand selector (e.g. Apex Retail, GlowBotanics Skincare).
- Full in-app CRUD interface: Create, Edit, and Delete policy documents per brand in real-time.
- Changes immediately affect AI response grounding without touching code or database.

### 3. Dashboard (/)
- Overview metrics showing Total Conversations, Pending Tickets, Resolved Conversations, and AI-assisted replies.

---

## 🚀 Getting Started

### 1. Install Dependencies
`ash
npm install
`

### 2. Configure Environment
Create a .env file (copied from .env.example):
`env
VITE_API_URL=http://localhost:3000/api
`

### 3. Run Development Server
`ash
npm run dev
`
Runs at: http://localhost:5173

### 4. Build for Production
`ash
npm run build
`
