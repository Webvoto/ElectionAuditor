import base32 from 'hi-base32';
import { DateTime, FixedOffsetZone } from 'luxon';
import { SessionModel } from '../api/session';
import { Constants } from './constants';

/**
 * The kinds of self-checking document, which are also their segments of the QR code's path
 */
export enum DocumentKinds {
	VotingReceipt = 'CV',
	JustificationReceipt = 'CJ',
	StandingAttestation = 'CS',
}

export enum ValidationResults {
	Valid = 'Valid',
	Invalid = 'Invalid',
	NotSet = 'NotSet',
}

/**
 * Thrown when a document's fields are not all understood: an unknown version, a field count other than its version's, an unknown code or
 * a malformed field. Such a document is neither shown nor checked, so that a correctly signed document is never shown with a field this
 * page could not read.
 */
export class UnreadableDocumentError extends Error { }

/**
 * A self-checking document read from its QR code: a URL whose path, after the kind's segment, carries the document's fields and, last,
 * their signature, separated by dots. The first field is the format's version and the second the Session's id, whose document-authentication
 * key signed the fields.
 */
export class QRDocument {

	private constructor(
		readonly kind: DocumentKinds,
		readonly fields: string[],
		readonly authentication: string,
	) { }

	/**
	 * The kind is always the page's own, from its route, never taken from the URL's data
	 */
	static read(kind: DocumentKinds, data: string | null) {
		const parts = data?.split(Constants.QRCodeFieldSeparator) ?? [];
		if (parts.length < 3) {
			throw new UnreadableDocumentError();
		}
		return new QRDocument(kind, parts.slice(0, parts.length - 1), parts[parts.length - 1]);
	}

	get version() {
		return this.fields[0];
	}

	get sessionId() {
		return this.fields[1];
	}

	/**
	 * The message the signature covers. A Voting Receipt signs its fields alone, as ["f1", "f2", …], the form every receipt already printed
	 * relies on. Every other kind signs its kind together with its fields, as ["CJ", ["f1", "f2", …]], which no Voting Receipt's flat array
	 * nor any other kind can reproduce, so that a document's signature never checks as another kind's (see ADR 0044 of the VotingSystem).
	 */
	get signedMessage() {
		return this.kind === DocumentKinds.VotingReceipt
			? JSON.stringify(this.fields)
			: JSON.stringify([this.kind, this.fields]);
	}

	/**
	 * Checks the ECDSA P-256 signature of the signed message against the Session's document-authentication public key
	 */
	async verify(publicKeyBase64: string) {
		const publicKey = await crypto.subtle.importKey(
			'spki',
			base64ToBytes(publicKeyBase64),
			{
				name: 'ECDSA',
				namedCurve: 'P-256',
			},
			false,
			['verify']
		);
		return await crypto.subtle.verify(
			{
				name: 'ECDSA',
				hash: { name: 'SHA-256' },
			},
			publicKey,
			decodeBinaryField(this.authentication),
			new TextEncoder().encode(this.signedMessage)
		);
	}
}

export interface CheckedDocument<T> {
	session: SessionModel | null;
	content: T | null;
	result: ValidationResults;
}

/**
 * Reads a document of the given kind from a QR code's data and checks its signature. The content is read by the page, which throws
 * UnreadableDocumentError on anything it does not understand; it is then neither shown nor checked. A document whose Session is not found
 * is shown, since its content is readable, but cannot be checked.
 */
export async function checkDocument<T>(
	kind: DocumentKinds,
	data: string | null,
	getSession: (sessionId: string) => Promise<SessionModel | null>,
	readContent: (document: QRDocument, session: SessionModel | null) => T,
): Promise<CheckedDocument<T>> {
	try {
		const document = QRDocument.read(kind, data);
		const session = await getSession(document.sessionId);
		const content = readContent(document, session);
		if (!session) {
			return { session, content, result: ValidationResults.NotSet };
		}
		const isValid = await document.verify(session.documentAuthenticationPublicKey);
		return { session, content, result: isValid ? ValidationResults.Valid : ValidationResults.Invalid };
	} catch (ex) {
		if (!(ex instanceof UnreadableDocumentError)) {
			console.error('Error checking document:', ex);
		}
		return { session: null, content: null, result: ValidationResults.NotSet };
	}
}

/**
 * Free text, such as a name, whose spaces are encoded as hyphens
 */
export function decodeStringField(value: string) {
	return value.replaceAll(Constants.QRCodeSpaceStringEncoding, ' ');
}

/**
 * A code, such as a Question's, which the Session's model holds in lowercase
 */
export function decodeCodeField(value: string) {
	return value.toLowerCase();
}

export function decodeBinaryField(value: string) {
	try {
		return new Uint8Array(base32.decode.asBytes(value));
	} catch {
		throw new UnreadableDocumentError();
	}
}

/**
 * A date and time as seen at its offset, then the offset: "yyMMddHHmmss", a minus sign only when the offset is negative, and "HHmm"
 */
export function decodeDateField(value: string | undefined) {
	const match = /^(?<localDate>\d{12})(?<offsetSign>-?)(?<offsetHours>\d{2})(?<offsetMinutes>\d{2})$/.exec(value ?? '');
	if (!match?.groups) {
		throw new UnreadableDocumentError();
	}
	const offsetString = `UTC${match.groups['offsetSign'] || '+'}${match.groups['offsetHours']}:${match.groups['offsetMinutes']}`;
	const date = DateTime.fromFormat(match.groups['localDate'], 'yyMMddHHmmss', { zone: FixedOffsetZone.parseSpecifier(offsetString) });
	if (!date.isValid) {
		throw new UnreadableDocumentError();
	}
	return date;
}

/**
 * Reads a field holding one of a fixed set of codes, refusing any other
 */
export function decodeEnumField<T extends string>(value: string | undefined, codes: Record<string, T>): T {
	const decoded = value !== undefined && Object.hasOwn(codes, value) ? codes[value] : undefined;
	if (decoded === undefined) {
		throw new UnreadableDocumentError();
	}
	return decoded;
}

function base64ToBytes(value: string) {
	return Uint8Array.from(atob(value), c => c.charCodeAt(0));
}
