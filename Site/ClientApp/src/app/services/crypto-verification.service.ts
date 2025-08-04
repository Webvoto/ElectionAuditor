import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class CryptoVerificationService {

	public async verifyECDsaSignature(publicKeyPem: string, message: string, signatureBase64: string) {
		const publicKeyBuffer = this.base64ToArrayBuffer(publicKeyPem);

		const cryptoKey = await crypto.subtle.importKey(
			'spki',
			publicKeyBuffer,
			{
				name: 'ECDSA',
				namedCurve: 'P-256',
			},
			true,
			['verify']
		);

		const signature = this.base64ToArrayBuffer(signatureBase64);
		const encoder = new TextEncoder();
		const messageBuffer = encoder.encode(message);

		const valid = await crypto.subtle.verify(
			{
				name: 'ECDSA',
				hash: { name: 'SHA-256' },
			},
			cryptoKey,
			signature,
			messageBuffer
		);

		return valid;
	}

	private base64ToArrayBuffer(b64: string): ArrayBuffer {
		const binaryDerString = atob(b64);
		const len = binaryDerString.length;
		const bytes = new Uint8Array(len);
		for (let i = 0; i < len; i++) {
			bytes[i] = binaryDerString.charCodeAt(i);
		}
		return bytes.buffer;
	}
}
