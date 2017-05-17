#!/bin/bash -e

main() {
	echo "Installing rsync"
	sudo apt-get update

	sudo apt-get install rsync
	echo "rsync  successfully installed"
}

main
