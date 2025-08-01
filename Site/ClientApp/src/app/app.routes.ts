import { Routes } from '@angular/router';
import { VotingReceiptValidatorComponent } from './components/voting-receipt-validator/voting-receipt-validator.component';

export const routes: Routes = [
	{
		path: 'qr/cv/:data',
		component: VotingReceiptValidatorComponent
	}
];
