import { Component } from "@angular/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";

@Component({
	selector: "app-home",
	standalone: true,
	imports: [RouterModule],
	templateUrl: "./home.component.html",
	styleUrls: ["./home.component.scss"],
})
export class HomeComponent {
	constructor(
		public route: ActivatedRoute,
		private router: Router
	) { }


	navigateToKeygen() {
		this.router.navigate(['keygen'], { relativeTo: this.route });
	}
}
