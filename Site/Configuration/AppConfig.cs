namespace Webvoto.ElectionAuditor.Site.Configuration;

public class AppConfig {

	public string? SharedApiKey { get; set; }

	public string? Environments { get; set; }

	public List<string> GetEnvironments()
		=> [.. (Environments ?? string.Empty).Split(",", StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)];

	public TimeSpan EnvironmentMonitorPeriod { get; set; } = TimeSpan.FromMinutes(5);

	public TimeSpan EnvironmentMonitorRetryDelay { get; set; } = TimeSpan.FromMinutes(1);

	public string StoragePath { get; set; } = "/data";
}
