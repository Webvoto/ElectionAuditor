import { Pipe, PipeTransform } from '@angular/core';
import { MemberLabels } from '../api/enums';

@Pipe({
	name: 'memberLabel',
	standalone: true,
})
export class MemberLabelPipe implements PipeTransform {

	transform(value: MemberLabels) {
		switch (value) {
			case MemberLabels.Member:
				return 'Membro';
			case MemberLabels.Elector:
				return 'Eleitor';
			case MemberLabels.Participant:
				return 'Particípante';
			case MemberLabels.Associate:
				return 'Associado';
			case MemberLabels.Creditor:
				return 'Credor';
			default:
				return '';
		}
	}

}
