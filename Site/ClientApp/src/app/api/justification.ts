import { DateTime } from 'luxon';
import { SessionModel } from './session';
import { decodeEnumField } from '../classes/qr-document';

export interface JustificationReceiptModel {
	session: string;
	memberIdentifierLabel: string;
	memberIdentifier: string;
	memberName: string;
	declarantIdentifierLabel: string;
	declarantIdentifier: string;
	declarantName: string;
	date: DateTime;
	protocol: string;
	authentication: string;
}

export interface StandingAttestationModel {
	session: string;
	memberIdentifierLabel: string;
	memberIdentifier: string;
	ground: StandingAttestationGrounds;
	date: DateTime;
	authentication: string;
}

export enum StandingAttestationGrounds {
	OutsideElectoralCollege = 'OutsideElectoralCollege',
	NotQualified = 'NotQualified',
	NotFound = 'NotFound',
	HasVoted = 'HasVoted',
	Justified = 'Justified',
}

export const standingAttestationGroundCodes: Record<string, StandingAttestationGrounds> = {
	'ELC': StandingAttestationGrounds.OutsideElectoralCollege,
	'QUA': StandingAttestationGrounds.NotQualified,
	'NFD': StandingAttestationGrounds.NotFound,
	'VOT': StandingAttestationGrounds.HasVoted,
	'JUS': StandingAttestationGrounds.Justified,
};

/**
 * Which of the Member's identifiers was typed, by the code the document carries
 */
enum IdentifierKinds {
	Primary = 'Primary',
	Secondary = 'Secondary',
}

const identifierKindCodes: Record<string, IdentifierKinds> = {
	'1': IdentifierKinds.Primary,
	'2': IdentifierKinds.Secondary,
};

/**
 * The label of the Member's identifier of the kind a document's field gives
 */
export function getMemberIdentifierLabel(identifierKindField: string, session: SessionModel | null) {
	switch (decodeEnumField(identifierKindField, identifierKindCodes)) {
		case IdentifierKinds.Primary:
			return session?.identifierLabel || 'Identificador';
		case IdentifierKinds.Secondary:
			return session?.secondaryIdentifierLabel || 'Identificador secundário';
	}
}
