using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System.Collections.Concurrent;
using System.Text;
using Webvoto.ElectionAuditor.Site.Configuration;

namespace Webvoto.ElectionAuditor.Site.Services {
	
	public abstract class RepositoryBase(

		IOptions<AppConfig> appConfig

	) {
		private static readonly Encoding JsonEncoding = Encoding.UTF8;

		protected IOptions<AppConfig> AppConfig => appConfig;

		private readonly ConcurrentDictionary<string, object> fileLocks = new();

		protected FileInfo GetFile(params string[] path) {
			return new FileInfo(Path.Combine([AppConfig.Value.StoragePath, .. path]));
		}

		protected object GetFileLock(FileInfo file) => fileLocks.GetOrAdd(file.FullName, _ => new object());

		protected T? ReadFileAs<T>(FileInfo file) {
			var json = File.ReadAllText(file.FullName, JsonEncoding);
			return JsonConvert.DeserializeObject<T>(json);
		}

		protected T? ReadFileIfExistsAs<T>(FileInfo file)
			=> file.Exists ? ReadFileAs<T>(file) : default(T);

		protected void WriteFile(FileInfo file, object value) {
			var json = JsonConvert.SerializeObject(value);
			if (!file.Directory!.Exists) {
				file.Directory.Create();
			}
			File.WriteAllText(file.FullName, json);
		}
	}
}
