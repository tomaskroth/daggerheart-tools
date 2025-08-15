FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/dhsrd-0.1.0.jar app.jar
COPY src/main/resources/application.yml .
ENV JAVA_OPTS=""
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]