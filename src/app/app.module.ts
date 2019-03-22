import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// import firebase from 'firebase/app';
import * as firebase from 'firebase/app';
// import firestore from 'firebase/firestore';

import 'firebase/auth';
// import 'firebase/database';
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/messaging';
// import 'firebase/functions';

// Firebase web app config
var firebaseConfig = {
    apiKey: "AIzaSyAbYLrGKg9l9s3ShrFVwg8PeUxgF-z6Zds",
    authDomain: "rocket-rounding.firebaseapp.com",
    databaseURL: "https://rocket-rounding.firebaseio.com",
    projectId: "rocket-rounding",
    storageBucket: "rocket-rounding.appspot.com",
    messagingSenderId: "1024282212718"
};

// Initialize Cloud Firestore through Firebase
firebase.initializeApp(firebaseConfig);

// var db = firebase.firestore();

import { HomeComponent } from './home';

import { PromisePoolService } from './services/promisePool.service';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule
    ],
    providers: [
        PromisePoolService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
