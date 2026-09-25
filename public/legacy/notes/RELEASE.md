# 🚀 Deployment Guide: Academic Schedule Builder

This guide provides detailed instructions on how to deploy the Academic Schedule Builder to **GitHub Pages (github.io)**, **custom domains**, and **production servers**. 

Since this application is a **full-stack app** consisting of a **Static Frontend** (HTML, CSS, JS), a **Dynamic Backend** (Node.js/Express), and a **PostgreSQL Database**, you have a few options for deployment depending on your preferences, budget, and custom domain requirements.

---

## 📋 Table of Contents
1. [🔍 Can I Deploy to GitHub Pages (github.io)?](#1-can-i-deploy-to-github-pages-githubio)
2. [🗺️ High-Level Architecture Options](#2-high-level-architecture-options)
3. [🛠️ Option A: GitHub Pages + Hosted Backend (Free/Hybrid Model)](#3-option-a-github-pages--hosted-backend-freehybrid-model)
4. [🌐 Option B: Single-Server Custom Domain (Simplest & Best for Custom Domains)](#4-option-b-single-server-custom-domain-simplest--best-for-custom-domains)
5. [🐳 Option C: Containerized Kubernetes Ingress (Advanced Production Model)](#5-option-c-containerized-kubernetes-ingress-advanced-production-model)
6. [📋 Pre-Deployment Checklist](#6-pre-deployment-checklist)

---

## 1. 🔍 Can I Deploy to GitHub Pages (github.io)?

**Yes! But with a hybrid approach.**

GitHub Pages (github.io) is a **static web hosting service**. It serves static assets (`.html`, `.css`, `.js`, images) directly from a GitHub repository. 
* ❌ **What it CANNOT do:** Run your Express server (`db-server.js`) or host your PostgreSQL database.
* 🛡️ **The Hybrid Solution:** You can host your **frontend** on GitHub Pages for free, and deploy your **backend server** and **database** on a cloud provider (such as Render, Railway, Fly.io, Neon, or Aiven) for free or at a very low cost. 

Once your backend is deployed, you simply configure the frontend JavaScript files to make API calls to your hosted backend URL instead of `localhost:3000`.

---

## 2. 🗺️ High-Level Architecture Options

Here are the three standard architectures you can choose from depending on your domain structure:

```mermaid
graph TD
    subgraph "Option A: Hybrid (Multi-Domain)"
        A1[GitHub Pages <br> username.github.io] -->|HTTPS Requests| A2[Hosted Backend <br> render.com/railway.app]
        A2 -->|Queries| A3[(Cloud PostgreSQL <br> Neon / Aiven)]
    end

    subgraph "Option B: Monolith (Single Custom Domain)"
        B1[Custom Domain <br> my-schedule-builder.com] -->|Routes /| B2[Hosted Express Server <br> Serves Frontend & API]
        B2 -->|Queries| B3[(Cloud PostgreSQL <br> Neon / Aiven)]
    end

    subgraph "Option C: Kubernetes (Enterprise Single Domain)"
        C1[Custom Domain <br> scheduler.com] -->|Ingress Rule: /| C2[Frontend Nginx Pod]
        C1 -->|Ingress Rule: /api| C3[Backend Node Pod]
        C3 -->|Queries| C4[(PostgreSQL Pod / Service)]
    end
```

---

## 3. 🛠️ Option A: GitHub Pages + Hosted Backend (Free/Hybrid Model)

This is the most cost-effective approach. You host the frontend on GitHub Pages and a dynamic server elsewhere.

### Step 1: Deploy a PostgreSQL Database
You need a cloud-hosted database.
1. Sign up for a free PostgreSQL database provider such as:
   * **Neon Database** ([neon.tech](https://neon.tech)) — Highly recommended, includes a generous free tier.
   * **Supabase** ([supabase.com](https://supabase.com)) — Provides a free PostgreSQL database.
   * **Aiven** ([aiven.io](https://aiven.io)) or **Railway** ([railway.app](https://railway.app)).
2. Create a new database and copy the **External Connection String / URI**. It will look similar to this:
   `postgresql://neondb_owner:pass123@ep-cool-breeze-a5.us-east-2.aws.neon.tech/neondb?sslmode=require`

### Step 2: Deploy your Node.js Backend Server
Deploy the `backend` folder as a dynamic web service.
1. Sign up for **Render** ([render.com](https://render.com)) or **Railway** ([railway.app](https://railway.app)).
2. Create a new **Web Service** and connect it to your GitHub Repository.
3. Configure the service settings:
   * **Root Directory:** `backend` (Important: points Render to your backend folder)
   * **Build Command:** `npm install`
   * **Start Command:** `node db-server.js`
4. Add the following **Environment Variables** to your service configuration:
   * `JWT_SECRET`: A secure random string (e.g., `my-super-secret-key-12345!`).
   * `DB_HOST`: The host from your cloud database connection string.
   * `DB_NAME`: The database name.
   * `DB_USER`: The database username.
   * `DB_PASSWORD`: The database password.
   * `DB_PORT`: `5432` (default for PostgreSQL).
5. Once deployed, copy your backend's public URL (e.g., `https://schedule-builder-backend.onrender.com`).

> [!IMPORTANT]
> Because your backend server's `db-server.js` already includes wide-open CORS headers (`Access-Control-Allow-Origin: *`), your GitHub Pages frontend will be able to query this server without CORS blocking.

---

### Step 3: Configure your Frontend Scripts
By default, your frontend detects if you are on `localhost` or `file://` to make API calls to local port `3000`. If you deploy the frontend separately, it will try to make requests to `your-github-username.github.io/api`, which will fail.

You need to update the `API_BASE` detection logic to point directly to your deployed backend URL.

Modify the `API_BASE` block in the following files:
* `frontend/scripts/setup.js`
* `frontend/scripts/auth.js`
* `frontend/scripts/profile.js`

#### Update the code in these files from this:
```javascript
const API_BASE = (() => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  if (protocol === 'file:' || hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3000/api';
  }
  // In Kubernetes/production, use same hostname with /api path
  const port = window.location.port ? ':' + window.location.port : '';
  return `${protocol}//${hostname}${port}/api`;
})();
```

#### To this (Hybrid Model Support):
```javascript
const API_BASE = (() => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  if (protocol === 'file:' || hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3000/api';
  }
  
  // 🌟 If hosted on GitHub Pages, route requests to your deployed backend!
  if (hostname.includes('github.io')) {
    return 'https://YOUR-BACKEND-SERVICE-URL.onrender.com/api'; // 👈 Replace with your actual Render/Railway URL
  }
  
  // Default fallback (Kubernetes / colocated domains)
  const port = window.location.port ? ':' + window.location.port : '';
  return `${protocol}//${hostname}${port}/api`;
})();
```

---

### Step 4: Deploy Frontend to GitHub Pages
1. Push your updated code to your GitHub Repository.
2. In your GitHub repository:
   * Go to **Settings** -> **Pages**.
   * Under **Build and deployment**, select **Deploy from a branch**.
   * Choose your main branch (e.g., `main` or `master`) and select `/ (root)` folder.
   * Click **Save**.
3. In a few minutes, your site will be live at `https://your-github-username.github.io/builder/` (or whatever your repository name is).

> [!WARNING]
> Since the pages are hosted in a subdirectory (e.g. `/builder/pages/home.html`), ensure that the relative paths inside your links (like `href="../index.html"`) are correct. Fortunately, your codebase is already designed with solid relative paths (`../index.html`, `../frontend/css/main.css`) which prevents broken assets!

---

## 4. 🌐 Option B: Single-Server Custom Domain (Simplest & Best for Custom Domains)

If you want to buy a custom domain (e.g. `my-schedule-builder.com`) and have **both** the frontend and the API hosted under this single domain without setting up complex Kubernetes clusters, you can host your application as a **Monolith** on a single cloud Web Service (like Render, Railway, or a VPS).

In this setup, your Node.js/Express server is updated to serve your static frontend files in addition to handling API requests.

### Step 1: Update `backend/db-server.js` to Serve Frontend
Add these few lines to your server code right before `app.use(express.json())` (around line 69) to instruct Express to serve static assets when someone visits the main root path:

```javascript
// Serve frontend static assets from the parent directory
app.use(express.static(path.join(__dirname, '../')));

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});
```

### Step 2: Deploy the Full Repository
Deploy the **entire repository** (not just the backend folder) as a single Node.js Web Service on **Render** or **Railway**.
* **Root Directory:** (Leave empty/blank so it defaults to the root of the repo)
* **Build Command:** `cd backend && npm install`
* **Start Command:** `cd backend && node db-server.js`

### Step 3: Point Your Custom Domain
1. In your Cloud Provider settings (e.g., Render), find the **Custom Domains** section.
2. Add your custom domain (e.g., `my-schedule-builder.com`).
3. Point your domain registrar (GoDaddy, Namecheap, Google Domains) to the provider's CNAME/A records as instructed.

*🎉 That's it! When users visit `my-schedule-builder.com`, they see the frontend, and the API requests resolve natively to `my-schedule-builder.com/api` without any cross-domain CORS issues.*

---

## 5. 🐳 Option C: Containerized Kubernetes Ingress (Advanced Production Model)

Your repository already includes a root `Dockerfile` (using Nginx) and a `backend/Dockerfile` (using Node.js), as well as a `k8s` directory. This is designed for standard containerized deployment.

Under this architecture, you use a Kubernetes Ingress Controller (like Nginx Ingress or Traefik) to route incoming traffic under your custom domain to the appropriate pods:

```
[Incoming Request] ──► [K8s Ingress Controller (Domain: scheduler.com)]
                           │
                           ├──► Path "/" ──────► [Nginx Frontend Service] (Port 80)
                           │
                           └──► Path "/api" ───► [Node Express Service] (Port 3000)
```

### Step-by-Step K8s Custom Domain Mapping:
1. **Build and Push Docker Images:**
   Build your container images and push them to a container registry (Docker Hub, GitHub Container Registry, AWS ECR):
   ```bash
   docker build -t your-registry/frontend:latest .
   docker build -t your-registry/backend:latest ./backend
   docker push your-registry/frontend:latest
   docker push your-registry/backend:latest
   ```
2. **Deploy to Cluster:**
   Apply your deployment YAMLs (located in `k8s/` or created in previous steps) to deploy your pods, services, and PostgreSQL instance.
3. **Configure Ingress Rules:**
   Create an Ingress resource mapped to your custom domain. Your ingress controller will route `/` traffic to your Nginx static frontend pod, and `/api` requests to the Express backend pod.
   
   *Example `ingress.yaml` Configuration:*
   ```yaml
   apiVersion: networking.k8s.io/v1
   kind: Ingress
   metadata:
     name: scheduler-ingress
     annotations:
       kubernetes.io/ingress.class: nginx
       nginx.ingress.kubernetes.io/ssl-redirect: "true"
   spec:
     rules:
     - host: scheduler.com  # 👈 Your Custom Domain
       http:
         paths:
         - path: /api
           pathType: Prefix
           backend:
             service:
               name: backend-service
               port:
                 number: 3000
         - path: /
           pathType: Prefix
           backend:
             service:
               name: frontend-service
               port:
                 number: 80
   ```
4. **Configure DNS:**
   Point your domain's A record in your DNS provider (Cloudflare, AWS Route 53, etc.) to the **External IP of your Kubernetes Load Balancer.**

---

## 6. 📋 Pre-Deployment Checklist

Before taking the application live, make sure to check off these critical items:

- [ ] **JWT Secret Security:** Change the default fallback secret in `db-server.js` or `.env` to a highly secure cryptographically random key.
- [ ] **Disable Test Credentials:** Remove any default user credentials (like `admin@gmail.com` fallback logic or mock profiles) that are only meant for local testing.
- [ ] **HTTPS Encryption:** Make sure your backend API and frontend are both loaded over `HTTPS` to avoid "Mixed Content" security blocks.
- [ ] **Database Connection Pool Limits:** For free-tier databases (like Neon), configure the maximum pool connections in your settings to avoid hitting service connection limits during heavy usage.
- [ ] **Environment Variable Verification:** Verify that the backend is reading from process environment variables, not local `.env` files in production.
