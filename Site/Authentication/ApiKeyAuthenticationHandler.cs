using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text.Encodings.Web;
using Webvoto.ElectionAuditor.Site.Configuration;

namespace Webvoto.ElectionAuditor.Site.Authentication;

public static class ApiKeyAuthenticationConstants {
	public const string Scheme = "ApiKey";
}

public static class ApiKeyAuthenticationExtensions {

	public static AuthenticationBuilder AddApiKey(this AuthenticationBuilder authBuilder, Action<AuthenticationSchemeOptions>? configureOptions = null) {
		configureOptions ??= options => { };
		authBuilder.AddScheme<AuthenticationSchemeOptions, ApiKeyAuthenticationHandler>(ApiKeyAuthenticationConstants.Scheme, configureOptions);
		return authBuilder;
	}
}

public class ApiKeyAuthenticationHandler(

	IOptionsMonitor<AuthenticationSchemeOptions> options,
	ILoggerFactory logger,
	UrlEncoder encoder,
	IOptions<AppConfig> appConfig

) : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder) {
	protected override Task<AuthenticateResult> HandleAuthenticateAsync() {
		return Task.FromResult(handleAuthenticateAsync());
	}

	private AuthenticateResult handleAuthenticateAsync() {

		var authorizationHeaderRaw = Request.Headers.Authorization.FirstOrDefault();

		if (string.IsNullOrEmpty(authorizationHeaderRaw)) {
			return AuthenticateResult.NoResult();
		}

		if (!AuthenticationHeaderValue.TryParse(authorizationHeaderRaw, out var authorizationHeader)) {
			return AuthenticateResult.NoResult();
		}

		if (authorizationHeader.Scheme != ApiKeyAuthenticationConstants.Scheme) {
			return AuthenticateResult.NoResult();
		}

		if (authorizationHeader.Parameter?.Equals(appConfig.Value.SharedApiKey) != true) {
			return AuthenticateResult.Fail("Invalid API key");
		}

		var identity = new ClaimsIdentity(ApiKeyAuthenticationConstants.Scheme);
		var ticket = new AuthenticationTicket(new ClaimsPrincipal([identity]), ApiKeyAuthenticationConstants.Scheme);
		return AuthenticateResult.Success(ticket);
	}
}
