namespace Webvoto.ElectionAuditor.Api {
	public enum SessionLabels {
		Session = 1,
		Assembly,
		Election,
		Elections,
		Consultation,
	}

	public enum QuestionSetLabels {
		Questions = 1,
		Elections,
		Consultations,
		Voting,
		Agenda,
		AgendaItems,
		Topics,
	}

	public enum IdentifierLabels {
		Cpf = 1,
		Cnpj,
		Number,
		CpfOrCnpj,
		OrganizationNumber,
		RegistrationNumber,
	}

	public enum MemberLabels {
		Member = 1,
		Elector,
		Participant,
		Associate,
		Creditor,
	}
}
