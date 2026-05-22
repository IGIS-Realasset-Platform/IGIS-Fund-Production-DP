param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]] $FlutterArgs
)

$flutterRoot = $env:FLUTTER_HOME
if (-not $flutterRoot) {
    $flutterRoot = 'C:\Users\crusl\flutter_sdk\flutter'
}

$flutter = Join-Path $flutterRoot 'bin\flutter.bat'
if (-not (Test-Path $flutter)) {
    throw "Flutter SDK was not found at $flutter. Set FLUTTER_HOME or install Flutter first."
}

& $flutter @FlutterArgs
exit $LASTEXITCODE
