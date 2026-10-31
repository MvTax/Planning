#!/bin/sh
# Usage : ./bump.sh 2026-11-01.1 "Ce qui a changé"
sed -i "s/const APP_VERSION='[^']*'/const APP_VERSION='$1'/" index.html
printf '{"v":"%s","notes":"%s"}\n' "$1" "$2" > version.json
