#!/usr/bin/env bash
# API smoke test against a running dev server. Usage: bash scripts/smoke-api.sh [base_url]
B="${1:-http://localhost:3000}/api"
j() { curl -s -m 30 -H 'content-type: application/json' "$@" | head -c "${LEN:-220}"; echo; }

echo "== health";        j "$B/health"
echo "== signup";        j -X POST "$B/userSignUp" -d '{"user_Email":"smoke@test.com","user_Name":"Smoke","country_code":"+91","mobile_no":"9876543210","password":"Passw0rd!","confirmPassword":"Passw0rd!"}'
echo "== signup dup";    j -X POST "$B/userSignUp" -d '{"user_Email":"smoke@test.com","user_Name":"Smoke","country_code":"+91","mobile_no":"9876543210","password":"Passw0rd!","confirmPassword":"Passw0rd!"}'
echo "== login";         LEN=120 j -X POST "$B/userLogin" -d '{"user_Email":"smoke@test.com","password":"Passw0rd!"}'
echo "== bad login";     j -X POST "$B/userLogin" -d '{"user_Email":"smoke@test.com","password":"nope"}'
echo "== sip calc";      j -X POST "$B/sipCalculator" -d '{"monthlyInvestment":1000,"annualInterestRate":12,"years":10}'
printf '%%PDF-1.4 smoke' > /tmp/smoke.pdf
echo "== home loan (multipart)"
curl -s -m 30 -X POST "$B/loanOfferDetail" -F fullName=Ravi -F dateOfBirth=1990-01-01 -F address=Indore -F contactNumber=9999999999 -F loanAmount=500000 -F "panCard=@/tmp/smoke.pdf;type=application/pdf" | head -c 600; echo
echo "== leads without token (expect 401)"; j "$B/getHomeLoan"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@probiz.com}"; ADMIN_PASSWORD="${ADMIN_PASSWORD:-Admin@12345}"
TOKEN=$(curl -s -m 30 -H 'content-type: application/json' -X POST "$B/adminLogin" -d "{\"admin_Email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')
A=(-H "Authorization: Bearer $TOKEN")
echo "== home loan list (admin)"; LEN=300 j "${A[@]}" "$B/getHomeLoan"
echo "== users (admin)";          LEN=300 j "${A[@]}" "$B/getAllUsers"
echo "== overview (admin)";       LEN=300 j "${A[@]}" "$B/admin/overview"
echo "== unknown route";  j "$B/nope"
