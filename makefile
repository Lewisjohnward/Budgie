.DEFAULT_GOAL := help

.PHONY: help \
        validate validate-backend validate-frontend \
        test test-backend test-frontend test-e2e \
        typecheck typecheck-backend typecheck-frontend

help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Validation:"
	@echo "  validate             Run all validation checks."
	@echo "  validate-backend     Validate the backend."
	@echo "  validate-frontend    Validate the frontend."
	@echo ""
	@echo "Testing:"
	@echo "  test                 Run all tests, including E2E."
	@echo "  test-backend         Run backend unit and integration tests."
	@echo "  test-frontend        Run frontend unit and integration tests."
	@echo "  test-e2e             Run E2E tests."
	@echo ""
	@echo "Type Checking:"
	@echo "  typecheck            Typecheck backend and frontend."
	@echo "  typecheck-backend    Typecheck backend."
	@echo "  typecheck-frontend   Typecheck frontend."

# Tests
test: test-backend test-frontend test-e2e

test-backend:
	cd backend && npm run test:unit && npm run test:integration

test-frontend:
	cd frontend && npm run test:unit && npm run test:integration

test-e2e:
	cd e2e && npm test

# Type Checking
typecheck: typecheck-backend typecheck-frontend

typecheck-backend:
	cd backend && npm run typecheck

typecheck-frontend:
	cd frontend && npm run typecheck

# Validation
validate: typecheck test

validate-backend: typecheck-backend test-backend

validate-frontend: typecheck-frontend test-frontend
