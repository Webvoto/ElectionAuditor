import { Routes } from '@angular/router';
import { VotingReceiptValidatorComponent } from './components/voting-receipt-validator/voting-receipt-validator.component';
import { HomeComponent } from './components/home/home.component';
import { KeygenComponent } from './components/keygen/keygen.component';

export const routes: Routes = [
	{
		path: '',
		component: HomeComponent,
	},
	{
		path: 'keygen',
		component: KeygenComponent
	},
	{
		path: 'QR/CV/:data',
		component: VotingReceiptValidatorComponent
	}
];
