# TrustAI – NFT Marketplace (mobile UI)

A redesigned, **mobile-only** UI for the TrustAI NFT trading app (flows taken from `trustai-frontend-2025`).
React 18 + Vite, no UI framework. It runs fully offline on **mock data** today, and switches to the real
Spring Boot backend (`trustai-2025`) by changing an env file, with no code changes.

```bash
npm install
npm run dev          # http://localhost:5191 (mock data, no backend needed)
```

Sign in with **`demo` / `demo123`** (tap the hint on the login screen). Any other username with a password of 6+ characters
also works and starts as a fresh account. Register with invitation code `TRUST2025`.

> The layout is designed for phones only. On a desktop browser it renders inside a centred 430 px frame.
> For the best preview, open DevTools → device toolbar (e.g. iPhone 14).

---

## App flow

### 1 · Onboarding & auth
`Splash → Welcome (3 slides) → Register / Login → Home`

| Splash | Welcome | Get started | Register | Login |
|:-:|:-:|:-:|:-:|:-:|
| <img src="docs/screens/01-splash.jpg" width="170"> | <img src="docs/screens/02-welcome-discover.jpg" width="170"> | <img src="docs/screens/03-welcome-get-started.jpg" width="170"> | <img src="docs/screens/04-register.jpg" width="170"> | <img src="docs/screens/05-login.jpg" width="170"> |

### 2 · Home
Balance, banners, quick actions, trending NFTs by category, top collections, featured stake pools.

| Home | Top collections | Stake & features |
|:-:|:-:|:-:|
| <img src="docs/screens/06-home.jpg" width="200"> | <img src="docs/screens/07-home-collections.jpg" width="200"> | <img src="docs/screens/08-home-stake-and-features.jpg" width="200"> |

### 3 · Explore → Stake an NFT
`Explore (Stake market) → NFT detail → Stake sheet → Success 🎉 (or Insufficient balance → Deposit)`

| Stake market | My stakes | Stake summary | Collection |
|:-:|:-:|:-:|:-:|
| <img src="docs/screens/09-explore-stake-market.jpg" width="190"> | <img src="docs/screens/10-explore-my-stakes.jpg" width="190"> | <img src="docs/screens/11-my-stake-summary.jpg" width="190"> | <img src="docs/screens/12-explore-collection.jpg" width="190"> |

| NFT detail | About / creator | Stake sheet | Stake success | Insufficient balance |
|:-:|:-:|:-:|:-:|:-:|
| <img src="docs/screens/13-nft-detail.jpg" width="170"> | <img src="docs/screens/14-nft-detail-about.jpg" width="170"> | <img src="docs/screens/15-stake-sheet.jpg" width="170"> | <img src="docs/screens/16-stake-success.jpg" width="170"> | <img src="docs/screens/17-stake-insufficient-balance.jpg" width="170"> |

### 4 · Reserve → Match → Sell (daily round)
`Reserve (pick level + amount) → Reservation placed → Order matching… → Matched → Sell → Income credited → Next-round countdown`

| Reserve | How it works | Placed | Matching | Matched |
|:-:|:-:|:-:|:-:|:-:|
| <img src="docs/screens/18-reserve.jpg" width="170"> | <img src="docs/screens/19-reserve-how-it-works.jpg" width="170"> | <img src="docs/screens/20-reserve-placed.jpg" width="170"> | <img src="docs/screens/21-orders-matching.jpg" width="170"> | <img src="docs/screens/22-orders-matched.jpg" width="170"> |

| Sell list | Sell sheet | Sold | Next round |
|:-:|:-:|:-:|:-:|
| <img src="docs/screens/23-sell-list.jpg" width="190"> | <img src="docs/screens/24-sell-sheet.jpg" width="190"> | <img src="docs/screens/25-sold-toast.jpg" width="190"> | <img src="docs/screens/26-reserve-next-round-countdown.jpg" width="190"> |

### 5 · Wallet
`Wallet → Deposit (QR + TxID) → Submitted` · `Wallet → Withdraw` · `Wallet → History`

| Wallet | Deposit | Deposit submitted | Withdraw | History |
|:-:|:-:|:-:|:-:|:-:|
| <img src="docs/screens/27-wallet.jpg" width="170"> | <img src="docs/screens/28-deposit.jpg" width="170"> | <img src="docs/screens/29-deposit-submitted.jpg" width="170"> | <img src="docs/screens/30-withdraw.jpg" width="170"> | <img src="docs/screens/31-transactions.jpg" width="170"> |

### 6 · Profile & community
`Profile → My team / Contributions · Invite · Levels & benefits · Notifications · Log out`

| Profile | Team & orders | Menu | Community |
|:-:|:-:|:-:|:-:|
| <img src="docs/screens/32-profile.jpg" width="190"> | <img src="docs/screens/33-profile-team-orders.jpg" width="190"> | <img src="docs/screens/34-profile-menu.jpg" width="190"> | <img src="docs/screens/35-team.jpg" width="190"> |

| Invite friends | Levels & benefits | Notifications |
|:-:|:-:|:-:|
| <img src="docs/screens/36-referral.jpg" width="200"> | <img src="docs/screens/37-levels.jpg" width="200"> | <img src="docs/screens/38-notifications.jpg" width="200"> |

---

## Environments & switching to the real backend

The data layer is picked **at build time** from `.env.<mode>`:

| Command | Env file | Data source |
|---|---|---|
| `npm run dev` | `.env.development` | **Mock** (`VITE_USE_MOCK=true`) |
| `npm run dev:api` | `.env.dev` | Real API through the Vite proxy → `VITE_API_PROXY_TARGET` (default `http://localhost:8080`) |
| `npm run build:dev` | `.env.dev` | DEV backend |
| `npm run build:uat` | `.env.uat` | UAT backend |
| `npm run build` | `.env.production` | PROD backend (`/api`, proxied by Apache) |

To connect a backend, set `VITE_USE_MOCK=false` and `VITE_API_BASE_URL` (plus `VITE_API_PROXY_TARGET` for local dev).
For personal overrides, create `.env.development.local` (git-ignored). In non-mock builds the mock adapter and its data are
tree-shaken out of the bundle.

### How it's wired

```
screens / context ──► api  (src/api/index.js picks the adapter)
                           ├── mock/mockApi.js   in-memory "server" + mockData.js seed, persisted to localStorage
                           └── http/httpApi.js   fetch client → endpoints.js → mappers.js (DTO → UI model)
                     both implement src/api/contract.js
```

- **`src/api/contract.js`**: the single source of truth. Every model and method the UI uses is listed there. In dev, both adapters
  are checked against it at startup.
- **`http/endpoints.js`**: every backend path in one place, already pointing at the `trustai-2025` controllers
  (`/v1/orders`, `/v1/investments`, `/v1/investment-schemas`, `/v1/incomes/summary`, `/v1/users/metrics/member-summary`, …).
  Paths marked `TODO` don't exist in the backend yet.
- **`http/mappers.js`**: converts backend DTOs (`UserReservationDto`, `UserInvestmentSummary`, `ReservationSummary`, …) into
  UI models. If backend field names change, only this file changes.
- **`http/httpClient.js`**: base URL, bearer token, timeout, one silent refresh via `/auth/refresh`, and error normalisation into `ApiError`.
- Screens never import mock data; they only call `api.*` through `useApi()`.

### Mock backend behaviour
The mock behaves like a real server: it checks balance, level and limits (try staking more than your balance to see the error),
matches a reservation to an NFT about 8 s after you reserve, settles deposits after about 10 s, credits income when you sell,
and allows one reservation per day (then shows a countdown). State is saved in `localStorage` under `trustai.mockdb`.
To reset it, run `localStorage.removeItem('trustai.mockdb')` or clear the site data.

---

## Project structure

```
src/
  api/            contract, adapters (mock + http), session, errors
  components/     Icon, NftArt (procedural artwork), Cards, Nav (TopBar/BottomNav/Segmented/Chips),
                  Overlays (Sheet/Dialog/Toast), Widgets (QR, Countdown, Amount, TxRow…), Field, States, Confetti
  config/env.js   typed env resolution
  context/        AppContext: session, user, wallet, unread count, toasts
  hooks/          useApi, useCountdown
  screens/        one file per screen (18 screens)
  styles.css      design tokens + all styles (dark theme)
scripts/capture-screens.mjs   walks the full flow and regenerates docs/screens/*
```

NFT artwork is generated procedurally from `artSeed` (pixel punks, orbs, synthwave rings, bauhaus, blooms), so the app needs no
image assets. When the backend sends an `imageUrl`, the real image is shown instead.

## Regenerating the screenshots

```bash
npm run dev            # terminal 1
npm run screenshots    # terminal 2: uses the local Chrome/Edge (set CHROME_PATH to override)
```

The script also works as an end-to-end smoke test: it fails if any page logs an error or warning.
