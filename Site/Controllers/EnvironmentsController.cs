using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Webvoto.ElectionAuditor.Api;
using Webvoto.ElectionAuditor.Site.Services;

namespace Webvoto.ElectionAuditor.Site.Controllers;

[Route("api/environments")]
[ApiController]
public class EnvironmentsController(

	EnvironmentRepository environmentRepository,
	EnvironmentMonitoringService environmentMonitoringService

) : ControllerBase {

	[Authorize]
	[HttpPut]
	public IActionResult Put(PutEnvironmentRequest request) {
		environmentRepository.SeedEnvironmentUrl(request.Url);
		environmentMonitoringService.AddOrUpdateEnvironment(request.Url);
		return Ok();
	}
}
