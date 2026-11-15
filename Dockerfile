# DormMing in one container: the React app is built, packed into the Spring Boot jar, and served
# from the same address as the API. Build:  docker build -t dormming .
# Run:  docker run -p 8080:8080 -e LOCAL_JWT_SECRET=<32+ random characters> -e REQUIRE_HTTPS=true dormming

# 1. Build the React app
FROM node:22-alpine AS web
WORKDIR /web
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# 2. Build the Spring Boot jar with the app inside it
FROM maven:3.9-eclipse-temurin-21 AS api
WORKDIR /api
COPY backend/pom.xml ./
RUN mvn -q dependency:go-offline
COPY backend/src ./src
COPY --from=web /web/dist ./src/main/resources/static
RUN mvn -q package -DskipTests

# 3. Run it
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=api /api/target/*.jar app.jar
# No demo accounts in a real deploy (their password is public). Set DORMMING_SEED=true for a class demo.
ENV PORT=8080 DORMMING_SEED=false REQUIRE_HTTPS=true
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
