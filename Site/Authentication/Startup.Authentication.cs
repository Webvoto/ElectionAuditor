using Microsoft.AspNetCore.Authentication;

namespace Webvoto.ElectionAuditor.Site.Authentication;

public static class AuthenticationStartup {

	public static void AddAppAuthentication(this IServiceCollection services) {

		services.AddAuthentication().AddApiKey();
	}
}
