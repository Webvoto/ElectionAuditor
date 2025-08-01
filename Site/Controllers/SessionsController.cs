using Microsoft.AspNetCore.Mvc;
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
			Code = "ASSORD25",
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
			Code = "SESORD2_25",
			Name = "Sessão ordinária-II 2025",
			Questions = [],
			DocumentAuthenticationPublicKey = DocumentAuthenticationPublicKey,
			SessionLabel = SessionLabels.Session,
			QuestionSetLabel = QuestionSetLabels.Questions,
			IdentifierLabel = IdentifierLabels.CpfOrCnpj,
			MemberLabel = MemberLabels.Associate,
		},
		new SessionModel {
			Code = "RECAD",
			Name = "Recadastramento",
			Questions = [],
			DocumentAuthenticationPublicKey = DocumentAuthenticationPublicKey,
			SessionLabel = SessionLabels.Consultation,
			QuestionSetLabel = QuestionSetLabels.Questions,
			IdentifierLabel = IdentifierLabels.CpfOrCnpj,
			MemberLabel = MemberLabels.Member,
		},
	];

	[HttpGet("{code}")]
	public SessionModel? Get(string code) {
		return Sessions.FirstOrDefault(s => s.Code.Equals(code, StringComparison.InvariantCultureIgnoreCase));
	}
}
