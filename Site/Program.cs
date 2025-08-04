using System.Reflection;
using System.Text.Json.Serialization;
using Webvoto.ElectionAuditor.Site.Authentication;
using Webvoto.ElectionAuditor.Site.Authorization;
using Webvoto.ElectionAuditor.Site.Configuration;
using Webvoto.ElectionAuditor.Site.Services;

namespace Webvoto.ElectionAuditor.Site;

public class Program {

	public static void Main(string[] args) {

		if (args.Contains("--")) {
			Console.WriteLine($"Webvoto Election Auditor version {Assembly.GetEntryAssembly()!.GetName().Version}");
			return;
		}

		var builder = WebApplication.CreateBuilder(args);

		configureServices(builder.Services, builder.Configuration);

		var app = builder.Build();

		configure(app);

		run(app);
	}

	private static void configureServices(IServiceCollection services, IConfiguration configuration) {

		services.AddHttpClient();

		services.AddAppConfiguration(configuration);

		services.AddAppServices();

		services.AddAppAuthentication();

		services.AddAppAuthorization();

		services.AddControllers().AddJsonOptions(options => {
			options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
		});
		
		services.AddSpaStaticFiles(spaStaticFiles => {
			spaStaticFiles.RootPath = "ClientApp/dist/election-auditor-client-app/browser";
		});
	}

	private static void configure(WebApplication app) {

		var env = app.Services.GetRequiredService<IWebHostEnvironment>();

		app.UseSpaStaticFiles();

		app.UseRouting();

		app.UseAuthentication();

		app.UseAuthorization();

#pragma warning disable ASP0014 // Suggest using top level route registrations (simply calling `app.MapControllers()` is currently causing issues)

		app.UseEndpoints(endpoints => {
			endpoints.MapControllers();
		});

#pragma warning restore ASP0014 // Suggest using top level route registrations

		app.UseSpa(spa => {
			if (env.IsDevelopment()) {
				spa.UseProxyToSpaDevelopmentServer($"http://localhost:4212");
			}
		});
	}

	private static void run(WebApplication app) {

		var logger = app.Services.GetRequiredService<ILogger<Program>>();

		logger.LogInformation("Starting application");

		app.Run();
	}
}
