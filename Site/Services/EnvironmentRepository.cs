using Microsoft.Extensions.Options;
using Webvoto.ElectionAuditor.Site.Configuration;

namespace Webvoto.ElectionAuditor.Site.Services;

public class EnvironmentRepository(

	IOptions<AppConfig> appConfig

) : RepositoryBase(

	appConfig

) {
	private List<string>? cache;

	public void SeedEnvironmentUrl(string url) {
		var envsFile = getEnvironmentUrlsFile();
		lock (GetFileLock(envsFile)) {
			var envs = readEnvironmentUrls(envsFile);
			if (!envs.Contains(url)) {
				envs.Add(url);
			}
			envs.Sort();
			WriteFile(envsFile, envs);
			cache = envs;
		}
	}

	public List<string> ListEnvironmentsUrls() {
		cache ??= readEnvironmentUrls();
		return cache;
	}

	private List<string> readEnvironmentUrls(FileInfo? envsFile = null) => [
		.. AppConfig.Value.GetEnvironments(),
		.. ReadFileIfExistsAs<List<string>>(envsFile ?? getEnvironmentUrlsFile()) ?? []
	];

	private FileInfo getEnvironmentUrlsFile()
		=> GetFile("environment-urls.json");
}
