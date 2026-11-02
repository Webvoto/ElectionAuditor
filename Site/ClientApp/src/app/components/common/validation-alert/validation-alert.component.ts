import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ValidationResults } from '../../../classes/qr-document';

export type ValidationMessages = Record<ValidationResults, string>;

@Component({
	selector: 'app-validation-alert',
	standalone: true,
	imports: [
		CommonModule,
		MatIconModule,
	],
	templateUrl: './validation-alert.component.html',
})
export class ValidationAlertComponent {

	@Input({ required: true }) result!: ValidationResults;
	@Input({ required: true }) messages!: ValidationMessages;

	readonly classes: Record<ValidationResults, string> = {
		[ValidationResults.Valid]: 'alert-success',
		[ValidationResults.Invalid]: 'alert-danger',
		[ValidationResults.NotSet]: 'alert-warning',
	};

	readonly iconNames: Record<ValidationResults, string> = {
		[ValidationResults.Valid]: 'check_circle',
		[ValidationResults.Invalid]: 'cancel',
		[ValidationResults.NotSet]: 'warning',
	};
}
