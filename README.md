# ⚡ VOLTRA | Sonic Intelligence

![VOLTRA Banner](https://raw.githubusercontent.com/suhairii/Voltra-Live-Transcription/main/public/vexa-logo.svg)

**VOLTRA** is a next-generation live meeting transcription and intelligence platform. It provides a fluid, modern interface for real-time audio processing, powered by the Vexa AI backend.

## ✨ Features

- **🚀 Real-time Transcription**: High-speed, low-latency live transcription for Google Meet and Zoom.
- **🤖 AI Intelligence**: Correct grammar and summarize meeting transcripts instantly via n8n integration.
- **🔋 Sonic Core Interface**: A beautiful "Liquid OS" inspired UI with glassmorphism and dynamic islands.
- **📱 Responsive Design**: Fully optimized for Desktop, Tablet, and Mobile devices.
- **⚡ Test Simulation**: Built-in interview simulation to test the system without needing a live meeting.

## ⚠️ MANDATORY BACKEND SETUP

**VOLTRA** is a frontend interface. It **REQUIRES** a running instance of the **Vexa AI** backend to function (for transcription, bot management, and meeting connections).

> [!IMPORTANT]
> Before running VOLTRA, you must set up the Vexa backend:
> **[Vexa AI Official Repository](https://github.com/Vexa-ai/vexa)**

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

### 🔗 n8n Workflow Setup

To enable the **Correct** and **Summary** features, you need an n8n workflow. Follow these steps:
1. Open your n8n instance.
2. Create a new workflow.
3. Copy the JSON below and paste it directly into the n8n canvas.
4. **Important**: The JSON contains a placeholder for **Groq AI Credentials**. You must:
   - Click on the **Groq Chat Model** node.
   - Select or Create your own **Groq API credentials** using your API Key from [Groq Console](https://console.groq.com/).
5. Deploy the workflow and copy the **Production Webhook URL**.
5. Paste that URL into the **VOLTRA** settings.

<details>
<summary>📦 Click to copy n8n Workflow JSON</summary>

```json
{
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "vexa-ai-processor",
        "responseMode": "responseNode",
        "options": {}
      },
      "id": "9d61bdf8-7b0a-4eb7-a277-f5f590c981ef",
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [
        -336,
        -80
      ],
      "webhookId": "57861fab-6f9e-4f13-bf9b-c2451637521a"
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { \"output\": $json.text } }}",
        "options": {
          "responseCode": 200
        }
      },
      "id": "b0c5ab11-6f4c-4fef-bccf-1a8c7b59d5b0",
      "name": "Respond to Webhook",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [
        304,
        -64
      ]
    },
    {
      "parameters": {
        "model": "llama-3.3-70b-versatile",
        "options": {}
      },
      "type": "@n8n/n8n-nodes-langchain.lmChatGroq",
      "typeVersion": 1,
      "position": [
        -16,
        112
      ],
      "id": "58ec661c-86e3-4b5a-903e-c7b8775ef5f5",
      "name": "Groq Chat Model",
      "credentials": {
        "groqApi": {
          "id": "5vbLLuWW8zOsRYRM",
          "name": "Groq account"
        }
      }
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "={{ $json.body.action === 'correct' || $json.body.action === 'manual_copy' \n? `SYSTEM: You are an Expert Indonesian Speech Editor.\nYour task is to repair a BROKEN, hallucinated Speech-to-Text transcript.\n\nDYNAMIC RULES (No Hardcoded Names):\n1. **SYNC NAME WITH LABEL (CRITICAL):** - Look at the speaker label inside brackets, e.g., '[Muhammad Suhairi]'.\n   - If the text says a wrong name like \"Mamat Silahiri\", \"Nomor saya\", or \"Bapak IRP\", AUTO-CORRECT it to match the Label Name (\"Muhammad Suhairi\").\n   - Trust the Label provided in the input over the garbled text.\n\n2. **CONTEXTUAL PHONETIC REPAIR:**\n   - The text contains severe \"hallucinations\" (nonsense words). You must reconstruct the likely original sentence based on INTERVIEW CONTEXT.\n   - Example Logic:\n     - \"Hospital Longwood\" -> likely \"Kesiapan Anda\" or \"Posisi Anda\" (Sound-alike or Context-fit).\n     - \"Meneguh manager\" -> \"Menunggu manajer\".\n     - \"Desa yang mungkin\" -> \"Berkas/Data yang mungkin\".\n     - \"Sisi W\" -> \"Sesi Wawancara\".\n\n3. **CLEANING:**\n   - MERGE fragmented lines into complete sentences.\n   - DELETE all \"Speaker\" lines or video artifacts (\"Terima kasih menonton\").\n\n4. **FORMAT:**\n   - Keep the exact label from the input.\n   - Output: [Label]: [Clean, Professional Indonesian Sentence]\n\n---\nRAW DATA:` \n: `Bertindaklah sebagai Recruiter. Analisis transkrip wawancara ini dan ekstrak data kandidat ke dalam format poin berikut:\n\n1. **Nama:**\n2. **Umur:**\n3. **Pengalaman:**\n4. **Sistem/Tools yang Digunakan:**\n5. **Alasan Resign:**\n6. **Tanggal Masuk (Join Date):**\n7. **Current Salary:**\n8. **Expected Salary:**\n9. **Report (Laporan/Kesimpulan):**` \n}}\n\n{{ $json.body.transcript }}",
        "batching": {}
      },
      "type": "@n8n/n8n-nodes-langchain.chainLlm",
      "typeVersion": 1.9,
      "position": [
        -80,
        -80
      ],
      "id": "a9f998fd-7a66-43c0-b564-935e8c63fd8e",
      "name": "Basic LLM Chain1"
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Basic LLM Chain1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Groq Chat Model": {
      "ai_languageModel": [
        [
          {
            "node": "Basic LLM Chain1",
            "type": "ai_languageModel",
            "index": 0
          }
        ]
      ]
    },
    "Basic LLM Chain1": {
      "main": [
        [
          {
            "node": "Respond to Webhook",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "pinData": {},
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "8a04b4aeafaac8872cee73f0728eaed3329473579c55143824e278a7f62700a0"
  }
}
```

</details>

---

Built with ⚡ by [Suhairi](https://github.com/suhairii)
