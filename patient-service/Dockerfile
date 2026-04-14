FROM eclipse-temurin:21-jdk-jammy

WORKDIR /app

COPY pom.xml .
COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn
COPY src ./src

RUN ./mvnw clean package -DskipTests

EXPOSE 8082

CMD ["java", "-jar", "target/*.jar"]