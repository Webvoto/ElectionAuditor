export interface ReceiptModel {
	session: string;
	memberIdentifier: string;
	memberName: string;
	votedQuestions: VotedQuestionModel[];
	authentication: string;
}

export interface VotedQuestionModel {
	name: string;
	date: Date;
	checkCode: string;
}
