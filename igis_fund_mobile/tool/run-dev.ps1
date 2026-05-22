param(
    [string] $DeviceId,
    [string] $ConfigPath = 'config\supabase.local.json'
)

if (-not (Test-Path $ConfigPath)) {
    throw "Missing $ConfigPath. Copy config\supabase.example.json to config\supabase.local.json and fill local values."
}

$args = @('run', "--dart-define-from-file=$ConfigPath")
if ($DeviceId) {
    $args += @('-d', $DeviceId)
}

& "$PSScriptRoot\flutter.ps1" @args
exit $LASTEXITCODE
