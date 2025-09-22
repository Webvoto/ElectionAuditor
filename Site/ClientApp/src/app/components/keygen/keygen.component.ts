import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as forge from 'node-forge';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-keygen',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  templateUrl: './keygen.component.html',
  styleUrls: ['./keygen.component.scss'],
})
export class KeygenComponent {
  constructor(private dialog: MatDialog) {}

  generating = false;
  publicKeyPem = '';
  privateKeyEncryptedPem = '';
  thumbprint = '';
  moniker = '';
  iterations = 100_000;

  get hasKeys(): boolean {
    return !!(this.publicKeyPem && this.privateKeyEncryptedPem);
  }

  async generate(): Promise<void> {
    this.generating = true;
    setTimeout(() => {
      try {
        const senha = '1234';
        const { privateKey, publicKey } = forge.pki.rsa.generateKeyPair(2048);

        this.publicKeyPem = forge.pki.publicKeyToPem(publicKey);

        this.privateKeyEncryptedPem = forge.pki.encryptRsaPrivateKey(privateKey, senha, {
          algorithm: 'aes256',
          count: this.iterations,
          prfAlgorithm: 'sha256',
          saltSize: 16,
        });

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
    }, 100);
  }

  downloadPublic(): void {
    if (!this.hasKeys) return;
    this.download(this.publicKeyPem, `chave-${this.moniker || 'pub'}-1-publica.pem`, 'application/x-pem-file');
  }

  downloadPrivate(): void {
    if (!this.hasKeys) return;
    this.download(this.privateKeyEncryptedPem, `chave-${this.moniker || 'priv'}-2-privada.pem`, 'application/x-pem-file');
  }

	confirmDiscard(tpl: TemplateRef<unknown>): void {
		const ref = this.dialog.open(tpl, { disableClose: false });
		ref.afterClosed().subscribe((ok: boolean) => {
			if (ok) this.discardKeys();
		});
	}

  private discardKeys(): void {
    this.publicKeyPem = '';
    this.privateKeyEncryptedPem = '';
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
