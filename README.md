# Lead Dashboard

A work-in-progress dashboard to manage and track sales leads. Built with Next.js, React, TypeScript, and a PostgreSQL database (Dockerized).
The goal: make lead management more efficient by combining automation, data visualization, and (soon) AI-powered outreach.

## ⚠ Status

🚧 Still under development. Core dashboard is functional, AI and Gmail integrations coming soon...

## 📸 Demo

![Screenshot](public/demo.png)  

## Features (current)

- Interactive dashboard with lead tracking table  
- Add, edit, and manage leads directly in the interface  
- Data stored in a PostgreSQL database (Dockerized)
- Database schema managed with Prisma (Lead model, migrations)
- Modern front-end stack (Next.js, React, TailwindCSS, shadcn/ui)

## Upcoming Features (planned)

- **AI-powered email generator**: automatically draft personalized outreach emails for each lead  
- **Gmail integration**: send and track follow-up emails directly from the dashboard  
- **Advanced analytics**: more KPIs such as response rates, conversion funnel, and owner performance  

## Installation

### Clone the repo

```bash
git clone https://github.com/amoustadraf/lead-dashboard.git
cd lead-dashboard
```

### Install dependencies

```bash
npm install
```

### Set up environment

Copy the example env and adjust if needed:
```bash
cp .env.example .env
```
.env.example:
```bash
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/lead_dashboard?schema=public"
```
### Start Postgres with Docker

```bash
docker compose up -d
```
This creates a lead_dashboard database inside the Postgres container.

### Run Prisma migrations

```bash
npx prisma migrate dev --name init
```
This applies the schema (creates the Lead table, etc).

### Run locally
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Built With

- **Frontend**: Next.js, React, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: PostgreSQL (Dockerized)
- **ORM**: Prisma
- **Visualization**: Recharts
- **Planned AI**: OpenAI API (personalized email generation)

## 📘 License

This project is open-source and available under the [MIT License](LICENSE).
