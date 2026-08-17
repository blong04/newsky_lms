# ---------- Build stage ----------
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Cache dependency layer riêng - chỉ tải lại khi pom.xml đổi
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source và build
COPY src ./src
RUN mvn clean package -DskipTests

# ---------- Runtime stage ----------
FROM eclipse-temurin:17-jre
WORKDIR /app

# Tải RDS global bundle cert (public, không nhạy cảm) và convert sang truststore
ADD https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem /app/global-bundle.pem
RUN keytool -importcert -alias rds-ca \
    -file /app/global-bundle.pem \
    -keystore /app/rds-truststore.jks \
    -storepass changeit -noprompt

# Tạo user riêng, không chạy bằng root
RUN useradd -m appuser
USER appuser

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
CMD ["java", "-Djava.net.preferIPv4Stack=true", "-jar", "app.jar"]
