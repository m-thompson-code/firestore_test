import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';

import { Router } from '@angular/router';

import * as firebase from 'firebase/app';

import * as moment from 'moment';

declare var PromisePool: any;

@Component({
    selector: 'home',
    styleUrls: [ './home.style.scss' ],
    templateUrl: './home.template.html'
})
export class HomeComponent {

    db: firebase.firestore.Firestore;

    test: any;

    moment: any;

    constructor(private router: Router) {
        this.router = router;
    }

    public ngOnInit() {
        this.moment = moment;

        console.log("home");
        console.log(firebase.firestore());
        this.db = firebase.firestore();

        this.test = [];

        for (var i = 0; i < 50; i++) {
            var data = {
                index: i,
                map: {}
            };

            data.map["" + (i % 10)] = true;
            data.map["" + i] = true;
            if (i % 5) {
                data.map['mod5'] = true;
            }

            this.test.push(data);
        }
    }

    // mockData() {
    //     var shardCount = 10;

    //     var batch = this.db.batch();

    //     var format = "YYYY-MM-DD";

    //     var mockCounters = this.db.collection("mockCounters").doc(format);
    //     var metadataCol = mockCounters.collection("metadata");
        
    //     var today = moment();

    //     for (var i = 0; i < 180 * 2; i++) {
    //         var temp = today.clone().subtract(i, 'days');

    //         var metadataDoc = metadataCol.doc(temp.format(format));

    //         batch.set(metadataDoc, {
    //             shardCount: shardCount
    //         });
    //     }

    //     return batch.commit();
    // }

    mockData2() {
        const shardCount = 33;
        const poolSize = 1;

        var format = "YYYY-MM-DD";

        var mockCounters = this.db.collection("mockCounters").doc(format);
        // var metadataCol = mockCounters.collection("metadata");
        var shardsCol = mockCounters.collection("shards");
        
        var today = moment();

        var promiseFuncs = [];

        for (let i = 0; i < 180 * 2; i++) {
            let batch = this.db.batch();

            let temp = today.clone().subtract(i, 'days');

            for (let j = 0; j < shardCount; j++) {
                let metadataDoc = shardsCol.doc(temp.format(format) + "_" + j);

                batch.set(metadataDoc, {
                    count: 10000,
                    date: temp.format(format),
                    format: format,
                    shardNum: j
                });
            }

            promiseFuncs.push(() => {
                console.log(i, format, temp.format(format));
                return batch.commit();
            });
        }

        // Create a pool
        const promisePool = new PromisePool(() => {
            if (!promiseFuncs.length) {
                return null;
            }

            let promiseFunc = promiseFuncs.pop();

            return promiseFunc();
        }, poolSize);

        return promisePool.start();
    }

    generatedIDTest() {
        return this.db.collection('cities').add({
            name: 'Tokyo',
            country: 'Japan'
        });
    }

    presetBatchTest() {
        return this.batchTest(this.test);
    }

    // moo
    // readBatchTest(queries: any[]) {
    //     var batchTestCollection = this.db.collection("batch_test");

    //     queries = queries || [];

    //     for (var i = 0; i < queries.length; i++) {
    //         batchTestCollection = batchTestCollection.where("map." + queries[i], "==", true);
    //     }
    //     // .where("state", "==", "CA");

    //     return batchTestCollection.orderBy("index").get().then(snapshot => {
    //         snapshot.forEach(childSnapshot => {
    //             console.log(childSnapshot.data());
    //         })
    //     });
    // }

    batchTest(datas: any[]) {
        // Get a new write batch
        var batch = this.db.batch();

        var batchCollection = this.db.collection("batch_test");

        for (var i = 0; i < datas.length; i++) {
            var batchRef = batchCollection.doc("batch " + i);
            batch.set(batchRef, datas[i]);
        }

        return batch.commit().then(() => {
            console.log("batch complete");
        }).catch(error => {
            console.error(error);
        })
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

    tranLoopPool(count: number) {
        var promiseFuncs = [];
        var poolSize = 1;

        for (var i = 0; i < count; i++) {
            promiseFuncs.push(() => {
                this.tran();
            });
        }

        // Create a pool
        const promisePool = new PromisePool(() => {
            if (!promiseFuncs.length) {
                return null;
            }

            let promiseFunc = promiseFuncs.pop();

            return promiseFunc();
        }, poolSize);

        return promisePool.start().then(() => {
            console.log("loop pool done", count);
        }).catch(error => {
            console.error(error);
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

    // Cannot contain a forward slash (/)
    // Cannot solely consist of a single period (.) or double periods (..)
    // Cannot match the regular expression __.*__
    testID(id: string) {
        var weirdID = id || `id.\\@)(*&^%$#@!<>?:;"'[]{}-_=+`;
        var obj = {};
        obj[weirdID] = weirdID;
        var idTest = this.db.collection(weirdID).doc(weirdID).set(obj);
    }

    tran() {
        try {
            var docRef = this.db.collection("posts").doc("Test");
            var attemptRef = this.db.collection("attempts").doc("Test");
            return this.db.runTransaction((transaction => {
                return transaction.get(docRef).then(postSnapshot => {
                    var post = postSnapshot.data();

                    return transaction.get(attemptRef).then(attemptSnapshot => {
                        post.likeCount += 1;

                        var attempt = {};

                        attempt["" + Date.now()] = post;

                        console.log("attempt", attempt);
    
                        transaction.update(docRef, post);

                        if (attemptSnapshot.exists) {
                            transaction.update(attemptRef, attempt);
                        } else {
                            transaction.set(attemptRef, attempt);
                        }

                        return post;
                    });
                });
            })).then(post => {
                console.log("done", post);
            }).catch(error => {
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

        var test = {};
        
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
