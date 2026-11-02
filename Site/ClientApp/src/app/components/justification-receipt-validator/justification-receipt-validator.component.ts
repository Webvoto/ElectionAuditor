import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { PropComponent } from '../common/prop/prop.component';
import { ValidationAlertComponent, ValidationMessages } from '../common/validation-alert/validation-alert.component';
import { SourceNoteComponent } from '../common/source-note/source-note.component';
import { SessionService } from '../../services/session.service';
import { SessionModel } from '../../api/session';
import { getMemberIdentifierLabel, JustificationReceiptModel } from '../../api/justification';
import { DateTimePipe } from '../../pipes/date-time.pipe';
import { checkDocument, decodeDateField, decodeStringField, DocumentKinds, QRDocument, UnreadableDocumentError, ValidationResults } from '../../classes/qr-document';

@Component({
	selector: 'app-justification-receipt-validator',
	standalone: true,
	imports: [
		PropComponent,
		MatDividerModule,
		DateTimePipe,
		ValidationAlertComponent,
		SourceNoteComponent,
	],
	templateUrl: './justification-receipt-validator.component.html',
})
export class JustificationReceiptValidatorComponent implements OnInit {

	session: SessionModel | null = null;
	receipt: JustificationReceiptModel | null = null;
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
			DocumentKinds.JustificationReceipt,
			this.route.snapshot.paramMap.get('data'),
			sessionId => this.sessionService.get(sessionId),
			(document, session) => this.readReceipt(document, session),
		);
		this.session = checked.session;
		this.receipt = checked.content;
		this.result = checked.result;
	}

	/**
	 * Version 1: version, Session, kind of the Member's identifier, the identifier as typed, the Member's name (empty unless the Declarant
	 * stated it), the Declarant's identifier (empty when the Declarant is the Member), the Declarant's name, the date and the protocol
	 */
	private readReceipt(document: QRDocument, session: SessionModel | null): JustificationReceiptModel {
		const fields = document.fields;
		if (document.version !== '1' || fields.length !== 9) {
			throw new UnreadableDocumentError();
		}
		return {
			session: session?.name ?? document.sessionId,
			memberIdentifierLabel: getMemberIdentifierLabel(fields[2], session),
			memberIdentifier: fields[3],
			memberName: decodeStringField(fields[4]),
			declarantIdentifierLabel: session?.declarantIdentifierLabel || 'Identificador',
			declarantIdentifier: fields[5],
			declarantName: decodeStringField(fields[6]),
			date: decodeDateField(fields[7]),
			protocol: fields[8],
			authentication: document.authentication,
		};
	}
}
