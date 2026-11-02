import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PropComponent } from '../common/prop/prop.component';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../services/session.service';
import { ReceiptModel, VotedQuestionModel } from '../../api/receipt';
import { SessionModel } from '../../api/session';
import { MatDividerModule } from '@angular/material/divider';
import { DateTimePipe } from '../../pipes/date-time.pipe';
import { checkDocument, decodeCodeField, decodeDateField, decodeStringField, DocumentKinds, QRDocument, UnreadableDocumentError, ValidationResults } from '../../classes/qr-document';
import { ValidationAlertComponent, ValidationMessages } from '../common/validation-alert/validation-alert.component';
import { SourceNoteComponent } from '../common/source-note/source-note.component';

@Component({
	selector: 'app-voting-receipt-validator',
	standalone: true,
	imports: [
		CommonModule,
		PropComponent,
		MatDividerModule,
		DateTimePipe,
		ValidationAlertComponent,
		SourceNoteComponent,
	],
	templateUrl: './voting-receipt-validator.component.html',
	styleUrls: ['./voting-receipt-validator.component.scss']
})
export class VotingReceiptValidatorComponent implements OnInit {

	session: SessionModel | null = null;
	receipt: ReceiptModel | null = null;
	result: ValidationResults | null = null;

	readonly messages: ValidationMessages = {
		[ValidationResults.Valid]: 'Comprovante válido',
		[ValidationResults.Invalid]: 'Comprovante adulterado!',
		[ValidationResults.NotSet]: 'Não foi possível validar o comprovante. Isso pode indicar que o comprovante foi adulterado.',
	};

	constructor(
		private readonly route: ActivatedRoute,
		private readonly sessionService: SessionService,
	) { }

	async ngOnInit() {
		const checked = await checkDocument(
			DocumentKinds.VotingReceipt,
			this.route.snapshot.paramMap.get('data'),
			sessionId => this.sessionService.get(sessionId),
			(document, session) => this.readReceipt(document, session),
		);
		this.session = checked.session;
		this.receipt = checked.content;
		this.result = checked.result;
	}

	private readReceipt(document: QRDocument, session: SessionModel | null): ReceiptModel {
		const fields = document.fields;
		if (fields.length < 4) {
			throw new UnreadableDocumentError();
		}
		return {
			session: session?.name ?? document.sessionId,
			memberIdentifier: fields[2],
			memberName: decodeStringField(fields[3]),
			votedQuestions: this.readQuestions(document.version, fields.slice(4), session),
			authentication: document.authentication,
		};
	}

	private readQuestions(version: string, fields: string[], session: SessionModel | null) {
		switch (version) {
			case '1':
				return this.readQuestionsV1(fields, session);
			case '2':
				return this.readQuestionsV2(fields, session);
			default:
				throw new UnreadableDocumentError();
		}
	}

	private readQuestionsV1(fields: string[], session: SessionModel | null) {
		const questions: VotedQuestionModel[] = [];
		const groupSize = 3;

		if (fields.length % groupSize !== 0) {
			throw new UnreadableDocumentError();
		}
		for (let i = 0; i < fields.length; i += groupSize) {
			const [code, date, checkCode] = fields.slice(i, i + groupSize);
			questions.push({
				name: this.getQuestionName(decodeCodeField(code), session),
				date: decodeDateField(date),
				checkCode
			});
		}

		return questions;
	}

	private readQuestionsV2(fields: string[], session: SessionModel | null) {
		const questions: VotedQuestionModel[] = [];
		const groupSize = 3;

		for (let i = 0; i < fields.length; i += groupSize) {
			const choicesInitialIndex = groupSize + i;
			const [code, date, quantityOfChoicesStr] = fields.slice(i, i + groupSize);
			if (!/^\d+$/.test(quantityOfChoicesStr ?? '')) {
				throw new UnreadableDocumentError();
			}
			const quantityOfChoices = Number(quantityOfChoicesStr);
			const votes = fields.slice(choicesInitialIndex, choicesInitialIndex + quantityOfChoices).join(', ');
			const checkCode = fields[choicesInitialIndex + quantityOfChoices];
			if (checkCode === undefined) {
				throw new UnreadableDocumentError();
			}
			questions.push({
				name: this.getQuestionName(decodeCodeField(code), session),
				date: decodeDateField(date),
				votes: quantityOfChoices > 0 && votes === '' ? '***' : decodeStringField(votes),
				checkCode
			});
			i += quantityOfChoices + 1;
		}
		return questions;
	}

	// A Question the Session no longer has is shown by its code, which the receipt does carry
	private getQuestionName(code: string, session: SessionModel | null) {
		return session?.questions.find(q => q.code == code)?.name ?? `@${code}`;
	}
}
