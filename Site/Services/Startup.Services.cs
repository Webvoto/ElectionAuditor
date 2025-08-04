namespace Webvoto.ElectionAuditor.Site.Services;

public static class Startup {

	public static void AddAppServices(this IServiceCollection services) {

		services.AddSingleton<EnvironmentRepository>();
		services.AddSingleton<SessionRepository>();
		services.AddHostedService<EnvironmentMonitoringService>();
		services.AddTransient<EnvironmentMonitor>();
	}
}
