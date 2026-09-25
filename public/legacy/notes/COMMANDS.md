## PostgreSQL
- docker build -t jjtschooldlsud/builder-postgres:v3.1.1 -f backend/sql/Dockerfile backend/sql
- docker push jjtschooldlsud/builder-postgres:v3.1.1

## Backend
- docker build -t jjtschooldlsud/builder-backend:v3.1.4 -f backend/Dockerfile backend
- docker push jjtschooldlsud/builder-backend:v3.1.4

## Frontend
- docker build -t jjtschooldlsud/builder-frontend:v3.2.3 -f Dockerfile .
- docker push jjtschooldlsud/builder-frontend:v3.2.3

## Apply Configurations
- kubectl apply -f k8s/secret.yaml
- kubectl apply -f k8s/configmap.yaml
- kubectl apply -f k8s/versions.yaml

## Apply Database
- kubectl apply -f k8s/postgres-pv.yaml
- kubectl apply -f k8s/postgres-pvc.yaml
- kubectl apply -f k8s/postgres.yaml
- kubectl apply -f k8s/postgres-service.yaml

## Apply Backend API
- kubectl apply -f k8s/backend.yaml
- kubectl apply -f k8s/backend-service.yaml

## Apply Frontend Web
- kubectl apply -f k8s/frontend.yaml
- kubectl apply -f k8s/frontend-service.yaml

## Verify Deployments
- kubectl get pods
- kubectl get svc
- kubectl get pvc

## Restart
- kubectl rollout restart deployment/frontend-deployment
- kubectl rollout restart deployment/backend-deployment
- kubectl rollout restart deployment/postgres-deployment

## Restart Status
- kubectl rollout status deployment/frontend-deployment
- kubectl rollout status deployment/backend-deployment
- kubectl rollout status deployment/postgres-deployment

## Delete Deployments, SVCs, PV/PVCs, Secret and ConfigMap
- kubectl delete deployment frontend-deployment
- kubectl delete deployment backend-deployment
- kubectl delete deployment postgres-deployment

- kubectl delete svc frontend-lb-service
- kubectl delete svc backend-service
- kubectl delete svc postgres-service

- kubectl delete pvc postgres-pvc
- kubectl delete pv postgres-pv

- kubectl delete secret sched-builder-secret
- kubectl delete configmap sched-builder-config