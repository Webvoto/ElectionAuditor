import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { PropComponent } from '../common/prop/prop.component';
import { ValidationAlertComponent, ValidationMessages } from '../common/validation-alert/validation-alert.component';
import { SourceNoteComponent } from '../common/source-note/source-note.component';
import { SessionService } from '../../services/session.service';
import { SessionModel } from '../../api/session';
import { getMemberIdentifierLabel, StandingAttestationGrounds, standingAttestationGroundCodes, StandingAttestationModel } from '../../api/justification';
import { DateTimePipe } from '../../pipes/date-time.pipe';
import { checkDocument, decodeDateField, decodeEnumField, DocumentKinds, QRDocument, UnreadableDocumentError, ValidationResults } from '../../classes/qr-document';

@Component({
	selector: 'app-standing-attestation-validator',
	standalone: true,
	imports: [
		PropComponent,
		MatDividerModule,
		DateTimePipe,
		ValidationAlertComponent,
		SourceNoteComponent,
	],
	templateUrl: './standing-attestation-validator.component.html',
})
export class StandingAttestationValidatorComponent implements OnInit {

	session: SessionModel | null = null;
	attestation: StandingAttestationModel | null = null;
	result: ValidationResults | null = null;

	readonly messages: ValidationMessages = {
		[ValidationResults.Valid]: 'Certidão válida',
		[ValidationResults.Invalid]: 'Certidão adulterada!',
		[ValidationResults.NotSet]: 'Não foi possível validar a certidão. Isso pode indicar que a certidão foi adulterada.',
	};

	// What the records showed about the identifier when it was identified, without judging whether a Justification suffices. Within a
	// version, a ground's text is a contract with every attestation already issued.
	readonly groundTexts: Record<StandingAttestationGrounds, string> = {
		[StandingAttestationGrounds.OutsideElectoralCollege]: 'Não consta do colégio eleitoral e, portanto, não precisa de justificativa.',
		[StandingAttestationGrounds.NotQualified]: 'Não consta como apto a votar e, portanto, não precisa de justificativa.',
		[StandingAttestationGrounds.NotFound]: 'Não consta do cadastro com este identificador e, portanto, não precisa de justificativa.',
		[StandingAttestationGrounds.HasVoted]: 'Consta como tendo votado e, portanto, não precisa de justificativa.',
		[StandingAttestationGrounds.Justified]: 'Consta justificativa registrada.',
	};

	constructor(
		private readonly route: ActivatedRoute,
		private readonly sessionService: SessionService,
	) { }

	async ngOnInit() {
		const checked = await checkDocument(
			DocumentKinds.StandingAttestation,
			this.route.snapshot.paramMap.get('data'),
			sessionId => this.sessionService.get(sessionId),
			(document, session) => this.readAttestation(document, session),
		);
		this.session = checked.session;
		this.attestation = checked.content;
		this.result = checked.result;
	}

	/**
	 * Version 1: version, Session, kind of the Member's identifier, the identifier as typed, the ground and the date of the identification
	 */
	private readAttestation(document: QRDocument, session: SessionModel | null): StandingAttestationModel {
		const fields = document.fields;
		if (document.version !== '1' || fields.length !== 6) {
			throw new UnreadableDocumentError();
		}
		return {
			session: session?.name ?? document.sessionId,
			memberIdentifierLabel: getMemberIdentifierLabel(fields[2], session),
			memberIdentifier: fields[3],
			ground: decodeEnumField(fields[4], standingAttestationGroundCodes),
			date: decodeDateField(fields[5]),
			authentication: document.authentication,
		};
	}
}
