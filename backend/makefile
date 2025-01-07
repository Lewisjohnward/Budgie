
run-test:
	docker run --name postgres_test -e POSTGRES_USER=myuser -e POSTGRES_PASSWORD=mypassword -e POSTGRES_DB=mydatabase -p 5432:5432 -d postgres
	npx prisma generate --schema=src/prisma/schema.prisma
	npx prisma migrate dev --name init --schema=src/prisma/schema.prisma
	jest --detectOpenHandles || true
	docker container stop postgres_test
	docker container rm postgres_test
	printenv GDK_SCALE


run-db:
	docker run --name my_postgres -e POSTGRES_USER=myuser -e POSTGRES_PASSWORD=mypassword -e POSTGRES_DB=mydatabase -p 5432:5432 -v pgdata:/var/lib/postgresql/data -d postgres


setup-db:
	docker run --name my_postgres -e POSTGRES_USER=myuser -e POSTGRES_PASSWORD=mypassword -e POSTGRES_DB=mydatabase -p 5432:5432 -v pgdata:/var/lib/postgresql/data -d postgres
	npx prisma generate --schema=src/prisma/schema.prisma
	npx prisma migrate dev --name init --schema=src/prisma/schema.prisma

db-remove:
	docker container stop my_postgres
	docker container remove my_postgres
	
db-remove-data:
	docker volume rm pgdata

wipe-db-reset-be: db-remove db-remove-data setup-db 
	npm run start

prisma-gui:
	npx prisma studio --schema=src/prisma/schema.prisma


# prisma-create-tables:
	# npx prisma migrate dev --name init
	# npx prisma migrate dev --name init --schema=src/prisma/schema.prisma
