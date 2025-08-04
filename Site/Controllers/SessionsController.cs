using Microsoft.AspNetCore.Mvc;
using SimpleBase;
using Webvoto.ElectionAuditor.Api;

namespace Webvoto.ElectionAuditor.Site.Controllers;

[ApiController]
[Route("api/sessions")]
public class SessionsController : ControllerBase {

	private static readonly string DocumentAuthenticationPublicKey = @"-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE4kwmCjwj+SAmpT/CfZixVeuspujw
CVJPYMohxdSVZpfs2bZlO3aeRouDcxJi70F9T7FNDyDFLgJVByuhIGTFQA==
-----END PUBLIC KEY-----";

	private static readonly List<SessionModel> Sessions = [
		new SessionModel {
			Id = new Guid("A2933FF1-FFEC-4B06-AE12-F318A2AE1557"),
			Name = "Assembléia ordinária-I 2025",
			Questions = [
				new QuestionModel { Code = "APR_CNT", Name = "Aprovação da prestação de contas 2024" },
				new QuestionModel { Code = "ELE_DIR", Name = "Eleição da diretoria 2025" },
			],
			DocumentAuthenticationPublicKey = DocumentAuthenticationPublicKey,
			SessionLabel = SessionLabels.Assembly,
			QuestionSetLabel = QuestionSetLabels.Questions,
			IdentifierLabel = IdentifierLabels.CpfOrCnpj,
			MemberLabel = MemberLabels.Member,
		},
		new SessionModel {
			Id = new Guid("5DF9ED94-E356-460B-8A83-61FB672F73A1"),
			Name = "Sessão ordinária-II 2025",
			Questions = [],
			DocumentAuthenticationPublicKey = DocumentAuthenticationPublicKey,
			SessionLabel = SessionLabels.Session,
			QuestionSetLabel = QuestionSetLabels.Questions,
			IdentifierLabel = IdentifierLabels.CpfOrCnpj,
			MemberLabel = "Associado",
		},
		new SessionModel {
			Id = new Guid("99F6337D-C4CC-4E69-859C-E9B31019856A"),
			Name = "Recadastramento",
			Questions = [],
			DocumentAuthenticationPublicKey = DocumentAuthenticationPublicKey,
			SessionLabel = SessionLabels.Consultation,
			QuestionSetLabel = QuestionSetLabels.Questions,
			IdentifierLabel = IdentifierLabels.CpfOrCnpj,
			MemberLabel = MemberLabels.Member,
		},
	];

	[HttpGet("{idEncoded}")]
	public SessionModel? Get(string idEncoded) {
		return tryDecodeBase32Guid(idEncoded, out var id)
			? Sessions.FirstOrDefault(s => s.Id == id)
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
