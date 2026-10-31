#!/bin/sh
# Publie une nouvelle version : ./bump.sh "Ce qui a changé (une phrase, visible dans l'app)"
# Numéro : AAAA-MM-JJ.HHMM (heure de Paris), toujours plus grand que le précédent.
set -e
V=$(TZ=Europe/Paris node -e '
const fs=require("fs");const cur=(fs.readFileSync("js/reglages.js","utf8").match(/const APP_VERSION=.([^\x27]+)/)||[])[1]||"0";
const d=new Date(),p=n=>String(n).padStart(2,"0");let v=`${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}.${p(d.getHours())}${p(d.getMinutes())}`;
const newer=(a,b)=>a.localeCompare(b,"en",{numeric:true})>0;
if(!newer(v,cur)){const [base,n]=cur.split(".");v=`${base}.${(parseInt(n||"0",10)+1)}`}
process.stdout.write(v)')
NOTES=$(printf '%s' "$1" | sed 's/"/\\"/g')
sed -i "s/const APP_VERSION='[^']*'/const APP_VERSION='$V'/" js/reglages.js
sed -i -E "s#(js/[a-z]+\.js|css/style\.css)(\?v=[^\"]*)?\"#\1?v=$V\"#g" index.html
printf '{"v":"%s","notes":"%s"}\n' "$V" "$NOTES" > version.json
echo "Version $V"
