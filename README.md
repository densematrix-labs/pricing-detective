# 🔍 Pricing Detective

AI-powered tool to detect hidden fees, fake free tiers, and misleading pricing in SaaS tools.

## Features

- **Hidden Fee Detection** - Identifies undisclosed fees like setup costs, overage charges, and required add-ons
- **Fake Free Analysis** - Exposes "free" tiers with severe limitations that make them unusable
- **Misleading Price Spotting** - Catches bait-and-switch tactics, per-user vs per-seat confusion, and annual vs monthly tricks
- **True Cost Estimation** - Calculates realistic costs based on actual usage patterns
- **7 Language Support** - English, 中文, 日本語, Deutsch, Français, 한국어, Español

## How It Works

1. Copy the entire pricing page from any SaaS tool (Ctrl+A, Ctrl+C)
2. Paste it into Pricing Detective
3. Get an instant analysis revealing all hidden catches

## Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Python FastAPI
- **AI**: Claude via llm-proxy.densematrix.ai
- **Deployment**: Docker on langsheng

## Local Development

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## Docker Deployment

```bash
docker compose up -d --build
```

## Ports

| Service | Port |
|---------|------|
| Frontend | 30150 |
| Backend | 30151 |

## Live URL

https://pricing-detective.demo.densematrix.ai

## License

MIT
