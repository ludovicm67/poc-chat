.PHONY: run-server
run-server:
	cd server && mix run --no-halt

.PHONY: run-dev-server
run-dev-server:
	cd server && iex -S mix

