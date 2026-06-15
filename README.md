# Clarify ⚡️

> An offline-first, AI-powered Notes & Todo ecosystem built for maximum productivity and absolute privacy.

Clarify is a modern React Native application designed to serve as a comprehensive personal productivity assistant. By merging robust offline-first synchronization with cutting-edge Retrieval-Augmented Generation (RAG) AI capabilities, Clarify ensures that your data is always accessible, and your personal AI is always contextually aware.

Inspired by the calm, premium user experiences of *Things 3* and *Linear*, Clarify focuses on a zero-friction interface powered by a robust and reliable engineering foundation.

---

## 📸 Screenshots

| Dashboard | Inbox | Notes |
| :---: | :---: | :---: |
| *[Add Dashboard Screenshot Here]* | *[Add Inbox Screenshot Here]* | *[Add Notes Screenshot Here]* |

| AI Assistant (RAG) | Task Breakdown | Search |
| :---: | :---: | :---: |
| *[Add AI Screenshot Here]* | *[Add Breakdown Screenshot Here]* | *[Add Search Screenshot Here]* |

---

## ✨ Features

### 📝 Notes & ✅ Todos
- **Rich Task Management**: Set priorities, categorize tasks, and track completions seamlessly.
- **Note Taking**: Capture thoughts quickly with an intuitive, distraction-free interface.
- **Smart Inbox**: A unified view of all active tasks and notes.
- **Dashboard Insights**: AI-generated summaries and intelligent overviews of your day.

### 🤖 AI Capabilities (Powered by Google Gemini)
- **Ask AI (RAG)**: Chat directly with an AI that understands your tasks and notes. Powered by Gemini, the AI retrieves relevant context from your database using vector search before answering.
- **Task Breakdown**: Use AI to automatically split large, overwhelming goals into actionable sub-tasks.
- **Automated Embeddings**: Every task and note is automatically embedded using `gemini-flash-latest` via Supabase Webhooks.

### ☁️ Offline Sync & 🔒 Authentication
- **True Offline-First**: Built with Zustand and AsyncStorage. The app works flawlessly without an internet connection.
- **Intelligent Synchronization**: Custom delta-sync engine with Last-Write-Wins conflict resolution.
- **Background Sync**: Automatic silent background syncing when the network is available.
- **Google Authentication**: Secure, native Google OAuth login.
- **Guest Mode**: Try the app fully offline without creating an account.

### 🎨 Premium UI/UX
- **Calm Interface**: Minimalist, distraction-free design with carefully curated typography (`Outfit`).
- **Dynamic Theming**: Fluid transitions between Light and Dark mode.
- **Micro-interactions**: Subtle haptic feedback (`expo-haptics`) and fluid animations.
- **Interactive Tutorials**: First-time user onboarding and swipe tutorials.

---

## 🛠 Tech Stack

| Category | Technology |
|---|---|
| **Frontend Framework** | React Native (0.81) / Expo SDK 54 |
| **Routing** | Expo Router v6 |
| **State Management** | Zustand |
| **Local Storage** | AsyncStorage |
| **Database** | PostgreSQL (Supabase) + `pgvector` |
| **Backend Logic** | Supabase Edge Functions (Deno) |
| **Authentication** | Supabase Auth (Google OAuth) |
| **AI Provider** | Google Gemini (`gemini-flash-latest`) |
| **Styling** | Custom Theme System / Vanilla Stylesheets |

---

## 📂 Folder Structure

```
clarify/
├── src/
│   ├── app/                 # Expo Router routes & layout definitions
│   │   ├── (ai)/            # AI-specific screens (Ask AI, Breakdown)
│   │   ├── (tabs)/          # Main navigation tabs
│   │   └── _layout.js       # Root navigation architecture
│   ├── components/          # Reusable UI components (TodoItem, AIResponse, etc.)
│   ├── hooks/               # Custom React hooks
│   ├── screens/             # Screen logic implementations
│   ├── services/            # Core business logic (aiService, syncService, supabase)
│   ├── store/               # Zustand state stores (todo, notes, auth, ui)
│   ├── theme/               # Design tokens, colors, and typography
│   └── utils/               # Helpers (sync conflicts, date formatters)
├── supabase/
│   ├── functions/           # Edge Functions (e.g., /ai for Gemini interactions)
│   └── migrations/          # Database schema & pgvector initialization
└── app.json                 # Expo configuration
```

---

## 🏗 Architecture

Clarify uses a decoupled offline-first architecture combined with a cloud-native RAG pipeline.

```mermaid
graph TD
    A[User] -->|Interacts| B(Expo React Native App)
    B <-->|Zustand / AsyncStorage| C{Local Offline State}
    C <-->|SyncService (Delta Sync)| D[(Supabase PostgreSQL)]
    D -->|Postgres Webhooks| E[Supabase Edge Function]
    E -->|Fetch Embeddings| F(Google Gemini API)
    F -->|Return Vectors| E
    E -->|Save Embeddings| D
    B -->|Ask AI Query| E
    E <-->|Vector Similarity Search| D
    E -->|Context + Query| F
    F -->|AI Response| B
```

### AI Architecture Deep Dive
1. **Embedding Pipeline**: When a note or task is updated, a Postgres Webhook (`AFTER INSERT OR UPDATE`) fires. The Supabase Edge Function catches this, generates a 768-dimensional vector using Gemini, mathematically pads it to match the database's 1536-dimensional schema, and saves it to `pgvector`.
2. **Retrieval-Augmented Generation (RAG)**: When a user queries the "Ask AI" screen, the app sends the query to the Edge Function. The function embeds the query, executes an RPC similarity search against `pgvector` (`match_todos` & `match_notes`), and constructs a localized context window.
3. **Generation**: The context is fed to `gemini-flash-latest`, which streams back a highly personalized, context-aware answer.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Expo CLI
- A Supabase Project
- A Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/clarify.git
   cd clarify
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Setup Backend (Supabase)**
   - Run the provided SQL scripts (in `supabase/migrations/`) to create the `notes` and `todos` tables, enable `pgvector`, and setup the Webhooks.
   - Set your Gemini API key as a Supabase Secret:
     ```bash
     npx supabase secrets set GEMINI_API_KEY=your_gemini_key
     ```
   - Deploy the Edge Function:
     ```bash
     npx supabase functions deploy ai
     ```

5. **Run the App**
   ```bash
   npx expo start
   ```

---

## ⚡️ Performance Optimizations
- **Idempotent Sync Engine**: The `syncService.js` batches updates and only pulls/pushes delta changes (records modified since `lastSyncedAt`).
- **Mathematical Vector Padding**: To prevent costly database migrations, Gemini's 768-dimensional vectors are padded to 1536 via pure TypeScript during runtime, matching the legacy schema seamlessly.
- **Optimistic UI Updates**: Zustand handles state changes instantly before async storage or cloud sync completes.

---

## 🔒 Security & Privacy
- **Row Level Security (RLS)**: Every Supabase table is locked down. Users can only read, update, or delete their own tasks based on their authenticated JWT.
- **Server-Side AI**: Gemini API keys are *never* shipped with the frontend bundle. All AI requests proxy through secure Supabase Edge Functions.

---

## 🗺 Roadmap

- [x] **Phase 1**: Offline-first Sync Architecture
- [x] **Phase 2**: Core UI/UX Implementation (Dashboard, Inbox, Tasks)
- [x] **Phase 3**: RAG Integration (pgvector + Gemini)
- [ ] **Phase 4**: Reminders and Push Notifications
- [ ] **Phase 5**: Desktop / Web Client Support

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you would like to change.
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
