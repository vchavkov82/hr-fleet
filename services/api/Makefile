.PHONY: build run test lint docker-build

build:
	go build -o bin/server ./cmd/server

run:
	go run ./cmd/server

test:
	go test ./...

lint:
	golangci-lint run ./...

docker-build:
	podman build -t hr-api:latest .
