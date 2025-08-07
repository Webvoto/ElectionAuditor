using System;
using System.Collections.Generic;

namespace Webvoto.ElectionAuditor.Api {
	
	public class SessionModel {

		public Guid Id { get; set; }

		public string Name { get; set; }

		public string Url { get; set; }

		public byte[] DocumentAuthenticationPublicKey { get; set; }

		public string SessionLabel { get; set; }

		public string QuestionSetLabel { get; set; }

		public string IdentifierLabel { get; set; }

		public string MemberLabel { get; set; }

		public string TimeZone { get; set; }

		public List<QuestionModel> Questions { get; set; }
	}
}
