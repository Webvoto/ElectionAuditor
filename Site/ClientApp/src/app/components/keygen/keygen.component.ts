import { ChangeDetectorRef, Component, OnInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as forge from 'node-forge';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule, FormControl, Validators, AbstractControl, ValidationErrors, FormBuilder, FormGroup } from '@angular/forms';
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
export class KeygenComponent implements OnInit {
	constructor(
		private dialog: MatDialog,
		private readonly fb: FormBuilder,
	) { }

	generating = false;
	hasKeys = false;
	verifying = false;
	publicKeyPem = '';
	privateKeyEncryptedPem = '';
	privateKeyObj: forge.pki.rsa.PrivateKey | null = null;
	thumbprint = '';
	moniker = '';

	form!: FormGroup;
	minPasswordLength = 4;

	verifyForm!: FormGroup;

	ngOnInit(): void {
		this.initializeForm();
	}

	private initializeForm(): void {
		this.form = this.fb.group({
			password: ['', [Validators.required, Validators.minLength(this.minPasswordLength)]],
			confirm: ['', [Validators.required]]
		}, { validators: this.passwordsMatchValidator });

		this.verifyForm = this.fb.group({
			publicKey: ['', [Validators.required]],
			privateKey: ['', [Validators.required]],
			password: ['', [Validators.required]]
		});
	}

	private passwordsMatchValidator = (group: FormGroup) => {
		const p = group.get('password')?.value;
		const c = group.get('confirm')?.value;
		if (p !== c) {
			return { passwordMismatch: true };
		}
		return null;
	};

	get passwordValue(): string {
		return this.form.get('password')?.value;
	}

	get formInvalid(): boolean {
		return this.form.invalid;
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

			this.hasKeys = true;

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

		this.initializeForm();

		const ref = this.dialog.open(passwordtpl, { disableClose: true });
		const password: string = await firstValueFrom(ref.afterClosed());

		this.initializeForm();

		if (!password) return;

		const pem = forge.pki.encryptRsaPrivateKey(this.privateKeyObj, password, {
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
		this.hasKeys = false;
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

	openVerifyDialog(tpl: TemplateRef<boolean>): void {
		this.verifyForm.reset();
		this.verifying = false;
		this.dialog.open(tpl, { disableClose: false });
	}

	async loadFile(event: Event, controlName: 'publicKey' | 'privateKey'): Promise<void> {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		try {
			const text = await file.text();
			this.verifyForm.get(controlName)?.setValue(text);
			this.verifyForm.get(controlName)?.markAsDirty();
			this.verifyForm.updateValueAndValidity();

		} finally {
			input.value = '';
		}
	}

	async verifyKey(): Promise<void> {
		
	}
}
