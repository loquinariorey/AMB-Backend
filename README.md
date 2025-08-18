## AMB Backend API

Production-ready REST + WebSocket backend for a job portal built with Express, TypeScript, Sequelize (MySQL), Socket.IO, PM2, and AWS S3.

### Stack
- Express, Helmet, CORS, express-rate-limit, Morgan
- TypeScript, Node.js (LTS)
- Sequelize (MySQL/MariaDB)
- Socket.IO (realtime chat)
- Multer + AWS S3 (uploads)
- Nodemailer (SMTP)
- Winston (structured logging)

### Project structure
```
config/                 # Database config
controllers/            # Route handlers
middleware/             # Auth, validation, error handler, uploads
models/                 # Sequelize models + associations
routes/                 # API routes
scripts/                # Helper scripts
utils/                  # Logger, notifications, db performance, sockets
server.ts               # HTTP + WebSocket entrypoint
index.ts                # Misc entry
tsconfig.json           # TS build config
```

### Requirements
- Node.js LTS (18/20)
- MySQL/MariaDB
- AWS S3 credentials (for uploads)
- SMTP credentials (for emails)

### Environment variables
Create `.env` at project root.

Required:
- DB: `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_HOST`, `DB_PORT`, `DB_SSL` (optional `true`/`false`)
- JWT: `JWT_SECRET`, `JWT_EXPIRATION` (optional, default 1d)
- SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- AWS: `AWS_ACCESS_KEY`, `AWS_SECRET_KEY`, `AWS_REGION`, `S3_BUCKET`
- Server: `PORT` (default 3000), `NODE_ENV`, `RATE_LIMIT_WINDOW` (minutes), `RATE_LIMIT_MAX`
- Logging: `LOG_LEVEL` (default info)

### Local development
```
npm ci
npm run dev   # ts-node-dev, hot reload
```

Build and run:
```
npm run build
npm start     # runs dist/server.js
```

Health checks:
- `GET /health` – server liveness
- `GET /api/performance-test` – DB connectivity and timing

### TypeScript config (important)
Ensure `dist/` is excluded so the compiler doesn’t re-scan output:
```
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "dist",
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo"
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### Deploy on EC2 with PM2
Install Node + PM2:
```
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
. ~/.nvm/nvm.sh
nvm install --lts
npm i -g pm2
```

Option A – Build on EC2:
```
git clone <REPO_URL> amb-backend && cd amb-backend
cp /path/to/.env .env
export NODE_OPTIONS=--max-old-space-size=4096   # if RAM-limited
npm ci && npm run build
pm2 start dist/server.js --name amb-api
pm2 save
pm2 startup systemd -u $USER --hp $HOME
```

Option B – Deploy prebuilt dist from local (fastest):
```
# Local
npm ci && npm run build
tar czf amb-dist.tgz dist package.json package-lock.json
scp -i /path/to/key.pem amb-dist.tgz ec2-user@<EC2_IP>:~/

# EC2
rm -rf ~/amb-backend && mkdir ~/amb-backend && cd ~/amb-backend
tar xzf ~/amb-dist.tgz
cp /path/to/.env .env
npm ci --omit=dev
pm2 start dist/server.js --name amb-api || pm2 reload amb-api
pm2 save
```

PM2 basics:
```
pm2 status
pm2 logs amb-api --lines 100
pm2 reload amb-api     # zero-downtime
pm2 restart amb-api    # full restart
pm2 stop amb-api && pm2 delete amb-api
pm2 install pm2-logrotate
```

Nginx reverse proxy (with WebSockets):
```
server {
  listen 80;
  server_name your.domain.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
  }
}
```

### Key endpoints (selected)
- Auth: `/api/auth/*` (register/login/me/change-password/email flows)
- Jobs: `/api/jobs/*` (list/detail/create/update/delete/featured/recommendations/favourites)
- Uploads: `/api` and `/api/chat-upload`
- Realtime chat: Socket.IO events `join`, `message`, `editMessage`, `deleteMessage`

### Logging and rate limiting
- Winston logs to console (non-prod) and `logs/error.log`, `logs/combined.log`
- Morgan HTTP logs via Winston stream
- Rate limit defaults: 10k req / 15 min (tunable via env)

### Security notes
- Restrict CORS allowlist in production
- Protect Socket.IO with JWT authentication if exposed publicly
- Keep `JWT_SECRET` strong; enable HTTPS via Nginx/ALB

### Troubleshooting
- TypeScript OOM on EC2:
```
export NODE_OPTIONS=--max-old-space-size=4096
rm -rf dist .tsbuildinfo && npm ci && npm run build
```
- Divergent git branches on server:
```
git fetch origin && git reset --hard origin/main && git clean -fd
```
- “Cannot find module './middleware/errorHandler'” after start:
  - Ensure `dist/` exists and contains compiled files; rebuild or deploy prebuilt `dist`.
- Builds feel slow:
  - First build after deleting `.tsbuildinfo` is slow; subsequent builds cache.

### License
MIT