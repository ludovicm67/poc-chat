.PHONY: run-server
run-server:
	cd server && mix run --no-halt

.PHONY: run-dev-server
run-dev-server:
	cd server && iex -S mix

.PHONY: run-nodejs-client
run-nodejs-client:
	node client/nodejs/client.js
