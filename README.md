# Link-Forge
**LinkForge** is a URL shortener with analytics platform. Users create short, shareable links and track click performance (clicks, referrers, devices, countries) from a centralized dashboard.


# 1.Getting started commands :

## Clone the repo
```text
git clone <your-repo-url>
cd linkforge
```

## Copy environment variables
```text
cp .env.example .env
```

## Start infrastructure (Postgres, Redis, RabbitMQ)
```text
docker-compose up -d postgres redis rabbitmq
```

## Start API (Terminal 1)
```text
cd packages/api
npm install
npm run dev
```

## Start Analytics Service (Terminal 2)
```text
cd packages/analytics-service
mvn spring-boot:run
```

## Start Web (Terminal 3)
```text
cd packages/web
npm install
npm run dev

```
#### Everything should be running:
#### -API: http://localhost:4000 ->demo for now
#### -Analytics: http://localhost:8080 ->demo for now
#### -Web: http://localhost:3000 ->demo for now
#### -RabbitMQ UI: http://localhost:15672 ->demo for now
