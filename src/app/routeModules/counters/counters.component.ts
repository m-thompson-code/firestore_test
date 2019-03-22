import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import * as firebase from 'firebase/app';

import * as moment from 'moment';

// declare var PromisePool: any;

// import { PromisePoolService } from '../../services/promisePool.service';
import { PromisePoolService } from '@app/services/promisePool.service';

@Component({
    selector: 'rr-counters',
    styleUrls: [ './counters.style.scss' ],
    templateUrl: './counters.template.html',
    providers: [ ]
})

// https://firebase.google.com/docs/firestore/solutions/counters

export class CountersComponent {

    counterRef: any;
    db: firebase.firestore.Firestore;
    testDB: firebase.firestore.DocumentReference;

    moment: any;

    constructor(private promisePoolService: PromisePoolService) {
    }

    ngOnInit() {
        this.moment = moment;

        this.db = firebase.firestore();

        this.testDB = this.db.collection('test').doc('test');

        // this.countersDocRef = this.db.collection('test').doc('distCounters');
        // this.networksColRef = this.countersDocRef.collection('networks');

        // this.networksCountersDocRef = countersDocRef.doc("networkCounters");

        // this.networksRef = this.systemDoc.collection('networks');
    }

    // addNetwork(networkID: string, networkText: string) {
    //     return db.runTransaction(t => {
    //         var promises = [];

    //         // Handle dist counters
    //         promises.push(t.get(this.networksCountersDocRef).then(networksCountersDoc => {
    //             const shardCount = networksCountersDoc.shardCount;

    //             const rndShardID = Math.floor(Math.random() * shardCount).toString();

    //             const rndShardDocRef = this.networksCountersDocRef.collection('shards').doc(shard_id);

    //             return t.get(rndShardDocRef).then(doc => {
    //                 if (doc.exists) {
    //                     const newCount = (doc.data().count || 0) + 1;
    //                     t.set(rndShardDocRef, { count: newCount });
    //                 } else {
    //                     t.set(rndShardDocRef, { count: 1 });
    //                 }
    //             });
    //         }));

    //         promises.push(t.get(this.networksCountersDocRef).then(networksCountersDoc => {
    //             const shardCount = networksCountersDoc.shardCount;

    //             const rndShardID = Math.floor(Math.random() * shardCount).toString();

    //             const rndShardDocRef = this.networksCountersDocRef.collection('shards').doc(shard_id);

    //             return t.get(rndShardDocRef).then(doc => {
    //                 if (doc.exists) {
    //                     const newCount = (doc.data().count || 0) + 1;
    //                     t.set(rndShardDocRef, { count: newCount });
    //                 } else {
    //                     t.set(rndShardDocRef, { count: 1 });
    //                 }
    //             });
    //         }));

    //         return Promise.all(promises).then(() => {
    //             console.log("addNetwork completed", networkID, networkText);
    //         });

    //         const networksCounterRef = this.networkCountersDoc.collection('shards').doc(shard_id);
    //         // this.systemDoc = ref.
    //     });
    //     // Select a shard of the counter at random
    //     const shard_id = Math.floor(Math.random() * num_shards).toString();
    //     const shard_ref = ref.collection('shards').doc(shard_id);

    //     // Update count in a transaction
    //     return db.runTransaction(t => {
    //         return t.get(shard_ref).then(doc => {
    //             const new_count = doc.data().count + 1;
    //             t.update(shard_ref, { count: new_count });
    //         });
    //     });
    // }
    // incrementCounter(db, ref, num_shards) {

    setSystemNetworkCounterMetadata(shardCount: number, max: number) {
        var batch = this.db.batch();

        var counterMetadatasColRef = this.testDB.collection('counter_metadatas');

        // let timeData = [
        //     'all',
        //     'YYYY-MM-DD',
        //     'YYYY-MM'
        // ];

        // for (let i = 0; i < timeData.length; i++) {
        //     let timeType = timeData[i];

            let counterMetadatasDocRef = counterMetadatasColRef.doc('networks');

            batch.set(counterMetadatasDocRef, {
                shardCount: shardCount,
                max: max
            });
        // }

        return batch.commit().then(() => {
            console.log(`setSystemNetworkCounterMetadata completed: shardCount: ${shardCount}, max: ${max}`);
        }).catch(error => {
            console.error(error);
            throw error;
        });
    }

    incrementCounter(timeStr?: string) {
        var momentObj = moment(timeStr || undefined);

        var db = firebase.firestore();//this.db;

        let shard_metadatas = {
            'system': null
        };

        let timeData = {
            'all': {
                format: 'all',
                str: 'all'
            },
            'YYYY-MM-DD': {
                format: 'YYYY-MM-DD'
            },
            'YYYY-MM': {
                format: 'YYYY-MM'
            }
        }

        timeData['YYYY-MM-DD'].str = momentObj.format('YYYY-MM-DD');
        timeData['YYYY-MM'].str = momentObj.format('YYYY-MM');

        let errors = [];

        let promiseFuncs = [];

        let promiseFunc = (() => {
            if (errors.length) {
                console.warn("Exit early since there are errors");
                return Promise.resolve(null);
            }

            return this.testDB.collection('counter_metadatas').doc('networks').get().then(metadatasDocSnapshot => {
                if (metadatasDocSnapshot.exists) {
                    shard_metadatas['system'] = metadatasDocSnapshot.data();
                } else {
                    console.error("Unexpected missing metadata");
                    shard_metadatas['system'] = null;

                    errors.push({message: "Unexpected missing metadata", data: {}});
                }
                
            }).catch(error => {
                console.error(error);
                errors.push(error);
                throw error;
            });
        });

        promiseFuncs.push(promiseFunc);
        
        // get shard metadatas
        return this.promisePoolService.doPromiseFuncPool(promiseFuncs, 8).then(() => {
            console.log(shard_metadatas);

            // TODO: Validate request based off of max(s)
            return db.runTransaction(t => {
                let writes = [];

                let tPromiseFuncs = [];

                for (let format of Object.keys(timeData || {})) {
                    const timeFormat = timeData[format]['format'];
                    const timeStr = timeData[format]['str'];

                    // Select a shard of the counter at random
                    const shard_id = "" + Math.floor(Math.random() * shard_metadatas['system']['shardCount']);
                    const shard_col_ref = this.testDB.collection('network_counters').doc(timeFormat).collection('counter_shards');
                    const shard_doc_ref = shard_col_ref.doc(`${timeStr}_${shard_id}`);

                    let tPromiseFunc = (() => {
                        return t.get(shard_doc_ref).then(shardDocSnapshot => {
                            const oldCount = shardDocSnapshot.exists && shardDocSnapshot.data().count || 0;

                            writes.push({
                                writeType: 'set', 
                                docRef: shard_doc_ref, 
                                docObj: {
                                    count: oldCount + 1,
                                    timeStr: timeStr
                                }
                            });
                        });
                    }).bind(this);

                    tPromiseFuncs.push(tPromiseFunc);
                }

                return this.promisePoolService.doPromiseFuncPool(tPromiseFuncs, 8).then(() => {
                    console.log(writes);

                    for (let i = 0; i < writes.length; i++) {
                        if (writes[i].writeType === 'set') {
                            t.set(writes[i].docRef, writes[i].docObj);
                        }
                    }
                });

                // for (let i = 0; i < writes.length; i++) {
                //     if (writes[i].writeType === 'set') {
                //         t.set(writes[i].docRef, writes[i].docObj);
                //     }
                // }
            });
            

            // // Select a shard of the counter at random
            // const shard_id = Math.floor(Math.random() * shard_metadatas['system']['shardCount']).toString();
            // const shard_col_ref = this.testDB.collection('network_counters').doc();
            // const shard_doc_ref = shard_col_ref.doc(shard_id);

            // // Update count in a transaction
            // return db.runTransaction(t => {
            //     return t.get(shard_doc_ref).then(collectionSnapshot => {
            //         collectionSnapshot.forEach(docSnapshot => {
            //             console.log(docSnapshot.data());
            //         });

            //         // const old_count = doc.exists && doc.data().count || 0;

            //         // const new_count = old_count + 1;
            //         // t.update(shard_ref, { count: new_count });
            //         return 'moo';
            //     });
            // });
        });

        // // Select a shard of the counter at random
        // const shard_id = Math.floor(Math.random() * shard_metadatas['system']['shardCount']).toString();
        // const shard_col_ref = this.testDB.collection('network_counters').doc()
        // const shard_doc_ref = shard_col_ref.doc(shard_id);

        // // Update count in a transaction
        // return db.runTransaction(t => {
        //     return t.get(shard_doc_ref).then(collectionSnapshot => {
        //         collectionSnapshot.forEach(docSnapshot => {
        //             console.log(docSnapshot.data());
        //         });

        //         // const old_count = doc.exists && doc.data().count || 0;

        //         // const new_count = old_count + 1;
        //         // t.update(shard_ref, { count: new_count });
        //         return 'moo';
        //     });
        // });
    }

    // getCountSum(colSnapshot: firebase.firestore.QuerySnapshot) {
    //     var count = 0;

    //     colSnapshot.forEach(docSnapshot => {
    //         count += docSnapshot.data().count;
    //     });
    // }
}



/*
    {
        "num_shards": NUM_SHARDS,
        "shards": [subcollection]
    }

    function incrementCounter(db, ref, num_shards) {
        // Select a shard of the counter at random
        const shard_id = Math.floor(Math.random() * num_shards).toString();
        const shard_ref = ref.collection('shards').doc(shard_id);

        // Update count in a transaction
        return db.runTransaction(t => {
            return t.get(shard_ref).then(doc => {
                const new_count = doc.data().count + 1;
                t.update(shard_ref, { count: new_count });
            });
        });
    }
*/
