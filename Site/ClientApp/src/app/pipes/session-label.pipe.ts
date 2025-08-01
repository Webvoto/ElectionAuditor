import { Pipe, PipeTransform } from '@angular/core';
import { SessionLabels } from '../api/enums';

@Pipe({
	name: 'sessionLabel',
	standalone: true,
})
export class SessionLabelPipe implements PipeTransform {

	transform(value: SessionLabels) {
		switch (value) {
			case SessionLabels.Session:
				return 'Sessão';
			case SessionLabels.Assembly:
				return 'Assembleia';
			case SessionLabels.Election:
				return 'Eleição';
			case SessionLabels.Elections:
				return 'Eleições';
			case SessionLabels.Consultation:
				return 'Consulta';
			default:
				return '';
		}
	}

}
