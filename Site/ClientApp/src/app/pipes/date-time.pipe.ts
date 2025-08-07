import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';

@Pipe({
	name: 'dateTime'
})
export class DateTimePipe implements PipeTransform {

	transform(value: DateTime, ...args: unknown[]): string {
		return value.toFormat("dd/MM/yyyy HH:mm:ss 'GMT'Z");
	}
}
