import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';

import { Router } from '@angular/router';

import * as firebase from 'firebase/app';

@Component({
    selector: 'home',
    styleUrls: [ './home.style.scss' ],
    templateUrl: './home.template.html'
})
export class HomeComponent {

    constructor(private router: Router) {
        this.router = router;
    }

    public ngOnInit() {
        console.log("home");
        console.log(firebase.firestore());
    }
}