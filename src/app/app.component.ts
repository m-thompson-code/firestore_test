import { Component } from '@angular/core';

@Component({
  	selector: 'app-root',
  	templateUrl: './app.template.html',
  	styleUrls: ['./app.style.scss']
})
export class AppComponent {
    files: any;
  	constructor() {

	}

	ngOnInit() {
		console.log("app");
	}
}
