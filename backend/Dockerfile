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

# Tải RDS regional bundle cert (chỉ vài cert cần thiết cho ap-southeast-1, nhanh hơn global bundle)
ADD https://truststore.pki.rds.amazonaws.com/ap-southeast-1/ap-southeast-1-bundle.pem /app/rds-bundle.pem
RUN awk 'split_after==1{n++;split_after=0} /-----END CERTIFICATE-----/{split_after=1} {print > "/tmp/cert" n ".pem"}' /app/rds-bundle.pem && \
    for cert in /tmp/cert*.pem; do \
        keytool -importcert -alias "rds-ca-$(basename "$cert" .pem)" \
            -file "$cert" \
            -keystore /app/rds-truststore.jks \
            -storepass changeit -noprompt; \
    done

# Tạo user riêng, không chạy bằng root
RUN useradd -m appuser
USER appuser

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
CMD ["java", "-Djava.net.preferIPv4Stack=true", "-Dnetworkaddress.cache.ttl=30", "-Dsun.net.inetaddr.ttl=30", "-jar", "app.jar"]
