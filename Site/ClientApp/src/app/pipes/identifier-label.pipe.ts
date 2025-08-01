import { Pipe, PipeTransform } from '@angular/core';
import { IdentifierLabels } from '../api/enums';

@Pipe({
	name: 'identifierLabel',
	standalone: true,
})
export class IdentifierLabelPipe implements PipeTransform {

	transform(value: IdentifierLabels) {
		switch (value) {
			case IdentifierLabels.Cpf:
				return 'CPF';
			case IdentifierLabels.Cnpj:
				return 'CNPJ';
			case IdentifierLabels.Number:
				return 'Número';
			case IdentifierLabels.CpfOrCnpj:
				return 'CPF ou CNPJ';
			case IdentifierLabels.OrganizationNumber:
				return 'Numero Organizacional';
			case IdentifierLabels.RegistrationNumber:
				return 'Matrícula';
			default:
				return '';
		}
	}

}
