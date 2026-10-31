#!/bin/sh
# Publie une nouvelle version : ./bump.sh "Ce qui a changé (une phrase, visible dans l'app)"
# Le numéro est généré automatiquement : AAAA-MM-JJ.HHMM (heure de Paris).
set -e
V=$(TZ=Europe/Paris date +%Y-%m-%d.%H%M)
NOTES=$(printf '%s' "$1" | sed 's/"/\\"/g')
sed -i "s/const APP_VERSION='[^']*'/const APP_VERSION='$V'/" js/reglages.js
sed -i -E "s#(js/[a-z]+\.js|css/style\.css)(\?v=[^\"]*)?\"#\1?v=$V\"#g" index.html
printf '{"v":"%s","notes":"%s"}\n' "$V" "$NOTES" > version.json
echo "Version $V"
