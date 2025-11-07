# 🏥 Vera Health Assignment

A **React Native + Expo (TypeScript)** app built for the **Vera Health Technical Take-Home Assignment**.  
This project streams real-time AI medical responses using a **Server-Sent Events (SSE)** API endpoint and renders structured markdown output with collapsible guideline and drug cards.

---

## 🚀 Features
- 🧠 **Ask any medical question** — sends your query to `https://vera-assignment-api.vercel.app/api/stream`
- ⚡ **Real-time streaming** using Server-Sent Events (SSE)
- 🪶 **Markdown rendering** with clean formatting
- 📚 **Collapsible tagged sections** for `<guideline>`, `<drug>`, etc.
- 🔍 **Live SEARCH_STEPS updates** showing reasoning progress
- 🧩 **Type-safe hooks and modular architecture**
- 💅 **Modern UI** with SafeArea, KeyboardAvoidingView, and smooth scroll

---

## 🧱 Project Structure

src/
├── api/ # API connection (SSE)
├── components/ # UI components (Accordion, Markdown, SearchProgress, etc.)
├── parsing/ # Stream parsing logic
├── screens/ # Home screen
├── state/ # Stream reducer hook
├── types/ # Shared TypeScript types
└── utils/ # Helpers (ensureJSON, rafThrottle)

---

## 🧩 Tech Stack
- **React Native (Expo SDK 52)**
- **TypeScript**
- **event-source-polyfill** (for cross-platform SSE)
- **react-native-markdown-display**
- **expo-safe-area-context**
- **Collapsible UI Components**

---

## ⚙️ Setup & Run

```bash
# 1. Clone this repo
git clone https://github.com/robleggs24/vera-health-assignment.git

# 2. Install dependencies
cd vera-health-assignment
npm install

# 3. Run the app
npm start
Notes on Architecture

The app follows a clean modular structure:

Stream Handling: EventSourcePolyfill connects to Vera’s SSE API and streams markdown in real time.

Parsing Logic: parseStructured() detects <guideline> and <drug> tags for collapsible UI rendering.

Performance: State updates are throttled and batched for smooth incremental rendering during the stream.

Scalability: Each feature (SSE, parsing, markdown, UI) is isolated — easy to test, debug, or extend later.

This separation mirrors production-level engineering standards and is ready for scaling with real APIs.

🧑‍💻 Author

Robert Leggs
Built for the Vera Health YC Technical Assignment.


