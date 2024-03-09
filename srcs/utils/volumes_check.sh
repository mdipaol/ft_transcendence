#!/bin/bash

if ! [ -d srcs/volumes/postgres ]; then
	mkdir -p srcs/volumes/postgres;
fi

if ! [ -d srcs/volumes/static ]; then
	mkdir -p srcs/volumes/static;
fi