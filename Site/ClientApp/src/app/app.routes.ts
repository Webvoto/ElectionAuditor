import { Routes } from '@angular/router';
import { VotingReceiptValidatorComponent } from './components/voting-receipt-validator/voting-receipt-validator.component';
import { HomeComponent } from './components/home/home.component';
import { KeygenComponent } from './components/keygen/keygen.component';
import { JustificationReceiptValidatorComponent } from './components/justification-receipt-validator/justification-receipt-validator.component';
import { StandingAttestationValidatorComponent } from './components/standing-attestation-validator/standing-attestation-validator.component';

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
	},
	{
		path: 'QR/CJ/:data',
		component: JustificationReceiptValidatorComponent
	},
	{
		path: 'QR/CS/:data',
		component: StandingAttestationValidatorComponent
	}
];
