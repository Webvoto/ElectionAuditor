import { VotedQuestionModel } from "./question";

export interface ReceiptModel {
	session: string;
	memberIdentifier: string;
	memberName: string;
	votedQuestions: VotedQuestionModel[];
	authentication: string;
}
