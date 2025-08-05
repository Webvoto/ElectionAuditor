using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System.Diagnostics;
using Webvoto.ElectionAuditor.Api;
using Webvoto.ElectionAuditor.Site.Configuration;

namespace Webvoto.ElectionAuditor.Site.Services {

	public class EnvironmentMonitor(

		IOptions<AppConfig> appConfig,
		ILogger<EnvironmentMonitor> logger,
		IHttpClientFactory httpClientFactory,
		SessionRepository sessionRepository


	) {
		private CancellationTokenSource? sleepCts;
		private string? environmentUrl;
		private Task? task;

		public void Start(string url, CancellationToken ct) {
			this.environmentUrl = url;
			this.task = Task.Run(() => monitorAsync(ct));
		}

		public Task GetTask() => task ?? throw new InvalidOperationException("This environment monitor has not been started");

		public void NotifyChange() {
			sleepCts?.Cancel();
		}

		private async Task monitorAsync(CancellationToken ct) {

			logger.LogInformation("Environment monitoring of {EnvironmentUrl} started", environmentUrl);

			try {

				while (!ct.IsCancellationRequested) {
					try {
						var success = await probeAsync(ct);
						await sleepAsync(success ? appConfig.Value.EnvironmentMonitorPeriod : appConfig.Value.EnvironmentMonitorRetryDelay, ct);
					} catch (OperationCanceledException) when (ct.IsCancellationRequested) {
						// Expected during graceful shutdown, do nothing
					}
				}
				logger.LogInformation("Environment monitoring of {EnvironmentUrl} stopped", environmentUrl);

			} catch (Exception ex) {
				logger.LogError(ex, "Environment monitoring of {EnvironmentUrl} crashed", environmentUrl);
			}
		}

		private async Task<bool> probeAsync(CancellationToken ct) {
			try {
				var httpClient = httpClientFactory.CreateClient($"EnvironmentMonitor<{environmentUrl}>");
				var sw = Stopwatch.StartNew();
				var httpResponse = await httpClient.GetAsync(new Uri(new Uri(environmentUrl!), "api/system/environment"), ct);
				httpResponse.EnsureSuccessStatusCode();
				var rawResponse = await httpResponse.Content.ReadAsStringAsync(ct);
				logger.LogDebug("Probed environment {EnvironmentUrl} in {Duration} ms, result: {ResponseBody}", environmentUrl, sw.ElapsedMilliseconds, rawResponse);
				var response = JsonConvert.DeserializeObject<EnvironmentModel>(rawResponse) ?? throw new Exception("Unexpected null response");
				if (response.Sessions != null) {
					foreach (var session in response.Sessions) {
						session.Url = environmentUrl; // override URL with the URL we are watching
						sessionRepository.AddOrUpdate(session);
					}
				}
				return true;
			} catch (Exception ex) {
				logger.LogWarning(ex, "Error probing environment {EnvironmentUrl}", environmentUrl);
				return false;
			}
		}

		private async Task sleepAsync(TimeSpan delay, CancellationToken ct) {
			sleepCts = new CancellationTokenSource();
			try {
				await Task.Delay(delay, CancellationTokenSource.CreateLinkedTokenSource(ct, sleepCts.Token).Token);
			} catch (OperationCanceledException) when (sleepCts.Token.IsCancellationRequested) {
				logger.LogDebug("Received change notification for environment {EnvironmentUrl}", environmentUrl);
			}
		}
	}
}
