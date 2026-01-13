using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Webvoto.ElectionAuditor.Site.Classes;

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
		ProductName = Constants.ProductName,
		ProductVersion = Util.GetProductVersion(),
	};
}
