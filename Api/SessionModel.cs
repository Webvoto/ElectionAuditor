using System.Collections.Generic;

namespace Webvoto.ElectionAuditor.Api {
	
	public class SessionModel {

		public string Code { get; set; }

		public string Name { get; set; }

		public string DocumentAuthenticationPublicKey { get; set; }

		public List<QuestionModel> Questions { get; set; }
	}
}
