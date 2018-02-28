.PHONY: setup
setup:
	cd client/nodejs && npm install
	protoc --js_out=import_style=commonjs,binary:./client/nodejs messages.proto
	cd server && mix deps.get

.PHONY: run-server
run-server:
	@cd server && mix run --no-halt

.PHONY: run-dev-server
run-dev-server:
	@cd server && iex -S mix

.PHONY: run-nodejs-client
run-nodejs-client:
	@node client/nodejs/client.js
