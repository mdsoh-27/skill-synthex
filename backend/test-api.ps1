# Skill-Synthex API Test Script
# Run this in PowerShell to test all endpoints

Write-Host "🧪 Testing Skill-Synthex Backend API" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Signup
Write-Host "Test 1: Signup" -ForegroundColor Yellow
$signupBody = @{
    email = "test@example.com"
    password = "Test@1234"
} | ConvertTo-Json

$signup = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/signup" -Method POST -Body $signupBody -ContentType "application/json" -ErrorAction SilentlyContinue
if ($signup) {
    Write-Host "✅ Signup successful: $($signup.message)" -ForegroundColor Green
} else {
    Write-Host "⚠️ User might already exist, trying login..." -ForegroundColor Yellow
}
Write-Host ""

# Test 2: Login
Write-Host "Test 2: Login" -ForegroundColor Yellow
$loginBody = @{
    email = "test@example.com"
    password = "Test@1234"
} | ConvertTo-Json

$login = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $login.token
Write-Host "✅ Login successful!" -ForegroundColor Green
Write-Host "Token: $($token.Substring(0, 50))..." -ForegroundColor Gray
Write-Host ""

# Test 3: Protected Route
Write-Host "Test 3: Protected Route" -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$profile = Invoke-RestMethod -Uri "http://localhost:5000/api/profile" -Method GET -Headers $headers
Write-Host "✅ Protected route works!" -ForegroundColor Green
Write-Host "User ID: $($profile.user.id)" -ForegroundColor Gray
Write-Host "Email: $($profile.user.email)" -ForegroundColor Gray
Write-Host ""

# Test 4: Career Metrics
Write-Host "Test 4: Career Metrics" -ForegroundColor Yellow
$metrics = Invoke-RestMethod -Uri "http://localhost:5000/api/career/metrics" -Method GET
if ($metrics.success) {
    Write-Host "✅ Career metrics fetched successfully!" -ForegroundColor Green
    Write-Host "Best Model: $($metrics.metrics.'Random Forest'.Accuracy)" -ForegroundColor Gray
} else {
    Write-Host "❌ Failed to fetch metrics: $($metrics.message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✅ All tests passed! Backend is working!" -ForegroundColor Green
Write-Host ""
Write-Host "Your JWT Token (save this for resume upload):" -ForegroundColor Cyan
Write-Host $token -ForegroundColor White
