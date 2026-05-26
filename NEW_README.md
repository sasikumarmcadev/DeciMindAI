# 📑 DeciMindAI - Unified PPT Project Report

This file combines the **Tech Stack** and **Project Abstraction** into a single document for easy copying into your PowerPoint presentation.

---

## 🏛️ PART 1: Project Abstraction

### 1. Project Domain
**Artificial Intelligence & Educational Technology (EdTech)**. Focused on **Natural Language Processing (NLP)** and **automated document synthesis**.

### 2. Project Title
**DeciMindAI**: Next-Gen AI Study Assistant with Real-Time Presentation & Academic Automation.

### 3. Project Objective
To bridge the gap between AI chat and academic productivity by providing an automated workflow for generating:
- Structured "13-mark" academic answers.
- Professional PowerPoint presentations (PPTX).
- Downloadable study notes (PDF/DOCX).
- Real-time AI quizzes with analytics.

### 4. Existing System
*   **Manual Effort**: Users currently format AI-generated content into slides or documents manually.
*   **Platform Fragmentation**: Multiple tools are needed for chat, OCR, and design (e.g., ChatGPT + Canva + OCR sites).
*   **Lack of Structure**: Generic AI models often provide "shallow" answers that don't meet university-level academic standards.

### 5. Hardware & Software Identification
*   **Software**: Windows 10/11, VS Code, Node.js (v18+), Next.js 15, Firebase, Groq SDK (Llama 3.3), OCR.space, PptxGenJS, jsPDF.
*   **Hardware (Min Specs)**: Intel i5 (8th Gen), 8 GB RAM, 256 GB SSD, High-speed Internet.
*   **Infrastructure**: Sub-second AI inference via **Groq LPU™** and deployment on **Vercel Edge Network**.

### 6. Problem Definition
The "context-to-creator" gap is a major bottleneck. There is a critical need for a system that understands **academic hierarchies** (Introduction → Body → Diagrams/Tables → Conclusion) and can instantly render that into professional formats without manual intervention.

### 7. Initiation of Journal Paper
**Proposed Topic**: *"Automated Synthesis of Academic Assets using LPU-accelerated Inference and Multi-format Document Orchestration."* Focused on reducing document production time by over 80%.

---

## 🛠️ PART 2: The Technology Stack (Detailed)

### 🧠 AI & Orchestration
*   **Groq SDK**: Ultra-fast (LPU) inference for real-time responsiveness.
*   **Llama 3.3 70B**: State-of-the-art reasoning model for academic content.
*   **Google Genkit / Zod**: Framework for structured AI responses and reliable outputs.

### 🗄️ Backend & Infrastructure
*   **Firebase Realtime DB**: Syncs chat history and user data across devices instantly.
*   **Firebase Auth**: Secure Google and Email/Password authentication.
*   **Next.js API Routes**: Serverless backend handling file parsing (OCR/PDF) and AI logic.

### 🎨 Frontend & UI Architecture
*   **Next.js 15**: React framework with Server Components for top-tier performance.
*   **Framer Motion**: Cinematic animations to enhance the "AI-Native" feel.
*   **Tailwind CSS**: Custom, responsive design with a "Premium Dark Red" aesthetic.
*   **WebGL (OGL)**: Shader-based background effects (Ambient Orb).

### 📄 Multi-Format Export Tools
*   **PPTX Generator**: `pptxgenjs` (Downloadable PowerPoint slides).
*   **PDF/DOCX Engines**: `jsPDF` and `docx.js` for academic note-taking.
*   **OCR Engine**: `OCR.space` for image-to-text conversion.

---

## 👨‍💻 Developed By
**Sasikumar**
[Portfolio](https://www.sasikumar.in) | [GitHub](https://github.com/sasikumarmcadev) | [LinkedIn](https://www.linkedin.com/in/sasikumarmca)
