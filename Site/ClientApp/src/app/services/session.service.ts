import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SessionModel } from '../api/session';


const apiRoute = 'api/sessions';
@Injectable({
  providedIn: 'root'
})
export class SessionService {

	constructor(
		private readonly http: HttpClient,
	) { }

	get(code: string) {
		return firstValueFrom(this.http.get<SessionModel | null>(`${apiRoute}/${code}`));
	}
}
