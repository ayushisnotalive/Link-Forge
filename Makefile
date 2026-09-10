.PHONY: dev up down logs test clean

# Start all services
dev:
	docker-compose up -d postgres redis rabbitmq
	cd packages/api && npm run dev &
	cd packages/web && npm run dev &
	cd packages/analytics-service && mvn spring-boot:run &

# Start everything in Docker
up:
	docker-compose up -d

# Stop everything
down:
	docker-compose down

# View logs
logs:
	docker-compose logs -f

# Run all tests
test:
	cd packages/api && npm test
	cd packages/analytics-service && mvn test
	cd packages/web && npm test

# Clean everything (including volumes)
clean:
	docker-compose down -v