# Database Configuration
DB_CONTAINER_NAME=budgie_db
DB_NAME=mydb
DB_VOLUME_NAME=budgie_data
DB_USER=myuser
DB_PASSWORD=mypassword
DB_PORT=5432
TEST_DB_PORT=5433

INTEGRATION_TEST_DB_NAME=budgie_test_db
PRISMA_SCHEMA_PATH=src/shared/prisma/schema.prisma

.PHONY: help run-db setup-db db-remove-data prisma-gui run-integration-test-db remove-integration-test-db backup-db-data restore-db-data

.DEFAULT_GOAL := help

help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Database Management:"
	@echo "  run-db                     Start database container."
	@echo "  setup-db                   Set up database schema (generate client, run migrations)."
	@echo "  stop-db                    Stop and remove the database container."
	@echo "  remove-db-data             Remove the database data volume."
	@echo "  prisma-gui                 Open Prisma Studio GUI."
	@echo ""
	@echo "Testing:"
	@echo "  run-integration-test-db    (Manual) Start the integration test database."
	@echo "  stop-integration-test-db   (Manual) Stop and remove the test database."
	@echo ""
	@echo "Backup & Restore:"
	@echo "  backup-db-data         Back up the database data volume."
	@echo "  restore-db-data        Restore the database from a backup."
	@echo ""
	@echo "How to restore the database:"
	@echo "  1. Ensure the database container is running (make run-db)"
	@echo "  2. Run: make restore-db-data"
	@echo "  3. Confirm when prompted"
	@echo "  Note: The database will be dropped and recreated from backup"

# Development Database
run-db:
	@echo "Starting PostgreSQL container..."
	docker run --name $(DB_CONTAINER_NAME) \
		-e POSTGRES_USER=$(DB_USER) \
		-e POSTGRES_PASSWORD=$(DB_PASSWORD) \
		-e POSTGRES_DB=$(DB_NAME) \
		-p $(DB_PORT):5432 \
		-v $(DB_VOLUME_NAME):/var/lib/postgresql/data \
		-d postgres

setup-db:
	@echo "Setting up database schema..."
	npx prisma generate --schema=$(PRISMA_SCHEMA_PATH)
	npx prisma migrate dev --name init --schema=$(PRISMA_SCHEMA_PATH)

# Cleanup Commands
stop-db:
	@echo "Stopping and removing $(DB_CONTAINER_NAME) container..."
	-docker container stop $(DB_CONTAINER_NAME)
	-docker container rm $(DB_CONTAINER_NAME)

remove-db-data:
	@echo 'WARNING: This will permanently delete the database volume: $(DB_VOLUME_NAME).'
	@printf "Are you sure you want to continue? [y/N] "; \
	read REPLY; \
	case $$REPLY in \
		[yY]) \
			echo "Removing persistent data volume..."; \
			docker volume rm $(DB_VOLUME_NAME) || true; \
			;; \
		*) \
			echo "Aborted."; \
			;; \
	esac

# Development Tools
prisma-gui:
	npx prisma studio --schema=$(PRISMA_SCHEMA_PATH)

run-integration-test-db:
	@echo "Starting test database container..."
	docker run --name $(INTEGRATION_TEST_DB_NAME) \
		-e POSTGRES_USER=$(DB_USER) \
		-e POSTGRES_PASSWORD=$(DB_PASSWORD) \
		-e POSTGRES_DB=$(INTEGRATION_TEST_DB_NAME) \
		-p $(TEST_DB_PORT):5432 \
		-d postgres

stop-integration-test-db:
	@echo "Stopping and removing $(INTEGRATION_TEST_DB_NAME) container..."
	-docker container stop $(INTEGRATION_TEST_DB_NAME)
	-docker container rm $(INTEGRATION_TEST_DB_NAME)


# Backup & Restore
backup-db-data:
	@echo "Backing up database using pg_dump..."
	@BACKUP_FILE="budgie_backup_$(shell date +%Y-%m-%d_%H-%M-%S).dump"; \
	echo "Creating backup: $$BACKUP_FILE"; \
	docker exec $(DB_CONTAINER_NAME) pg_dump -U $(DB_USER) -Fc -d $(DB_NAME) > $$BACKUP_FILE && \
	echo "Backup completed successfully: $$BACKUP_FILE"

restore-db-data:
	@echo "Restoring database from latest backup..."
	@LATEST_BACKUP=$(shell ls -t budgie_backup_*.dump 2>/dev/null | head -n 1); \
	if [ -z "$$LATEST_BACKUP" ]; then \
		echo "Error: No backup file found."; \
		exit 1; \
	fi; \
	echo "Using backup file: $$LATEST_BACKUP"; \
	echo "WARNING: This will drop and recreate the database."; \
	printf "Are you sure you want to continue? [y/N] "; \
	read REPLY; \
	case $$REPLY in \
		[yY]) \
			echo "Terminating active connections to database..."; \
			docker exec $(DB_CONTAINER_NAME) psql -U $(DB_USER) -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$(DB_NAME)' AND pid <> pg_backend_pid();"; \
			echo "Dropping existing database..."; \
			docker exec $(DB_CONTAINER_NAME) psql -U $(DB_USER) -d postgres -c "DROP DATABASE IF EXISTS $(DB_NAME);"; \
			echo "Creating fresh database..."; \
			docker exec $(DB_CONTAINER_NAME) psql -U $(DB_USER) -d postgres -c "CREATE DATABASE $(DB_NAME);"; \
			echo "Restoring from backup..."; \
			docker exec -i $(DB_CONTAINER_NAME) pg_restore -U $(DB_USER) -d $(DB_NAME) --clean --if-exists -v < $$LATEST_BACKUP && \
			echo "Restore completed successfully."; \
			;; \
		*) \
			echo "Aborted."; \
			;; \
	esac
