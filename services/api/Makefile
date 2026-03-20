.PHONY: api worker dev swagger generate-keys sqlc test test-race lint docker-build

api:
	go build -o bin/server ./cmd/server

worker:
	go build -o bin/worker ./cmd/worker

dev:
	go run ./cmd/server --mode=both

swagger:
	swag init -g cmd/server/main.go -o docs/

generate-keys:
	openssl genrsa -out jwt-private.pem 4096
	openssl rsa -in jwt-private.pem -pubout -out jwt-public.pem
	@echo "Keys generated: jwt-private.pem, jwt-public.pem"

sqlc:
	sqlc generate

test:
	go test ./... -short -count=1

test-race:
	go test -race ./... -short -count=1

test-coverage:
	go test ./... -short -count=1 -coverprofile=coverage.out -covermode=atomic
	go tool cover -html=coverage.out -o coverage.html
	@go tool cover -func=coverage.out | tail -1

test-coverage-report:
	@go tool cover -func=coverage.out | tail -1

lint:
	golangci-lint run ./...

docker-build:
	podman build -t hr-api:latest .
