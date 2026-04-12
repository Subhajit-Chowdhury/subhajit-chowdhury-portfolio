# Data Engineering Portfolio | Subhajit Chowdhury

This repository contains my professional portfolio, designed to showcase my experience in building scalable data pipelines and cloud-based architectures. The project integrates a conversational AI assistant to provide a more interactive way for recruiters and collaborators to explore my technical background.

This project is also a submission for the **[GDG Solution Challenge](https://www.gdgcrcc.tech/solution-challenge)**, demonstrating how Large Language Models (LLMs) can be used to improve professional knowledge management and accessibility.

---

## Project Overview

The goal of this portfolio is to present my work as a Data Engineer in a clear, accessible, and modern format. Beyond a traditional static site, it includes an AI-driven assistant that can answer specific questions about my projects, skills, and work history at Tata Consultancy Services (TCS).

### Key Features

- **AI Assistant**: An integrated chatbot powered by **Google Gemini 1.5 Flash**. It uses my portfolio data as context to provide factual and concise answers to visitor inquiries.
- **Performance-Focused UX**: Includes custom skeleton loaders to ensure a smooth visual experience while the application initializes.
- **High-Contrast Design**: A focused dark theme built for readability and a professional aesthetic.
- **Optimized Background**: A lightweight particle system implemented via HTML5 Canvas to maintain high performance across all devices.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop viewing.

---

## Technical Stack

- **AI Engine**: [Google Gemini API](https://aistudio.google.com/) (`@google/generative-ai`)
- **Frontend**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

---

## Setup and Installation

### 1. Obtain a Gemini API Key
To enable the AI chatbot, you will need a free API key from Google:
1.  Go to [Google AI Studio](https://aistudio.google.com/).
2.  Sign in with your Google account.
3.  Click on **"Get API key"** in the sidebar.
4.  Select **"Create API key in new project"** and copy the key.

### 2. Local Development
1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Subhajit-Chowdhury/portfolio.git
    cd portfolio
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Configure environment variables**:
    Create a `.env` file in the root directory and add your key:
    ```env
    VITE_GEMINI_API_KEY=your_api_key_here
    ```
4.  **Start the development server**:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

---

## Deployment

### Vercel
1.  Push your code to a GitHub repository.
2.  Import the project into [Vercel](https://vercel.com/).
3.  Add `VITE_GEMINI_API_KEY` to the **Environment Variables** in the project settings.
4.  Deploy.

### Netlify
1.  Connect your GitHub repository to [Netlify](https://www.netlify.com/).
2.  Go to **Site Settings > Environment Variables**.
3.  Add `VITE_GEMINI_API_KEY`.
4.  Trigger a new deployment.

---

## Contact Information

- **LinkedIn**: [subhajit00100](https://www.linkedin.com/in/subhajit00100/)
- **GitHub**: [Subhajit-Chowdhury](https://github.com/Subhajit-Chowdhury)
- **Email**: [er.subhajitchowdhury@gmail.com](mailto:er.subhajitchowdhury@gmail.com)

---

*This project focuses on the practical application of AI to enhance professional communication and data accessibility.*
