import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Constants } from '../../classes/constants';
import { PropComponent } from '../common/prop/prop.component';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../services/session.service';
import { VotedQuestionModel } from '../../api/question';
import { ReceiptModel } from '../../api/receipt';
import { SessionModel } from '../../api/session';
import { MatDividerModule } from '@angular/material/divider';
import base32 from 'hi-base32';

@Component({
	selector: 'app-voting-receipt-validator',
	standalone: true,
	imports: [
		CommonModule,
		PropComponent,
		MatDividerModule
	],
	templateUrl: './voting-receipt-validator.component.html',
	styleUrls: ['./voting-receipt-validator.component.scss']
})
export class VotingReceiptValidatorComponent {

	receipt: ReceiptModel | null = null;
	session: SessionModel | null = null;

	constructor(
		private readonly route: ActivatedRoute,
		private readonly sessionService: SessionService,

	) {
		this.processRouteData();
	}

	
	async processRouteData() {
		const data = this.route.snapshot.paramMap.get('data');

		if (!data) {
			return;
		}

		const parts = data.split(Constants.QRCodeFieldSeparator);
		if (parts.length < 5) {
			return;
		}

		const sessionCode = this.decodeQRCodeCodeField(parts[1]);
		this.session = await this.sessionService.get(sessionCode.toLowerCase());

		const questionFields = parts.slice(4, parts.length - 1);

		this.receipt = {
			session: this.session?.name ?? sessionCode,
			memberIdentifier: parts[2],
			memberName: this.decodeQRCodeStringField(parts[3]),
			votedQuestions: this.parseQuestions(questionFields),
			authentication: parts[parts.length - 1]
		};
	}

	private parseQuestions(fields: string[]) {
		const questions: VotedQuestionModel[] = [];
		const groupSize = 3;

		for (let i = 0; i < fields.length; i += groupSize) {
			const [code, date, checkCode] = fields.slice(i, i + groupSize);
			const decodedCode = this.decodeQRCodeCodeField(code);
			const question = this.getQuestion(decodedCode);
			questions.push({
				name: question?.name ?? decodedCode,
				date: this.decodeQRCodeDateField(date),
				checkCode
			});
		}

		return questions;
	}

	private getQuestion(code: string) {
		return this.session?.questions.find(q => q.code == code);
	}

	private decodeQRCodeStringField(value: string | null) {
		return value?.replaceAll(Constants.QRCodeSpaceStringEncoding, ' ') ?? '';
	}

	private decodeQRCodeCodeField(value: string | null) {
		return value?.replaceAll(Constants.QRCodeUnderscoreCodeEncoding, '_') ?? '';
	}

	private decodeQRCodeBinaryField(field: string) {
		try {
			const bytes = base32.decode.asBytes(field);
			return new TextDecoder().decode(Uint8Array.from(bytes));
		} catch {
			console.error('Error decoding binary field:', field);
			return '';
		}
	}

	private decodeQRCodeDateField(dateStr: string) {
		const year = parseInt(dateStr.slice(0, 2), 10) + 2000;
		const month = parseInt(dateStr.slice(2, 4), 10) - 1;
		const day = parseInt(dateStr.slice(4, 6), 10);
		const hour = parseInt(dateStr.slice(6, 8), 10);
		const minute = parseInt(dateStr.slice(8, 10), 10);
		const second = parseInt(dateStr.slice(10, 12), 10);

		return new Date(Date.UTC(year, month, day, hour, minute, second));
	}
}
