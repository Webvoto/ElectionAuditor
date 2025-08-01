import { IdentifierLabels, MemberLabels, QuestionSetLabels, SessionLabels } from "./enums";
import { QuestionModel } from "./question";

export interface SessionModel {
	code: string;
	name: string;
	documentAuthenticationPublicKey: string;
	questions: QuestionModel[];
	sessionLabel: SessionLabels;
	questionSetLabel: QuestionSetLabels;
	identifierLabel: IdentifierLabels;
	memberLabel: MemberLabels;
}
