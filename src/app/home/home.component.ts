import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';

import { Router } from '@angular/router';

import * as firebase from 'firebase/app';

@Component({
    selector: 'home',
    styleUrls: [ './home.style.scss' ],
    templateUrl: './home.template.html'
})
export class HomeComponent {

    db: firebase.firestore.Firestore;

    constructor(private router: Router) {
        this.router = router;
    }

    public ngOnInit() {
        console.log("home");
        console.log(firebase.firestore());
        this.db = firebase.firestore();
    }

    setPost() {
        var test = {
            likeCount: 0
        };

        return this.db.collection("posts").doc("Test").set(test).then(() => {
            console.log("Post: Document successfully written!");
        }).catch(error => {
            console.error("Error writing document: ", error);
        });
    }

    tranLoop(count: number) {
        var promises = [];

        for (var i = 0; i < count; i++) {
            promises.push(this.tran());
        }

        return Promise.all(promises).then(() => {
            console.log("loop done", count);
        }).catch(error => {
            console.error(error);
        });
    }

    notTranLoop(count: number) {
        try {

        }catch(error) {
            var promises = [];

            for (var i = 0; i < count; i++) {
                promises.push(this.notTran());
            }
    
            return Promise.all(promises).then(() => {
                console.log("loop done", count);
            }).catch(error => {
                console.error(error);
            });
        }
    }

    tran() {
        try {
            var docRef = this.db.collection("posts").doc("Test");
            var attemptRef = this.db.collection("attempts").doc("Test");
            return this.db.runTransaction((transaction => {
                return transaction.get(docRef).then(postSnapshot => {
                    // return transaction.get(attemptRef).then(attemptSnapshot => {
                        var post = postSnapshot.data();
    
                        post.likeCount += 1;

                        var attempt = {};

                        attempt["" + Date.now()] = post;

                        console.log("attempt", attempt);
    
                        transaction.update(docRef, post);

                        // if (attemptSnapshot.exists) {
                            // transaction.update(attemptRef, attempt);
                        // } else {
                            // transaction.set(attemptRef, attempt);
                        // }

                        return post;
                    // });
                });
            })).catch(error => {
                console.error(error);
                throw error;
            });
        }catch(error) {
            console.error(error);
        } 
    }

    notTran() {
        return this.db.collection("posts").doc("Test").get().then(snapshot => {
            var post = snapshot.data();

            post.likeCount += 1;

            return this.db.collection("posts").doc("Test").set(post).then(() => {
                return post;
            });
        }).then(post => {
            console.log("done", post);
        })
    }

    // set doc
    setLike(id: string) {
        var test = {};

        return this.db.collection("posts").doc("Test").collection("likeCollection").doc("id").set(test).then(() => {
            console.log("Document successfully written!");
        }).catch(error => {
            console.error("Error writing document: ", error);
        });
    }

    getLikes() {
        return this.db.collection("posts").doc('Test').collection("likeCollection").get().then(querySnapshot => {
            querySnapshot.forEach(childSnapshot => {
                console.log(childSnapshot.id, "=>", childSnapshot.data());
            });
            console.log(querySnapshot);
            return querySnapshot;
        });
    }

    // set doc
    addLike(key: string) {


        
        return this.db.collection("likes").doc("Test").set(test).then(result => {
            console.log("Document successfully written!", result);
        })
        .catch(error => {
            console.error("Error writing document: ", error);
        });
    }

    // set doc
    addData1() {
        return this.db.collection("cities").doc("LA").set({
            name: "Los Angeles",
            state: "CA",
            country: "USA"
        })
        .then(function() {
            console.log("Document successfully written!");
        })
        .catch(function(error) {
            console.error("Error writing document: ", error);
        });
    }

    // update doc
    updateData1() {
        // Add a new document with a generated id.
        return this.db.collection("cities").add({
            name: "Tokyo",
            country: "Japan"
        })
        .then(function(docRef) {
            console.log("Document written with ID: ", docRef.id);
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });
    }
}