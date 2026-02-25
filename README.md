# DeciMindAI

An advanced AI-powered platform designed for productivity, research, and deep learning. Built with **Next.js 15**, **Firebase**, and **Groq (Llama 3.3)**, DeciMindAI delivers a premium, intelligent user experience with structured AI responses and high-end visual aesthetics.

## 🛠️ The Tech Stack

DeciMindAI leverages a modern, high-performance stack to ensure scalability, speed, and a state-of-the-art user interface.

### 🧠 AI & Intelligence
- **[Groq SDK](https://groq.com/)**: The core AI engine, providing ultra-fast inference using:
  - **Llama 3.3 70B**: Primary model for complex reasoning and study material generation.
  - **GPT-OSS-120B**: Utilized for specialized productivity workflows.
- **[Google Genkit](https://firebase.google.com/docs/genkit)**: Framework for orchestrating AI flows and structured data generation.
- **[Zod](https://zod.dev/)**: Strict schema validation for AI-generated JSON outputs, ensuring reliability.

### 🗄️ Backend & Database
- **[Firebase Realtime Database](https://firebase.google.com/products/realtime-database)**: NoSQL database for real-time chat history and user data synchronization.
- **[Firebase Authentication](https://firebase.google.com/products/auth)**: Secure user login and session management (Google & Email/Password).
- **[Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)**: Serverless functions for handling OCR, file parsing, and AI orchestration.

### 🎨 Frontend & Design
- **[Next.js 15 (App Router)](https://nextjs.org/)**: The backbone of the application, utilizing Server Components for performance.
- **[React 18](https://react.dev/)**: Declarative UI library for building dynamic interfaces.
- **[TypeScript](https://www.typescriptlang.org/)**: Static typing for robust, error-free development.
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS for a custom, responsive design system.
- **[Framer Motion](https://www.framer.com/motion/)**: Smooth transitions and meaningful micro-animations.
- **[Radix UI](https://www.radix-ui.com/)**: Accessible, unstyled primitives for complex components like Dialogs, Popovers, and Menus.

### 🌐 Advanced UI & Visuals
- **WebGL / Shaders**: Custom GLSL shaders powered by **[OGL](https://github.com/o-gl/ogl)** for the interactive ambient "Orb" and background effects.
- **[Lucide React](https://lucide.dev/)**: A clean, consistent icon library.
- **[Recharts](https://recharts.org/)**: Interactive data visualization for quiz analytics.
- **[Embla Carousel](https://www.embla-carousel.com/)**: High-performance, touch-friendly carousel for PPT previews.

### 🛠️ Production APIs & Tools
- **OCR Engine**: **[OCR.space API](https://ocr.space/)** for high-accuracy text extraction from images.
- **Document Processing**:
  - `pdf-parse`: Server-side PDF text extraction.
  - `jspdf`: dynamic PDF generation and export.
  - `pptxgenjs`: Interactive PowerPoint (PPTX) generation.
  - `docx`: Microsoft Word document export.
- **Utilities**: `axios`, `date-fns`, `react-hook-form`, `next-themes`.

---

## 🚀 Key Features

### 📖 Study Mode
A specialized persona that acts as an **Advanced Academic Tutor**.
- **Trigger**: Prefix messages with `[Study: ... ]`.
- **Output**: Generates **"13 Marks Answers"** with structured sections, emojis, and comparison tables.
- **Flow**: Includes a process "Flow Summary" and a detailed "Conclusion".

### 🧠 Think Mode
For deep dives into complex topics.
- **Trigger**: Prefix messages with `[Think: ... ]`.
- **Output**: Deeply detailed, step-by-step explanations focusing on "why" and "how".

### 📝 Quiz Mode
AI-powered exam generation and performance analysis.
- **Generation**: Creates college-level MCQs based on any topic.
- **Analysis**: Provides feedback on weak areas and study tips based on score.

### 📊 Interactive PPT Generator
Convert any chat discussion into a professional presentation.
- **Live Preview**: Real-time rendering of slides.
- **Export**: One-click download as `.pptx` file.

---

## 👨‍💻 Developed By
**Sasikumar**
[Portfolio](https://www.sasikumar.in) | [GitHub](https://github.com/sasikumarmcadev) | [LinkedIn](https://www.linkedin.com/in/sasikumarmca)