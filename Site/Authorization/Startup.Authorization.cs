using Microsoft.AspNetCore.Authorization;

namespace Webvoto.ElectionAuditor.Site.Authorization;

public static class AuthorizationStartup {

	public static void AddAppAuthorization(this IServiceCollection services) {

		var authenticatedPolicy = new AuthorizationPolicyBuilder()
			.RequireAuthenticatedUser()
			.Build();

		services.AddAuthorization(options => {
			options.DefaultPolicy = authenticatedPolicy;
		});
	}
}
