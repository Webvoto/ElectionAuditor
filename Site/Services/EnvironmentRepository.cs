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
		url = normalizeUrl(url);
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
		cache ??= readEnvironmentUrls(getEnvironmentUrlsFile());
		return cache;
	}

	private List<string> readEnvironmentUrls(FileInfo envsFile) =>
		((List<string>)[
			.. AppConfig.Value.GetEnvironments(),
			.. ReadFileIfExistsAs<List<string>>(envsFile) ?? []
		])
		.Select(normalizeUrl)
		.Distinct()
		.ToList();

	private FileInfo getEnvironmentUrlsFile()
		=> GetFile("environment-urls.json");

	private string normalizeUrl(string url) => new Uri(url).AbsoluteUri;
}
