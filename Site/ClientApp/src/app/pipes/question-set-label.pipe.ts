import { Pipe, PipeTransform } from '@angular/core';
import { QuestionSetLabels } from '../api/enums';

@Pipe({
	name: 'questionSetLabel',
	standalone: true,
})
export class QuestionSetLabelPipe implements PipeTransform {

	transform(value: QuestionSetLabels): unknown {
		switch (value) {
			case QuestionSetLabels.Questions:
				return 'Questões';
			case QuestionSetLabels.Elections:
				return 'Eleições';
			case QuestionSetLabels.Consultations:
				return 'Consulta';
			case QuestionSetLabels.Voting:
				return 'Votação';
			case QuestionSetLabels.Agenda:
				return 'Pauta';
			case QuestionSetLabels.AgendaItems:
				return 'Itens de pauta';
			case QuestionSetLabels.Topics:
				return 'Tópico';
			default:
				return '';
		}
	}

}
