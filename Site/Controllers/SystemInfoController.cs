using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Webvoto.ElectionAuditor.Site.Controllers;

[ApiController]
[Route("api/system")]
public class SystemInfoController : ControllerBase {

	public class SystemInfo {

		public string? ProductName { get; set; }

		public string? ProductVersion { get; set; }
	}

	[AllowAnonymous]
	[HttpGet("info")]
	public SystemInfo GetSystemInfo() => new() {
		ProductName = "Webvoto Election Auditor",
		ProductVersion = GetType().Assembly.GetName().Version?.ToString(),
	};
}
