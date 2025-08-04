$ErrorActionPreference = "Stop"

function Write-Log($s) {
	Write-Host ""
	Write-Host -ForegroundColor Green (">>> {0}" -f $s)
	Write-Host ""
}

function Check-ExitCode($errorMessage) {
	if ($LASTEXITCODE -ne 0) {
		throw $errorMessage
	}
}

try {

	#
	# Initialization
	#
	Write-Log "Initializing ..."
	if (Test-Path ".\Webvoto.ElectionAuditor.Api.*.nupkg") {
		Remove-Item ".\Webvoto.ElectionAuditor.Api.*.nupkg"
	}

	#
	# Restore nuget packages
	#
	Write-Log "Restoring nuget packages ..."
	& dotnet restore "..\Api\Webvoto.ElectionAuditor.Api.csproj"
	Check-ExitCode "An error occurred while restoring the nuget packages"

	#
	# Build & pack
	#
	Write-Log "Building and packing class library ..."
	& dotnet pack "..\Api\Webvoto.ElectionAuditor.Api.csproj" --configuration Release
	Check-ExitCode "An error occurred while building the class library"
	Move-Item ..\Api\bin\Release\*.nupkg .

	#
	# End
	#
	Write-Log "Done."

} catch {

	Write-Host -ForegroundColor Red ("FATAL: An unhandled exception has occurred`n{0}`n{1}" -f $_.Exception, $_.ScriptStackTrace)
	
}
