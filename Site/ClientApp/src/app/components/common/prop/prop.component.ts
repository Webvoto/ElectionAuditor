import { Component, Input } from '@angular/core';

@Component({
	selector: 'app-prop',
	templateUrl: './prop.component.html',
	styleUrl: './prop.component.scss',
	standalone: true
})
export class PropComponent {
	@Input() label: string | undefined;
}
