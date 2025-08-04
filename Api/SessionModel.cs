using System;
using System.Collections.Generic;

namespace Webvoto.ElectionAuditor.Api {
	
	public class SessionModel {

		public Guid Id { get; set; }

		public string Name { get; set; }

		public string DocumentAuthenticationPublicKey { get; set; }

		public SessionLabels SessionLabel { get; set; }

		public QuestionSetLabels QuestionSetLabel { get; set; }

		public IdentifierLabels IdentifierLabel { get; set; }

		public MemberLabels MemberLabel { get; set; }

		public List<QuestionModel> Questions { get; set; }
	}
}
