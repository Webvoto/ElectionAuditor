import { QuestionModel } from "./question";

export interface SessionModel {
	id: string;
	name: string;
	documentAuthenticationPublicKey: string;
	questions: QuestionModel[];
	sessionLabel: string;
	questionSetLabel: string;
	identifierLabel: string;
	memberLabel: string;
}
