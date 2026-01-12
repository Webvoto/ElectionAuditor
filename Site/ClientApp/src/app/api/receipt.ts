import { DateTime } from 'luxon';

export interface ReceiptModel {
	session: string;
	memberIdentifier: string;
	memberName: string;
	votedQuestions: VotedQuestionModel[];
	authentication: string;
}

export interface VotedQuestionModel {
	name: string;
	date: DateTime;
	votes?: string;
	checkCode: string;
}
