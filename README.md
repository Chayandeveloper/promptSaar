# PromptCraft — AI Prompt Discovery & Unlocking Platform

A complete, production-ready, full-stack ecosystem for discovering, curating, and unlocking premium AI prompts through **Google AdMob Rewarded Advertisements**.

---

## 🏛 Architecture Overview

PromptCraft is built around **ONE CENTRAL BACKEND API** communicating with a unified database. Both the **Expo React Native Mobile App** and the **Next.js Admin Panel** consume the exact same Laravel REST API.

```
┌─────────────────────────────────┐        ┌──────────────────────────────────┐
│   Expo Mobile Application       │        │     Next.js Admin Panel          │
│ (React Native + TypeScript)     │        │    (TypeScript + Tailwind)       │
└────────────────┬────────────────┘        └─────────────────┬────────────────┘
                 │                                           │
                 │   REST API Requests (Sanctum Tokens)      │
                 └───────────────────┬───────────────────────┘
                                     │
                                     ▼
                     ┌───────────────────────────────┐
                     │   Central Laravel 12 API      │
                     │  (Sanctum, REST, Gatekeeper)  │
                     └───────────────┬───────────────┘
                                     │
                                     ▼
                     ┌───────────────────────────────┐
                     │   Unified Relational Database │
                     │   (SQLite / MySQL compatible) │
                     └───────────────────────────────┘
```

---

## 🚀 Key Features

### 📱 Expo Mobile App (`/mobile`)
- **Expo Router 57**: File-based routing with stack and modal presentations.
- **3-Tab Bottom Navigation**:
  - `Home`: Personalized greeting, dynamic featured Hero card, AdMob Banner, horizontal Category pills, Search bar with 350ms debounce, Trending section, and Recently Added feed.
  - `Saved`: Bookmark library synced with the central API backend.
  - `Profile`: Account information, telemetry stats (Unlocked count, Saved count), Unlock History, Settings, Privacy Policy, and Terms.
- **Security-First Prompt Unlocking**:
  - `prompt_text` is **NEVER** transmitted in listing APIs or unauthenticated requests.
  - Users tap **"Unlock Prompt with Ad"** to trigger a **Google AdMob Rewarded Video**.
  - On reward completion, the backend cryptographically logs the unlock in `prompt_unlocks` and returns the full prompt text.
  - Unlocked prompts remain permanently unlocked for that user (no repeated ads required).
- **1-Click AI Integration**:
  - **Copy Prompt**: Instant clipboard copy with animated visual feedback.
  - **Open in ChatGPT**: Auto-copies prompt and opens native app (`chatgpt://`) or web experience.
  - **Open in Gemini**: Auto-copies prompt and opens native app (`gemini://`) or web experience.
- **Expo SecureStore**: Native hardware-encrypted token storage (no insecure AsyncStorage).
- **TanStack React Query**: Fast multi-level caching, background refetching, and instant optimistic cache updates.

### 🖥 Next.js Admin Panel (`/admin`)
- **Dashboard Telemetry**: Real-time KPI counters (Total Users, Total Prompts, Total Categories, Total Unlocks, Today's Unlocks, Published Prompts) and live audit log of rewarded ad unlocks.
- **Prompt Management**:
  - Full CRUD operations with rich prompt instructions, placeholders, and tags.
  - Live toggles for `is_published`, `is_featured` (Hero placement), and `is_trending`.
  - Image file uploader + direct CDN image URL support.
- **Category Management**: Create, edit, and delete database-driven prompt taxonomies.
- **User Directory**: View registered mobile accounts and unlock activity.
- **Unlocks Audit**: Transparent ledger of verified AdMob reward unlocks.

---

## ⚡ Quick Start Guide

### 1. Central Backend API (`backend/`)

```bash
cd backend

# Setup environment and database
copy .env.example .env
php artisan key:generate

# Run migrations and seed high-quality initial prompts & categories
php artisan migrate:fresh --seed
php artisan storage:link

# Start the API server
php artisan serve --host=127.0.0.1 --port=8000
```

> **API Base URL**: `http://127.0.0.1:8000/api`

#### Seed Accounts:
- **Admin**: `admin@promptcraft.ai` / `password`
- **User**: `user@promptcraft.ai` / `password`

---

### 2. Admin Panel (`admin/`)

```bash
cd admin

# Install dependencies (already installed)
npm install

# Start the Next.js development server
npm run dev
```

Open `http://localhost:3000` in your browser. Log in with the admin credentials or click **"Fill Default Demo Admin Credentials"**.

---

### 3. Expo Mobile Application (`mobile/`)

```bash
cd mobile

# Start Expo development server
npx expo start
```

Press:
- `w` to run in the web browser
- `a` to run on Android emulator / device
- `i` to run on iOS simulator (macOS)

---

## 📡 REST API Specifications

### Public Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/categories` | List active categories with prompt counts |
| `GET` | `/api/categories/{slug}` | Category details |
| `GET` | `/api/categories/{slug}/prompts` | Prompts belonging to category |
| `GET` | `/api/prompts` | Paginated prompts with `search`, `category_id`, `category` filters |
| `GET` | `/api/prompts/featured` | Top featured hero prompts |
| `GET` | `/api/prompts/trending` | Prompts sorted by unlock engagement |
| `GET` | `/api/prompts/recent` | Newly published prompts |
| `GET` | `/api/prompts/{id}` | Prompt details (returns `prompt_text: null` if locked) |
| `POST`| `/api/auth/register` | Register new user account |
| `POST`| `/api/auth/login` | Login user account & receive Sanctum bearer token |
| `POST`| `/api/admin/login` | Admin authentication endpoint |

### Authenticated Endpoints (`Bearer <token>`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/me` | Current user profile and statistics |
| `POST`| `/api/auth/logout` | Revoke current access token |
| `GET` | `/api/me/saved` | Paginated list of user's saved prompts |
| `GET` | `/api/me/unlocked` | Paginated list of user's unlocked prompts (with full `prompt_text`) |
| `POST`| `/api/prompts/{id}/save` | Bookmark a prompt |
| `DELETE`| `/api/prompts/{id}/save` | Remove prompt from bookmarks |
| `POST`| `/api/prompts/{id}/unlock` | Complete AdMob reward & unlock full prompt text |

### Admin Endpoints (`Bearer <admin-token>`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/dashboard` | KPI analytics & recent unlock logs |
| `GET` | `/api/admin/prompts` | List all prompts (drafts + published) with filters |
| `POST`| `/api/admin/prompts` | Create new prompt with image & instructions |
| `GET` | `/api/admin/prompts/{id}` | Inspect prompt details |
| `PUT` | `/api/admin/prompts/{id}` | Update prompt metadata / publish status |
| `DELETE`| `/api/admin/prompts/{id}` | Delete prompt |
| `POST`| `/api/admin/prompts/upload-image` | Upload image file to local/cloud storage |
| `GET` | `/api/admin/categories` | Admin categories list |
| `POST`| `/api/admin/categories` | Create category |
| `PUT` | `/api/admin/categories/{id}` | Update category |
| `DELETE`| `/api/admin/categories/{id}` | Delete category |
| `GET` | `/api/admin/users` | Users directory with engagement counters |
| `GET` | `/api/admin/unlocks` | Rewarded ad unlock audit feed |

---

## 🔒 Security Best Practices Implemented

1. **Gatekeeper Security**: Listing endpoints (`/api/prompts`) query database models without returning `prompt_text`. The backend only evaluates and returns `prompt_text` if a matching row exists in `prompt_unlocks` for the requesting authenticated user.
2. **AdMob Reward Verification**: Unlocking is executed through a verified lifecycle callback before the API endpoint is invoked.
3. **Hardware Storage**: Authentication tokens are stored inside secure native keychain/keystore via `expo-secure-store`.
4. **Zero Client Secrets**: No database credentials or admin keys are embedded in the mobile binary.

---

## 🛠 Technology Stack

- **Mobile**: Expo SDK 57, React Native 0.86, TypeScript, Expo Router, TanStack Query, Expo SecureStore, Expo Haptics, Expo Clipboard.
- **Backend**: Laravel 12, Laravel Sanctum, SQLite / MySQL, Eloquent ORM.
- **Admin**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Lucide Icons.
- **Monetization**: Google AdMob (Rewarded Video & Banner units).
