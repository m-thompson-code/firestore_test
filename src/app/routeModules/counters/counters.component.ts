import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import * as firebase from 'firebase/app';

import * as moment from 'moment';

// declare var PromisePool: any;

// import { PromisePoolService } from '../../services/promisePool.service';
import { PromisePoolService } from '@app/services/promisePool.service';
import { TransactionService } from '@app/services/transaction.service';

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

    constructor(private promisePoolService: PromisePoolService, private transactionService: TransactionService) {
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

    getID() {
        const networks_col_ref = this.testDB.collection('networks');
        const networks_doc_ref = this.testDB.collection('networks').doc();

        const id = networks_doc_ref.id;
        console.log(id);

        return id;
    }

    incrementCounter2(networkID: string, timeStr?: string) {
        var momentObj = moment(timeStr || undefined);

        let writes = [];

        let networkSource = ({
            title: 'title_' + networkID,
            otherMetadata: 'otherMetadata_' + networkID + "_" + Date.now(),
            writeType: 'undefined str',
            updatedAt: momentObj.valueOf(),
            createdAt: 1550000000000 || momentObj.valueOf()
        } as any);

        let lightNetworkSource = {
            title: networkSource.title,
            updatedAt: momentObj.valueOf()// TODO: remove this
        };

        if (!networkID) {
            console.error("Unexpected missing networkID", networkID);
            return Promise.resolve(null);
        }

        var writeType = null;

        const lightNetworkDocRef = this.testDB.collection('light_networks').doc(networkID);
        const networkDocRef = this.testDB.collection('networks').doc(networkID);

        var gets = [];

        var get = {
            docRef: lightNetworkDocRef,
            // onExists: {
            //     // counters: [
            //     //     metadataRef
            //     // ]
            // },
            // onNone: {

            // },
            writes: [
                {
                    writeMethod: 'set', 
                    docRef: lightNetworkDocRef, 
                    data: lightNetworkSource
                },
                {
                    writeMethod: 'set', 
                    docRef: networkDocRef, 
                    data: networkSource
                }
            ]
        };

        gets.push(get);


        

        for (let moo = 0; moo < 100; moo++) {
            const lightNetworkDocRefMoo = this.testDB.collection('light_networks').doc(networkID + "moo" + moo);
            const networkDocRefMoo = this.testDB.collection('networks').doc(networkID + "moo" + moo);
            const networkCountersMetadataDocRef = this.testDB.collection('counter_metadatas').doc('networks');

            let getMoos = [];

            // let getMoo = {
            //     docRef: lightNetworkDocRefMoo,
            //     counterData: {
            //         docRef: networkCountersMetadataDocRef,
            //         metadata: null
            //     },
            //     // onExists: {
            //     //     // counters: [
            //     //     //     metadataRef
            //     //     // ]
            //     // },
            //     onNone: {

            //     },
            //     writes: [
            //         {
            //             writeMethod: 'set', 
            //             docRef: lightNetworkDocRefMoo, 
            //             data: lightNetworkSource
            //         },
            //         {
            //             writeMethod: 'set', 
            //             docRef: networkDocRefMoo, 
            //             data: networkSource
            //         }
            //     ]
            // };

            let getMoo = {
                docRef: lightNetworkDocRefMoo,
                // onExists: {
                //     // counters: [
                //     //     metadataRef
                //     // ]
                // },
                onNone: {
                    counterTasks: [
                        {
                            counterBaseColRef: 'TODO',
                            counterChangeType: 'inc'
                        }
                    ]
                },
                writes: [
                    {
                        writeMethod: 'set', 
                        docRef: lightNetworkDocRefMoo, 
                        data: lightNetworkSource
                    },
                    {
                        writeMethod: 'set', 
                        docRef: networkDocRefMoo, 
                        data: networkSource
                    }
                ]
            };

            getMoos.push(getMoo);
        }

        this.transactionService.runTransaction(getMoos).then(() => {
            console.log("did it", moo);
        }).catch(error => {
            console.error(error);
            throw error;
        });
        
        // return this.transactionService.runTransaction(gets).then(() => {
        //     console.log("did it");
        // }).catch(error => {
        //     console.error(error);
        //     throw error;
        // });

            // return t.get(lightNetworkDocRef).then(lightNetworkDocSnapshot => {
            //     if (lightNetworkDocSnapshot.exists) {
            //         const oldLightNetworkDoc = lightNetworkDocSnapshot.data();

            //         writeType = 'update';

            //         console.log("update");

            //         networkSource.writeType = 'update';

            //     } else {
            //         writeType = 'add';

            //         console.log("add");

            //         networkSource.writeType = 'add';
            //     }

            // });

        /*
        let shard_metadatas = {
            'system': undefined
        };

        let timeData = {
            'all': {
                format: 'all',
                str: 'all'
            },
            'YYYY-MM-DD': {
                format: 'YYYY-MM-DD',
                str: undefined
            },
            'YYYY-MM': {
                format: 'YYYY-MM',
                str: undefined
            }
        }

        timeData['YYYY-MM-DD'].str = momentObj.format('YYYY-MM-DD');
        timeData['YYYY-MM'].str = momentObj.format('YYYY-MM');

        let errors = [];

        let counterMetadataPromiseFuncs = [];

        let counterMetadataPromiseFunc = (() => {
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

        counterMetadataPromiseFuncs.push(counterMetadataPromiseFunc);
        
        // get shard metadatas
        return this.promisePoolService.doPromiseFuncPool(counterMetadataPromiseFuncs, 8).then(() => {
            console.log(shard_metadatas);

            // TODO: Validate request based off of max(s)
            return db.runTransaction(t => {
                let setPromiseFuncs = [];

                const shard_col_ref = this.testDB.collection('network_counters').doc(timeFormat).collection('counter_shards');
                const shard_doc_ref = shard_col_ref.doc(`${timeStr}_${shard_id}`);

                let counterPromiseFuncs = [];

                for (let format of Object.keys(timeData || {})) {
                    const timeFormat = timeData[format]['format'];
                    const timeStr = timeData[format]['str'];

                    // Select a shard of the counter at random
                    const shard_id = "" + Math.floor(Math.random() * shard_metadatas['system']['shardCount']);
                    const shard_col_ref = this.testDB.collection('network_counters').doc(timeFormat).collection('counter_shards');
                    const shard_doc_ref = shard_col_ref.doc(`${timeStr}_${shard_id}`);

                    let counterPromiseFunc = (() => {
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

                    counterPromiseFuncs.push(counterPromiseFunc);
                }

                return this.promisePoolService.doPromiseFuncPool(counterPromiseFuncs, 8).then(() => {
                    console.log(writes);

                    for (let i = 0; i < writes.length; i++) {
                        if (writes[i].writeType === 'set') {
                            t.set(writes[i].docRef, writes[i].docObj);
                        }
                    }
                });
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
        // });*/
    }

    checkStuff() {
        var lightNetworks = 0;
        var networkCounter = 0;

        this.testDB.collection('light_networks').get().then(colSnapshot => {
            colSnapshot.forEach(docSnapshot => {
                lightNetworks += 1;
            });

            console.log(lightNetworks);
        });
        this.testDB.collection('network_counters').doc('all').collection('counter_shards').get().then(colSnapshot => {
            colSnapshot.forEach(docSnapshot => {
                networkCounter += docSnapshot.data().count;
            });

            console.log(networkCounter);
        });
    }

    incrementCounter(networkID: string, timeStr?: string) {
        var momentObj = moment(timeStr || undefined);

        let writes = [];

        var db = firebase.firestore();//this.db;

        let networkSource = ({
            title: 'title_' + networkID,
            otherMetadata: 'otherMetadata_' + networkID + "_" + Date.now(),
            writeType: 'undefined str',
            updatedAt: momentObj.valueOf(),
            createdAt: 1550000000000 || momentObj.valueOf()
        } as any);

        let lightNetworkSource = {
            title: networkSource.title,
            updatedAt: momentObj.valueOf()// TODO: remove this
        };

        if (!networkID) {
            console.error("Unexpected missing networkID", networkID);
            return Promise.resolve(null);
        }

        var writeType = null;

        const lightNetworkDocRef = this.testDB.collection('light_networks').doc(networkID);
        const networkDocRef = this.testDB.collection('networks').doc(networkID);

        return db.runTransaction(t => {
            return t.get(lightNetworkDocRef).then(lightNetworkDocSnapshot => {
                if (lightNetworkDocSnapshot.exists) {
                    const oldLightNetworkDoc = lightNetworkDocSnapshot.data();

                    writeType = 'update';

                    console.log("update");

                    networkSource.writeType = 'update';

                    writes.push({
                        writeType: 'set', 
                        docRef: lightNetworkDocRef, 
                        docObj: lightNetworkSource
                    });
                } else {
                    writeType = 'add';

                    console.log("add");

                    networkSource.writeType = 'add';

                    writes.push({
                        writeType: 'set', 
                        docRef: lightNetworkDocRef, 
                        docObj: lightNetworkSource
                    });
                }

                writes.push({
                    writeType: 'set', 
                    docRef: networkDocRef, 
                    docObj: networkSource
                });

                for (let i = 0; i < writes.length; i++) {
                    if (writes[i].writeType === 'set') {
                        t.set(writes[i].docRef, writes[i].docObj);
                    } else {
                        console.error(`unexpected writeType ${writes[i].writeType}`);
                        throw {message: `unexpected writeType ${writes[i].writeType}`};
                    }
                }
            });
        });
        /*
        let shard_metadatas = {
            'system': undefined
        };

        let timeData = {
            'all': {
                format: 'all',
                str: 'all'
            },
            'YYYY-MM-DD': {
                format: 'YYYY-MM-DD',
                str: undefined
            },
            'YYYY-MM': {
                format: 'YYYY-MM',
                str: undefined
            }
        }

        timeData['YYYY-MM-DD'].str = momentObj.format('YYYY-MM-DD');
        timeData['YYYY-MM'].str = momentObj.format('YYYY-MM');

        let errors = [];

        let counterMetadataPromiseFuncs = [];

        let counterMetadataPromiseFunc = (() => {
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

        counterMetadataPromiseFuncs.push(counterMetadataPromiseFunc);
        
        // get shard metadatas
        return this.promisePoolService.doPromiseFuncPool(counterMetadataPromiseFuncs, 8).then(() => {
            console.log(shard_metadatas);

            // TODO: Validate request based off of max(s)
            return db.runTransaction(t => {
                let setPromiseFuncs = [];

                const shard_col_ref = this.testDB.collection('network_counters').doc(timeFormat).collection('counter_shards');
                const shard_doc_ref = shard_col_ref.doc(`${timeStr}_${shard_id}`);

                let counterPromiseFuncs = [];

                for (let format of Object.keys(timeData || {})) {
                    const timeFormat = timeData[format]['format'];
                    const timeStr = timeData[format]['str'];

                    // Select a shard of the counter at random
                    const shard_id = "" + Math.floor(Math.random() * shard_metadatas['system']['shardCount']);
                    const shard_col_ref = this.testDB.collection('network_counters').doc(timeFormat).collection('counter_shards');
                    const shard_doc_ref = shard_col_ref.doc(`${timeStr}_${shard_id}`);

                    let counterPromiseFunc = (() => {
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

                    counterPromiseFuncs.push(counterPromiseFunc);
                }

                return this.promisePoolService.doPromiseFuncPool(counterPromiseFuncs, 8).then(() => {
                    console.log(writes);

                    for (let i = 0; i < writes.length; i++) {
                        if (writes[i].writeType === 'set') {
                            t.set(writes[i].docRef, writes[i].docObj);
                        }
                    }
                });
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
        // });*/
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
