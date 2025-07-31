$ErrorActionPreference = "Stop"

$packageName = "electionauditor"
$dockerContainerRegistryFullName = "webvotocontainers.azurecr.io"
$dockerContainerRegistrySubscription = "Webvoto - PayAsYouGo"

$optionYes = New-Object System.Management.Automation.Host.ChoiceDescription "&Yes", "Yes"
$optionCancel = New-Object System.Management.Automation.Host.ChoiceDescription "&Cancel", "Cancel"
$optionsYesCancel = [System.Management.Automation.Host.ChoiceDescription[]]($optionYes, $optionCancel)

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

function Get-DockerImages($repository) {
	$images = @()
	docker image ls --format "{{.Tag}}\t{{.CreatedAt}}\t{{.CreatedSince}}" $repository | ForEach-Object {
		$fields = $_.Split("`t")
		$images += [pscustomobject]@{
			Tag = $fields[0]
			CreatedAt = $fields[1]
			CreatedSince = $fields[2]
		}
	}
	return $images
}

try {

	#
	# Find image
	#
	Write-Log "Locating image ..."
	$repository = "$dockerContainerRegistryFullName/$($packageName)"
	$images = Get-DockerImages $repository
	$latestImage = $images | Sort-Object CreatedAt -Descending | Select-Object -First 1
	if (-not $latestImage) {
		throw "No image found for repository $repository"
	}
	$imageName = "$($repository):$($latestImage.Tag)"
	Write-Log "Image located: $imageName created $($latestImage.CreatedSince)"

	#
	# Test image
	#
	Write-Log "Testing Docker image ..."
	docker run $imageName --
	Assert-SuccessExitCode "Image test failed"

	#
	# Confirm
	#
	$choice = $host.ui.PromptForChoice('Confirmation', "Ready to upload $imageName, continue?", $optionsYesCancel, 0)
	if ($choice -ne 0) {
		Write-Warning "User cancelled the operation"
		exit 1
	}

	#
	# Select subscription
	#
	Write-Log "Selecting subscrition ..."
	az account set --subscription $dockerContainerRegistrySubscription
	Assert-SuccessExitCode "Failed to set the Azure Subscription. Try running 'az login'"

	#
	# Refresh login
	#
	Write-Log "Refreshing Azure Container Registry authentication ..."
	az acr login --name $dockerContainerRegistryFullName.Replace(".azurecr.io", "")
	Assert-SuccessExitCode "Failed to refresh the Azure Container Registry token. Try running 'az login'"

	#
	# Push image
	#
	Write-Log "Pushing image ..."
	docker push $imageName
	Assert-SuccessExitCode "Failed to push the image"

	#
	# End
	#
	Write-Log "Done."

} catch {

	Write-Host -ForegroundColor Red ("FATAL: An unhandled exception has occurred`n{0}`n{1}" -f $_.Exception, $_.ScriptStackTrace)
	
}
