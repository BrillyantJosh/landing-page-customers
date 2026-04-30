# Landing Page Customers — www.mejmosefajn.org

Stranka skenira svoj **Lana WIF privatni ključ** in v trenutku vidi stanje na svojem računu (LANA + FIAT vrednost).

## Stack

- Vite + React 18 + TypeScript + Tailwind
- Express 5 (statičen SPA + WIF proxy)
- WIF kriptografija na klientu (`elliptic`, `bech32`, `crypto-js`)
- QR skener: `jsqr` + adaptive threshold za boljši zajem
- i18n: SL / EN / DE / IT (auto-detect, `localStorage`)

## Lokalni razvoj

```bash
npm install
cp .env.example .env
npm run dev
```

- Frontend: http://localhost:8080
- Backend: http://localhost:3008
- Vite proxy `/api/*` → `:3008`
- Server proxy `/api/*` → `LANA_PAYS_CHECK_URL` (privzeto `https://check.lanapays.us`)

## Produkcija

Docker container na VPS-u (46.225.70.103) v `webproxy` omrežju, nginx-proxy + acme-companion za SSL.

```bash
# Na VPS-u
cd /opt/apps/landing-page-customers
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

Domeni: `mejmosefajn.org` + `www.mejmosefajn.org`. Auto-deploy na push na `main` (GitHub Actions).

## API kontrakti (proxy)

| Pot | Metoda | Smer |
|---|---|---|
| `POST /api/check-wallet` | preverja registracijo wallet-a (body: `{ wallet_id }`) |
| `GET /api/balance/:address?currency=EUR` | LANA stanje + FIAT vrednost preko Electrum |
| `GET /api/wallets/:hexId` | seznam vseh wallet-ov + zamrznitveni status |

Vsi proxy-jajo na `lana-pays-check` (port 3007). V Docker-u preko internega imena `http://lana-pays-check-web:3007`.

## WIF flow

1. Skeniraj QR ali prilepi WIF
2. **Klient** dekodira WIF → wallet ID, hex pubkey, npub
3. Klic `/api/check-wallet` (registracija)
4. Če registriran: klic `/api/balance/:walletId?currency=EUR` → prikaz FIAT
5. Klic `/api/wallets/:hexId` → preverim zamrznitveni status

Privatni ključ **nikoli ne zapusti brskalnika**. Server vidi le wallet ID / hex ID.

## Slike

- `public/lana-favicon.png` — Lana logo
- `public/bg/1.png` ... `5.png` — rotirajoča ozadja (Triglav, sončni vzhod)
