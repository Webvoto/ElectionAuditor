$ErrorActionPreference = "Stop"

$projectName = "ElectionAuditor"
$moduleName = "Site"
$packageName = "electionauditor"
$dockerContainerRegistryFullName = "webvotocontainers.azurecr.io"

function Write-Log($s) {
	Write-Host ""
	Write-Host -ForegroundColor Green (">>> {0}" -f $s)
	Write-Host ""
}

function Assert-SuccessExitCode($errorMessage) {
	if ($LASTEXITCODE -ne 0) {
		throw $errorMessage
	}
}

function Convert-FileLineEndings($path) {
	# Using ReadAllBytes instead of ReadAllText to avoid encoding guessing -- we want 1-to-1 decoding and reencoding
	$raw = [System.IO.File]::ReadAllBytes($path)
	$content = [System.Text.Encoding]::Default.GetString($raw)
	# Instead of replacing CRLFs with LFs, we just remove all CRs
	$newContent = $content.Replace("`r", "")
	$newRaw = [System.Text.Encoding]::Default.GetBytes($newContent)
	[System.IO.File]::WriteAllBytes($path, $newRaw)
}

function Get-VersionTag($versionStr) {
	
	$version = $null
	if (-not [Version]::TryParse($versionStr, [ref]$version)) {
		return $versionStr
	}
	
	if ($version.Revision -eq 0) {
		return "{0}.{1}.{2}" -f $version.Major, $version.Minor, $version.Build

	} elseif (100 -lt $version.Revision -and $version.Revision -lt 200) {
		return "{0}.{1}.{2}-alpha{3:D2}" -f $version.Major, $version.Minor, $version.Build, ($version.Revision % 100)

	} elseif (200 -lt $version.Revision -and $version.Revision -lt 300) {
		return "{0}.{1}.{2}-beta{3:D2}" -f $version.Major, $version.Minor, $version.Build, ($version.Revision % 100)

	} elseif (300 -lt $version.Revision -and $version.Revision -lt 400) {
		return "{0}.{1}.{2}-rc{3:D2}" -f $version.Major, $version.Minor, $version.Build, ($version.Revision % 100)

	} elseif ($version.Revision -eq 1000) {
		return "{0}.{1}.{2}" -f $version.Major, $version.Minor, $version.Build

	} elseif (1000 -lt $version.Revision -and $version.Revision -lt 2000) {
		return "{0}.{1}.{2}-r{3:D2}" -f $version.Major, $version.Minor, $version.Build, ($version.Revision % 1000)

	} else {
		return $version.ToString();
	}
}

try {

	#
	# Initialization
	#
	$csprojPath = Resolve-Path "..\$moduleName\Webvoto.$projectName.$moduleName.csproj"
	$publishPath = Join-Path (Resolve-Path ..) "$moduleName\bin\Release\net8.0\publish"
	
	#
	# Read version
	#
	Write-Log "Determining $moduleName version ..."
	$m = (Select-String "<Version>(.*)</Version>" $csprojPath).Matches
	if (-not $m) {
		throw "Could not determine the $moduleName version"
	}
	$version = Get-VersionTag $m.Groups[1].Value
	Write-Log "Version: $version"

	#
	# Remove old files
	#
	Write-Log "Removing old files ..."
	if (Test-Path $publishPath) {
		Remove-Item $publishPath -Recurse
	}
	if (Test-Path ".\$packageName-*.zip") {
		Remove-Item ".\$packageName-*.zip"
	}
	if (Test-Path ".\$packageName-*.gz") {
		Remove-Item ".\$packageName-*.gz"
	}

	#
	# Restore nuget packages
	#
	Write-Log "Restoring nuget packages ..."
	dotnet restore $csprojPath
	Assert-SuccessExitCode "An error occurred while restoring the nuget packages"

	#
	# Build
	#
	Write-Log "Building ..."
	dotnet publish $csprojPath --configuration Release
	Assert-SuccessExitCode "An error occurred while building the project"
	# Remove development and testing settings
	Remove-Item (Join-Path $publishPath "appsettings.Development.json")
	Write-Log "Published to $publishPath"
	
	#
	# .tar.gz
	#
	Write-Log "Generating .tar.gz package ..."
	if ($IsLinux) {
		tar -czvf "$packageName-$version.tar.gz" -C $publishPath .
		Assert-SuccessExitCode "An error occurred while building the .tar.gz package"
	} else {
		$tarFile = "$packageName-$version.tar"
		7za.exe a -ttar $tarFile (Join-Path $publishPath "*")
		Assert-SuccessExitCode "An error occurred while building the .tar package"
		7za.exe a "$packageName-$version.tar.gz" $tarFile
		Assert-SuccessExitCode "An error occurred while building the .tar.gz package"
		Remove-Item $tarFile
	}

	#
	# Docker image
	#
	$dockerContextPath = (Resolve-Path "$publishPath\..").Path
	
	$imageName = "$dockerContainerRegistryFullName/$($packageName):$version"
	Write-Log "Building Docker image ..."
	
	$dockerfilePath = Join-Path $dockerContextPath "Dockerfile"
	Copy-Item "..\Docker\Dockerfile" $dockerfilePath
	Convert-FileLineEndings $dockerfilePath
	
	$sshConfigPath = Join-Path $dockerContextPath "sshd_config"
	Copy-Item "..\Docker\sshd_config" $sshConfigPath
	Convert-FileLineEndings $sshConfigPath

	$entrypointPath = Join-Path $publishPath "entrypoint.sh"
	Copy-Item "..\Docker\entrypoint.sh" $entrypointPath
	Convert-FileLineEndings $entrypointPath

	docker build -t $imageName $dockerContextPath
	Assert-SuccessExitCode "An error occurred while building the Docker image"
	Write-Log "Testing Docker image ..."
	docker run $imageName --
	Assert-SuccessExitCode "An error occurred while testing the Docker image"

	#
	# End
	#
	Write-Log "Done."

} catch {

	Write-Host -ForegroundColor Red ("FATAL: An unhandled exception has occurred`n{0}`n{1}" -f $_.Exception, $_.ScriptStackTrace)
	
}
