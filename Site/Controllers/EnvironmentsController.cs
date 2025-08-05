using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Webvoto.ElectionAuditor.Api;
using Webvoto.ElectionAuditor.Site.Services;

namespace Webvoto.ElectionAuditor.Site.Controllers;

[Route("api/environments")]
[ApiController]
public class EnvironmentsController(

	EnvironmentRepository environmentRepository,
	EnvironmentMonitoringService environmentMonitoringService,
	ILogger<EnvironmentsController> logger

) : ControllerBase {

	[Authorize]
	[HttpPut]
	public IActionResult Put(PutEnvironmentRequest request) {
		logger.LogInformation("Received environment PUT: {EnvironmentUrl}", request.Url);
		environmentRepository.SeedEnvironmentUrl(request.Url);
		environmentMonitoringService.AddOrUpdateEnvironment(request.Url);
		return Ok();
	}
}
