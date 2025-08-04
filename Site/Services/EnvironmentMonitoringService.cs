using System.Collections.Concurrent;

namespace Webvoto.ElectionAuditor.Site.Services;

public class EnvironmentMonitoringService(

	ILogger<EnvironmentMonitoringService> logger,
	EnvironmentRepository environmentRepository,
	IServiceProvider serviceProvider

) : IHostedService {

	private readonly CancellationTokenSource cancellationTokenSource = new();
	private readonly ConcurrentDictionary<string, EnvironmentMonitor> monitors = new();

	public Task StartAsync(CancellationToken _) {

		var environments = environmentRepository.ListEnvironmentsUrls();

		foreach (var url in environments) {
			monitors.GetOrAdd(url, startMonitor); // will actually add
		}

		logger.LogInformation("Monitoring {EnvironmentCount} environments: {Environments}", environments.Count, string.Join(", ", environments));
		return Task.CompletedTask;
	}

	private EnvironmentMonitor startMonitor(string url) {
		var monitor = serviceProvider.GetRequiredService<EnvironmentMonitor>();
		monitor.Start(url, cancellationTokenSource.Token);
		return monitor;
	}

	public async Task StopAsync(CancellationToken cancellationToken) {
		logger.LogInformation("Environment monitoring stopping ...");
		cancellationTokenSource.Cancel();
		await Task.WhenAll(monitors.Values.Select(m => m.GetTask()));
		logger.LogInformation("Environment monitoring stopped");
	}

	public void AddOrUpdateEnvironment(string url) {
		monitors.GetOrAdd(url, startMonitor).NotifyChange();
	}
}
