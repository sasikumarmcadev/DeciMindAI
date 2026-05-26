# 📄 Project Abstraction - DeciMindAI

This document provides a formal breakdown of the **DeciMindAI** project, structured for project reports and PowerPoint presentations.

---

### 🌐 1. Project Domain
**Artificial Intelligence & Educational Technology (EdTech)**
The project falls under the intersection of AI-native applications and productivity software, specifically focusing on **Natural Language Processing (NLP)** and **automated document synthesis**.

### 🏷️ 2. Project Title
**DeciMindAI**: An Advanced AI-Powered Study, Research, and Academic Productivity Platform.

### 🎯 3. Project Objective
To empower students and researchers by automating the transition from **conceptual chat** to **finished academic assets**. 
- To generate structured, high-quality "13-mark" academic answers.
- To provide real-time, editable PowerPoint (PPT) generation.
- To integrate multimodal capabilities like OCR and AI-driven performance testing (Quizzes).

### 🔄 4. Existing System
*   **Manual Effort**: Users currently spend hours manually formatting AI-generated content into slides or documents.
*   **Platform Fragmentation**: Users must jump between tools for chat, OCR, presentation design, and PDF conversion.
*   **Lack of Structure**: Generic AI models often provide "shallow" answers that don't meet university-level academic standards without complex prompt engineering.

### 💻 5. Hardware & Software Identification

#### **A. Software Requirements**
*   **Operating System**: Windows 10/11, macOS, or Linux.
*   **Development Environment**: Visual Studio Code (VS Code).
*   **Language & Runtime**: Node.js (v18.x or higher), TypeScript.
*   **Core Framework**: Next.js 15 (App Router).
*   **Database & Auth**: Firebase Realtime Database & Firebase Auth.
*   **AI Inference**: Groq SDK (Llama 3.3 70B Engine).
*   **API Integrations**: OCR.space API, Google Generative AI (Genkit).
*   **Document Engines**: PptxGenJS, JsPDF, Docx.js.
*   **Web Browser**: Google Chrome, Microsoft Edge, or Firefox (Latest versions with WebGL support).

#### **B. Hardware Requirements**
*   **Processor**: Intel Core i5 (8th Gen or higher) / AMD Ryzen 5 or better.
*   **Memory (RAM)**: 8 GB Minimum (16 GB Recommended for development).
*   **Storage**: 256 GB SSD (Minimum 10 GB free space for project files and dependencies).
*   **Display**: Full HD (1920x1080) resolution recommended for UI testing.
*   **Internet Connectivity**: High-speed broadband (required for real-time AI inference and cloud sync).
*   **Server Hardware**: Vercel Edge Network (Cloud Deployment) with LPU™ (Language Processing Unit) acceleration via Groq Cloud.

### ❗ 6. Problem Definition
The "context-to-creator" gap remains a major bottleneck in academic productivity. Current AI chat systems provide information but not **deliverables**. There is a critical need for a system that understands **academic hierarchies** (Introduction → Body → Flow Diagrams → Conclusion) and can instantly render that understanding into professional-grade PowerPoint and document formats.

### 📚 7. Initiation of Journal Paper
**Title**: *DeciMindAI: Overcoming the Creator Gap in Academic Workflows using LLM-based Automated Asset Generation.*
**Abstract Focus**: The paper explores the implementation of multi-format document orchestration, where a single structured JSON output from an LLM (Llama 3.3) is used to concurrently drive a React-based UI, a PPTX generation engine, and a LaTeX-style PDF generator, significantly reducing manual production time for educational content.

---

> [!NOTE]
> This content is formatted to be copied directly into Slides 1 through 7 of your PPT presentation.
