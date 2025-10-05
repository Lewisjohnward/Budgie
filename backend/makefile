# Database Configuration
DB_NAME=budgie_db
DB_VOLUME_NAME=budgie_data
DB_USER=myuser
DB_PASSWORD=mypassword
DB_PORT=5432
TEST_DB_PORT=5433

INTEGRATION_TEST_DB_NAME=budgie_test_db
PRISMA_SCHEMA_PATH=src/shared/prisma/schema.prisma

.PHONY: help run-db setup-db db-remove db-remove-data wipe-db-reset-be prisma-gui run-integration-test-db remove-integration-test-db test-integration backup-pgdata restore-pgdata start-be-db-with-restore

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
	@echo "  backup-budgie-data         Back up the database data volume."
	@echo "  restore-budgie-data        Restore the database from a backup."
	@echo ""
	@echo "How to restore the database:"
	@echo "  1. Stop the backend"
	@echo "  2. Stop the database"
	@echo "  3. Remove the database data volume"
	@echo "  4. Restore the database"
	@echo "  5. Start the database"
	@echo "  6. Start the backend"

# Development Database
run-db:
	@echo "Starting PostgreSQL container..."
	docker run --name $(DB_NAME) \
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
	@echo "Stopping and removing $(DB_NAME) container..."
	-docker container stop $(DB_NAME)
	-docker container rm $(DB_NAME)

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
backup-budgie-data:
	@echo "Backing up db data..."
	@BACKUP_FILE="budgie_backup_$(shell date +%Y-%m-%d_%H-%M-%S).tar.gz"; \
	echo "Creating backup: $$BACKUP_FILE"; \
	docker run --rm \
	  -v $(DB_VOLUME_NAME):/volume \
	  -v $(shell pwd):/backup \
	  alpine \
	  tar czf /backup/$$BACKUP_FILE -C /volume .

restore-budgie-data:
	@echo "Restoring db data from latest backup..."
	@LATEST_BACKUP=$(shell ls -t budgie_backup_*.tar.gz 2>/dev/null | head -n 1); \
	if [ -z "$$LATEST_BACKUP" ]; then \
		echo "Error: No backup file found."; \
		exit 1; \
	fi; \
	echo "Using backup file: $$LATEST_BACKUP"; \
	docker volume create $(DB_VOLUME_NAME); \
	docker run --rm \
	  -v $(DB_VOLUME_NAME):/volume \
	  -v $(shell pwd):/backup \
	  alpine \
	  sh -c "cd /volume && tar xzf /backup/$$LATEST_BACKUP"