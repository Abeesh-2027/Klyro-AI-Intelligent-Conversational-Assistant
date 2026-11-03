cd "$(dirname "$0")/.." || exit 1

echo "Python dependencies"
(cd backend && pip-audit -r requirements.txt)

echo "Python code"
(cd backend && bandit -r app -q)

echo "Frontend dependencies"
(cd frontend && npm audit --omit=dev)

echo "Secrets"
sh scripts/scan-secrets.sh
