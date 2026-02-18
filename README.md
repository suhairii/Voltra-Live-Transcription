# ⚡ VOLTRA | Sonic Intelligence

![VOLTRA Banner](https://raw.githubusercontent.com/suhairii/Voltra-Live-Transcription/main/public/vexa-logo.svg)

**VOLTRA** is a next-generation live meeting transcription and intelligence platform. It provides a fluid, modern interface for real-time audio processing, powered by the Vexa AI backend.

## ✨ Features

- **🚀 Real-time Transcription**: High-speed, low-latency live transcription for Google Meet and Zoom.
- **🤖 AI Intelligence**: Correct grammar and summarize meeting transcripts instantly via n8n integration.
- **🔋 Sonic Core Interface**: A beautiful "Liquid OS" inspired UI with glassmorphism and dynamic islands.
- **📱 Responsive Design**: Fully optimized for Desktop, Tablet, and Mobile devices.
- **⚡ Test Simulation**: Built-in interview simulation to test the system without needing a live meeting.

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Icons**: Lucide React
- **Animation**: Tailwind Animate
- **Backend Connection**: WebSocket (via Vexa AI Provider)

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.x or higher
- **npm** or **yarn**
- **Vexa API Key**: Required to connect to the transcription engine.
- **n8n Webhook (Optional)**: For AI correction and summarization features.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/suhairii/Voltra-Live-Transcription.git
   cd Voltra-Live-Transcription
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   The app defaults to `localhost` for local development. You can configure these within the UI settings:
   - API Host: `http://localhost:8056`
   - Admin Host: `http://localhost:8057`

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open the app:**
   Navigate to `http://localhost:3000` in your browser.

## 🧪 Testing the Simulation

Don't have a live meeting? No problem.
1. Go to the **Testing & QA** section in the sidebar.
2. Click **"RUN TEST INTERVIEW"**.
3. Watch **VOLTRA** simulate a real-world interview conversation in real-time.

## ⚙️ Configuration

- **API Key**: Generate one from your Vexa Admin Dashboard or use the "Generate" button in the UI if an admin token is provided.
- **n8n Integration**: Paste your n8n webhook URL in the "Intelligence" section to enable AI features.

---

Built with ⚡ by [Suhairi](https://github.com/suhairii)
