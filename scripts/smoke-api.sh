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
echo "== home loan list"; LEN=300 j "$B/getHomeLoan"
echo "== users";          LEN=300 j "$B/getAllUsers"
echo "== dashboard";      j "$B/getCountForDashboard"
echo "== unknown route";  j "$B/nope"
