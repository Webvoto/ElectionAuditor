import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

const sourceBaseUrl = 'https://github.com/Webvoto/ElectionAuditor/blob/main/Site/ClientApp/src/app/';

/**
 * Points to the source of a page's check: the page's own component, which reads its kind of document, and the code every page shares,
 * which builds the signed message and checks the signature
 */
@Component({
	selector: 'app-source-note',
	standalone: true,
	imports: [
		MatIconModule,
	],
	templateUrl: './source-note.component.html',
})
export class SourceNoteComponent {

	@Input({ required: true }) set componentPath(value: string) {
		this.componentUrl = sourceBaseUrl + value;
	}

	componentUrl = '';
	readonly sharedUrl = sourceBaseUrl + 'classes/qr-document.ts';
}
