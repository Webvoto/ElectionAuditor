import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Constants } from '../../classes/constants';
import { PropComponent } from '../common/prop/prop.component';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../services/session.service';
import { ReceiptModel, VotedQuestionModel } from '../../api/receipt';
import { SessionModel } from '../../api/session';
import { MatDividerModule } from '@angular/material/divider';
import base32 from 'hi-base32';
import { MatIconModule } from '@angular/material/icon';
import { CryptoVerificationService } from '../../services/crypto-verification.service';
import { DateTime, FixedOffsetZone } from 'luxon';
import { DateTimePipe } from '../../pipes/date-time.pipe';

enum ValidationResults {
	Valid = "Valid",
	Invalid = "Invalid",
	NotSet = "NotSet ",
}

interface Validation {
	result: ValidationResults;
	class: string;
	iconName: string;
	message: string;
}

@Component({
	selector: 'app-voting-receipt-validator',
	standalone: true,
	imports: [
		CommonModule,
		PropComponent,
		MatDividerModule,
		MatIconModule,
		DateTimePipe,
	],
	templateUrl: './voting-receipt-validator.component.html',
	styleUrls: ['./voting-receipt-validator.component.scss']
})
export class VotingReceiptValidatorComponent implements OnInit {

	session: SessionModel | null = null;
	receipt: ReceiptModel | null = null;

	signatureBase64: string = '';
	messageToValidate: string = '';
	validation: Validation | null = null;

	possibleValidationsMap: Record<ValidationResults, Validation> = {
		[ValidationResults.Valid]: {
			result: ValidationResults.Valid,
			message: 'Comprovante válido',
			iconName: 'check_circle',
			class: 'alert-success'
		},
		[ValidationResults.Invalid]: {
			result: ValidationResults.Invalid,
			message: 'Comprovante adulterado!',
			iconName: 'cancel',
			class: 'alert-danger'
		},
		[ValidationResults.NotSet]: {
			result: ValidationResults.NotSet,
			message: 'Não foi possível validar o comprovante. Isso pode indicar que o comprovante foi adulterado.',
			iconName: 'warning',
			class: 'alert-warning'
		}
	};
	
	constructor(
		private readonly route: ActivatedRoute,
		private readonly sessionService: SessionService,
		private readonly cryptoVerificationService: CryptoVerificationService,
	) { }

	async ngOnInit() {
		await this.processRouteData();

		if (this.session && this.receipt) {
			let isValid = await this.cryptoVerificationService.verifyECDsaSignature(this.session.documentAuthenticationPublicKey, this.messageToValidate, this.signatureBase64);
			this.validation = isValid ? this.possibleValidationsMap[ValidationResults.Valid] : this.possibleValidationsMap[ValidationResults.Invalid];
		} else {
			this.validation = this.possibleValidationsMap[ValidationResults.NotSet];
		}
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

		this.messageToValidate = JSON.stringify(parts.slice(0, parts.length - 1));
		this.signatureBase64 = this.decodeQRCodeBinaryField(parts[parts.length - 1]);

		const sessionIdEncoded = parts[1];
		this.session = await this.sessionService.get(sessionIdEncoded);

		const questionFields = parts.slice(4, parts.length - 1);

		this.receipt = {
			session: this.session?.name ?? sessionIdEncoded,
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
				name: question?.name ?? `@${decodedCode}`,
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
			const base32Array = base32.decode.asBytes(field);
			const binaryString = base32Array.map((num) => String.fromCharCode(num)).join('');
			return btoa(binaryString);
		} catch {
			console.error('Error decoding binary field:', field);
			return '';
		}
	}

	private decodeQRCodeDateField(dateStr: string) {
		let date = DateTime.fromFormat(dateStr, 'yyMMddHHmmss', { zone: FixedOffsetZone.utcInstance });
		return this.session ? date.setZone(this.session.timeZone) : date;
	}
}
