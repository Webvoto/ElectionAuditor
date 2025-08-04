using Microsoft.Extensions.Options;
using System.Collections.Concurrent;
using Webvoto.ElectionAuditor.Api;
using Webvoto.ElectionAuditor.Site.Configuration;

namespace Webvoto.ElectionAuditor.Site.Services;
public class SessionRepository(

	IOptions<AppConfig> appConfig

) : RepositoryBase(

	appConfig

) {
	private readonly ConcurrentDictionary<Guid, SessionModel?> cache = new();

	public SessionModel? Get(Guid id) {
		if (cache.TryGetValue(id, out var model)) {
			return model;
		} else {
			model = ReadFileIfExistsAs<SessionModel>(getSessionFile(id));
			updateCache(id, model);
			return model;
		}
	}

	public void AddOrUpdate(SessionModel model) {
		var sessionFile = getSessionFile(model.Id);
		lock (GetFileLock(sessionFile)) {
			WriteFile(sessionFile, model);
		}
		updateCache(model.Id, model);
	}

	private void updateCache(Guid id, SessionModel? model) {
		cache.AddOrUpdate(id, model, (_, _) => model);
	}

	private FileInfo getSessionFile(Guid id) => GetFile("sessions", $"{id}.json");
}
