# Kubernetes (K8s) — Feature Documentation

## Overview
Kubernetes manifests deploy the frontend (static web), backend (Express API), and PostgreSQL database with Services for connectivity. The setup is designed for a simple single-namespace deployment, representing the "Production Model" (Option C) for ASB.

## Key Files & Locations
- **Deployments:**
  - `k8s/frontend.yaml`
  - `k8s/backend.yaml`
  - `k8s/postgres.yaml`
- **Services:**
  - `k8s/frontend-service.yaml`
  - `k8s/backend-service.yaml`
  - `k8s/postgres-service.yaml`
- **Configuration & Storage:**
  - `k8s/configmap.yaml`
  - `k8s/secret.yaml`
  - `k8s/postgres-pv.yaml`
  - `k8s/postgres-pvc.yaml`
- **Reverse Proxy:**
  - `k8s/nginx.conf` (Used by the frontend container for API routing)

## Features
- **Frontend Container**
  - Deployment exposes port 80.
  - LoadBalancer Service exposes the UI externally.
  - Configured with resource limits and HTTP liveness/readiness probes on `/`.
- **Backend Container**
  - Deployment exposes port 3000.
  - LoadBalancer Service exposes the API externally.
  - Reads variables from ConfigMap (`NODE_ENV`, `DB_HOST`, etc.) and Secret (`DB_PASSWORD`, `JWT_SECRET`).
  - Liveness/Readiness probe on `/api/programs`.
- **PostgreSQL Database**
  - Deployment exposes port 5432 internally.
  - Uses `hostPath` PersistentVolume for storage persistence.
  - TCP liveness checks on port 5432.

## Dependencies
- **Docker Images**: Requires pre-built Docker images for the frontend, backend, and a SQL initialization image.
- **Initial Setup**: The Postgres DB is seeded via `backend/sql/*.sql` scripts on initialization.

## TODOs & Known Limitations
- **Secrets Management**: `k8s/secret.yaml` contains raw base64-encoded credentials. In a real production cluster, use an external Secret Manager, HashiCorp Vault, or Sealed Secrets.
- **Service Exposure (Ingress)**: Exposing both frontend and backend as `LoadBalancer` types is costly and redundant. Transition to `ClusterIP` and use an Ingress Controller.
- **Storage Portability**: The current `hostPath` PV binds data to a specific node, making it unsuitable for managed multi-node clusters (like EKS, GKE, AKS). Transition to dynamic volume provisioning (e.g., AWS EBS or GCP Persistent Disk).
- **App URL Resolution**: The frontend ConfigMap sets `APP_URL` to localhost; update this to the actual domain name before deployment.
