import { Component } from "@angular/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { MatButtonModule } from '@angular/material/button';

@Component({
	selector: "app-home",
	standalone: true,
	imports: [RouterModule, MatButtonModule],
	templateUrl: "./home.component.html",
	styleUrls: ["./home.component.scss"],
})
export class HomeComponent {
	constructor(
		public route: ActivatedRoute,
		private router: Router
	) { }

}
