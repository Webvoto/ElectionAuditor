namespace Webvoto.ElectionAuditor.Site.Configuration;

public static class ConfigurationStartup {

	public static void AddAppConfiguration(this IServiceCollection services, IConfiguration configuration) {

		services.Configure<AppConfig>(configuration.GetSection("General"));
	}
}
