export interface SessionModel {
	id: string;
	name: string;
	url: string;
	documentAuthenticationPublicKey: string;
	questions: QuestionModel[];
	sessionLabel: string;
	questionSetLabel: string;
	identifierLabel: string;
	secondaryIdentifierLabel: string | null;
	declarantIdentifierLabel: string | null;
	memberLabel: string;
	timeZone: string;
}

export interface QuestionModel {
	code: string;
	name: string;
}
