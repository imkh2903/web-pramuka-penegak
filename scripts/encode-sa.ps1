Param(
    [Parameter(Mandatory=$false)]
    [string]$Path = "service-account.json"
)
if (-not (Test-Path -LiteralPath $Path)) {
    Write-Error "File not found: $Path"
    exit 1
}
$raw = Get-Content -Raw -LiteralPath $Path
$bytes = [System.Text.Encoding]::UTF8.GetBytes($raw)
$enc = [Convert]::ToBase64String($bytes)
$dest = "$Path.base64"
Set-Content -NoNewline -LiteralPath $dest -Value $enc
Write-Output "Wrote $dest"
Write-Output "Use the contents of $dest as the value for GOOGLE_SERVICE_ACCOUNT_JSON in your CI/CD secrets."