cd "$(dirname "$0")/.." || exit 1

PATTERN='gsk_[A-Za-z0-9]{20,}|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.|mongodb(\+srv)?://[^:/ ]+:[^@ ]+@[^ ]+|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----|sb_secret_[A-Za-z0-9_-]+|service_role'

echo "Scanning files..."
if grep -rEn "$PATTERN" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=__pycache__ --exclude-dir=scripts --exclude=.env.example --exclude=README.md --exclude=SECURITY.md --exclude=docker-compose.yml; then
  echo "POSSIBLE SECRETS FOUND"
  found=1
fi

if [ -d .git ]; then
  echo "Scanning git history..."
  if git log -p --all | grep -En "$PATTERN"; then
    echo "POSSIBLE SECRETS IN GIT HISTORY"
    found=1
  fi
  if git ls-files | grep -E '(^|/)\.env($|\.)' | grep -v '\.env\.example$'; then
    echo ".env FILE IS TRACKED BY GIT"
    found=1
  fi
else
  echo "No git repository here yet, history check skipped."
fi

if [ -n "$found" ]; then exit 1; fi
echo "No secrets found."
