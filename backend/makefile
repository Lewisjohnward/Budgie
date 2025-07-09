# Database Configuration
DB_NAME=mydatabase
DB_USER=myuser
DB_PASSWORD=mypassword
DB_PORT=5432
TEST_DB_PORT=5433

# Development Database
run-db:
	@echo "Starting PostgreSQL container..."
	docker run --name my_postgres \
		-e POSTGRES_USER=$(DB_USER) \
		-e POSTGRES_PASSWORD=$(DB_PASSWORD) \
		-e POSTGRES_DB=$(DB_NAME) \
		-p $(DB_PORT):5432 \
		-v pgdata:/var/lib/postgresql/data \
		-d postgres

setup-db: run-db
	@echo "Setting up database schema..."
	npx prisma generate --schema=src/prisma/schema.prisma
	npx prisma migrate dev --name init --schema=src/prisma/schema.prisma

# Cleanup Commands
db-remove:
	@echo "Stopping and removing PostgreSQL container..."
	-docker container stop my_postgres
	-docker container rm my_postgres

db-remove-data:
	@echo "Removing persistent data volume..."
	-docker volume rm pgdata

# Complete Reset
wipe-db-reset-be: db-remove db-remove-data setup-db
	npm run dev

# Development Tools
prisma-gui:
	npx prisma studio --schema=src/shared/prisma/schema.prisma

# Integration Testing
run-integration-test-db:
	@echo "Starting test database container..."
	docker run --name postgres_test \
		-e POSTGRES_USER=user \
		-e POSTGRES_PASSWORD=password \
		-e POSTGRES_DB=app_test \
		-p $(TEST_DB_PORT):5432 \
		-d postgres

remove-integration-test-db:
	@echo "Stopping and removing integration test PostgreSQL container..."
	-docker container stop postgres_test
	-docker container rm postgres_test

backup-pgdata:
	@echo "Backing up db data"
	docker run --rm \
	  -v pgdata:/volume \
	  -v $(shell pwd):/backup \
	  alpine \
	  tar czf /backup/pgdata_backup.tar.gz -C /volume .

restore-pgdata:
	@echo "Restoring db data"
	docker volume create pgdata
	docker run --rm \
	  -v pgdata:/volume \
	  -v $(shell pwd):/backup \
	  alpine \
	  sh -c "cd /volume && tar xzf /backup/pgdata_backup.tar.gz"

start-be-db-with-restore: db-remove restore-pgdata run-db
	@echo "Database started with restored data"
	npm run dev
