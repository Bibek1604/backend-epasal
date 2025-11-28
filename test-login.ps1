# Test Login Endpoint
Write-Host "🧪 Testing Login Endpoint..." -ForegroundColor Cyan
Write-Host ""

$uri = "http://localhost:5000/api/v1/auth/login"
$body = @{
    email = "admin@epasaley.com"
    password = "ePasaley@SecureAdmin2025!"
} | ConvertTo-Json

Write-Host "📤 Sending Request:" -ForegroundColor Yellow
Write-Host "URL: POST $uri"
Write-Host "Body: $body"
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri $uri -Method Post -Headers @{"Content-Type"="application/json"} -Body $body -ErrorAction Stop
    
    Write-Host "✅ SUCCESS - Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ""
    Write-Host "📥 Response:" -ForegroundColor Cyan
    $json = $response.Content | ConvertFrom-Json
    $json | ConvertTo-Json -Depth 10 | Write-Host
    
    # Extract token
    Write-Host ""
    Write-Host "🔐 TOKEN:" -ForegroundColor Green
    Write-Host $json.data.token
    
} catch {
    Write-Host "❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host ""
        Write-Host "Error Details:" -ForegroundColor Yellow
        $_.ErrorDetails.Message | ConvertFrom-Json | ConvertTo-Json -Depth 5 | Write-Host
    }
}
