import { Routes } from '@angular/router';
import { VotingReceiptValidatorComponent } from './components/voting-receipt-validator/voting-receipt-validator.component';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
	{
		path: '',
		component: HomeComponent,
	},
	{
		path: 'QR/CV/:data',
		component: VotingReceiptValidatorComponent
	}
];
