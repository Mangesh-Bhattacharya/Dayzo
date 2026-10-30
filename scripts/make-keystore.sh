#!/usr/bin/env bash
# Creates your own Android signing key. KEEP THE FILE AND PASSWORD SAFE: every future update must be signed with the same key.
set -euo pipefail
OUT="${1:-dayzo-release.keystore}"
read -r -s -p "Choose a keystore password (min 6 chars): " PW; echo
keytool -genkeypair -v -keystore "$OUT" -storetype PKCS12 -alias dayzo -keyalg RSA -keysize 4096 -validity 36500 \
  -storepass "$PW" -keypass "$PW" -dname "CN=Dayzo, O=Dayzo"
echo
echo "Created $OUT. For GitHub Actions add these repository secrets (Settings > Secrets and variables > Actions):"
echo "  DAYZO_KEYSTORE_B64      = $(base64 -w0 "$OUT" | cut -c1-24)...   (run: base64 -w0 $OUT)"
echo "  DAYZO_KEYSTORE_PASSWORD = the password you just typed"
echo "  DAYZO_KEY_ALIAS         = dayzo"
echo "  DAYZO_KEY_PASSWORD      = the same password"
