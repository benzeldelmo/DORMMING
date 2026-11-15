#!/bin/sh
# Builds one runnable jar with the React app inside (the same thing the Dockerfile does, without Docker).
# Then:  java -jar backend/target/backend-0.0.1-SNAPSHOT.jar   and open http://localhost:8080
set -e
cd "$(dirname "$0")/.."
(cd frontend && npm ci && npm run build)
rm -rf backend/src/main/resources/static
cp -R frontend/dist backend/src/main/resources/static
(cd backend && mvn -q package -DskipTests)
rm -rf backend/src/main/resources/static
echo "Built backend/target/backend-0.0.1-SNAPSHOT.jar"
