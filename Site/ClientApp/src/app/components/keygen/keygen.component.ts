import { Component, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as forge from 'node-forge';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { firstValueFrom } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { delay } from '../../classes/utils';
import { MatDividerModule } from '@angular/material/divider';

@Component({
	selector: 'app-keygen',
	standalone: true,
	imports: [CommonModule,
		FormsModule,
		ReactiveFormsModule,
		MatButtonModule,
		MatDialogModule,
		MatFormFieldModule,
		MatInputModule,
		MatIconModule,
		MatDividerModule,
	],
	templateUrl: './keygen.component.html',
	styleUrls: ['./keygen.component.scss'],
})
export class KeygenComponent {
	constructor(private dialog: MatDialog) { }

	generating = false;
	publicKeyPem = '';
	privateKeyEncryptedPem = '';
	privateKeyObj: forge.pki.rsa.PrivateKey | null = null;
	thumbprint = '';
	moniker = '';

	password = new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.minLength(4)] });
	confirm = new FormControl<string>('', {
		nonNullable: true, validators: [
			Validators.required,
			(control: AbstractControl): ValidationErrors | null => {
				if (this.password && control.value != this.password.value) {
					return { passwordMismatch: true };
				}
				return null;
			}

	] });

	passwordError(): string {
		if (this.password.hasError('required')) return 'Informe a senha';
		if (this.password.hasError('minlength')) return 'Digite pelo menos 4 caracteres';

		return '';
	}
	confirmError(): string {
		if (this.confirm.hasError('required')) return 'Confirme a senha';
		if (this.password.value != this.confirm.value) return 'As senhas não coincidem';

		return '';
	}

	get hasKeys(): boolean {
		return !!(this.publicKeyPem && this.privateKeyObj);
	}

	get formInvalid(): boolean {
		return !!this.passwordError() || !!this.confirmError();
	}

	async generate(): Promise<void> {

		this.generating = true;

		await delay(100);

		try {

			const { privateKey, publicKey } = forge.pki.rsa.generateKeyPair(2048);

			this.privateKeyObj = privateKey;
			this.publicKeyPem = forge.pki.publicKeyToPem(publicKey);

			const spkiAsn1 = forge.pki.publicKeyToAsn1(publicKey);
			const spkiDerBytes = forge.asn1.toDer(spkiAsn1).getBytes();

			const md = forge.md.sha256.create();
			md.update(spkiDerBytes, 'raw');
			const digest = md.digest();

			this.moniker = digest.toHex().slice(0, 6);
			this.thumbprint = digest.toHex();

		} catch (err) {
			console.error('Falha ao gerar chaves:', err);
		} finally {
			this.generating = false;
		}
	}

	downloadPublic(): void {
		if (!this.hasKeys) return;
		this.download(this.publicKeyPem, `chave-${this.moniker || 'pub'}-1-publica.pem`, 'application/x-pem-file');
	}

	async downloadPrivate(passwordtpl: TemplateRef<boolean>): Promise<void> {
		if (!this.hasKeys || !this.privateKeyObj) return;

		const ref = this.dialog.open(passwordtpl, { disableClose: true });
		const password: string = await firstValueFrom(ref.afterClosed());

		const pwdValue = this.password.value;
		this.password.reset('');
		this.confirm.reset('');

		if (!password) return;

		const pem = forge.pki.encryptRsaPrivateKey(this.privateKeyObj, pwdValue, {
			algorithm: 'aes256',
			count: 200_000,
			prfAlgorithm: 'sha256',
			saltSize: 16,
		});
		this.download(pem, `chave-${this.moniker || 'priv'}-2-privada.pem`, 'application/x-pem-file');
	}

	async confirmDiscard(tpl: TemplateRef<boolean>): Promise<void> {
		const ref = this.dialog.open(tpl, { disableClose: false });
		const confirm = await firstValueFrom(ref.afterClosed());
		if (confirm) this.discardKeys();
	}

	private discardKeys(): void {
		this.publicKeyPem = '';
		this.privateKeyEncryptedPem = '';
		this.privateKeyObj = null;
		this.thumbprint = '';
		this.moniker = '';
	}

	private download(content: string, filename: string, mime = 'application/octet-stream'): void {
		if (typeof document === 'undefined') return;
		const blob = new Blob([content], { type: mime });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		a.style.display = 'none';
		document.body.appendChild(a);
		a.click();
		setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 100);
	}
}
