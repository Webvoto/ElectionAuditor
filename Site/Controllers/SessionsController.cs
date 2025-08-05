using Microsoft.AspNetCore.Mvc;
using SimpleBase;
using Webvoto.ElectionAuditor.Api;
using Webvoto.ElectionAuditor.Site.Services;

namespace Webvoto.ElectionAuditor.Site.Controllers;

[ApiController]
[Route("api/sessions")]
public class SessionsController(

	SessionRepository sessionRepository
	
) {
	[HttpGet("{idEncoded}")]
	public SessionModel? Get(string idEncoded) {
		return tryDecodeBase32Guid(idEncoded, out var id)
			? sessionRepository.Get(id)
			: null;
	}

	private static bool tryDecodeBase32Guid(string s, out Guid guid) {

		ArgumentNullException.ThrowIfNull(s);

		guid = default;

		byte[] bytes;
		try {
			bytes = Base32.Rfc4648.Decode(s);
		} catch {
			return false;
		}

		if (bytes.Length != 16) {
			return false;
		}

		guid = new Guid(bytes);
		return true;
	}
}
