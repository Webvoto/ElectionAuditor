import { QuestionModel } from "./question";

export interface SessionModel {
	code: string;
	name: string;
	documentAuthenticationPublicKey: string;
	questions: QuestionModel[];
}
