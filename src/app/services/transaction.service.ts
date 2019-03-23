import { Injectable } from '@angular/core';

import * as firebase from 'firebase/app';
import * as moment from 'moment';

// declare var PromisePool: any;

import { PromisePoolService } from '@app/services/promisePool.service';

@Injectable()
export class TransactionService {
    test: boolean;

    db: firebase.firestore.Firestore;
    testDB: firebase.firestore.DocumentReference;

    shardCount: number;

    constructor(private promisePoolService: PromisePoolService) {
        this.db = firebase.firestore();
        this.testDB = this.db.collection('test').doc('test');

        this.shardCount = 10;
    }

    // TODO: strong type gets
    // TODO: strong type runTransaction
    runTransaction(gets: any): Promise<any> {
        // var gets = [];

        // let getMoo = {
        //     docRef: lightNetworkDocRefMoo,
        //     counterData: {
        //         docRef: networkCountersMetadataDocRef,
        //         metadata: null
        //     }
        //     // onExists: {
        //     //     // counters: [
        //     //     //     metadataRef
        //     //     // ]
        //     // },
        //     onNone: {
        //         counterTasks: [
        //             {
        //                 counterBaseColRef: 'TODO'
        //                 counterChangeType: 'inc'
        //             }
        //         ]
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

        // gets.push(get);

        return this.db.runTransaction(t => {
            let writes = [];
            let getPromiseFuncs = [];
            let counterGetPromiseFuncs = [];

            for (let i = 0; i < gets.length; i++) {
                const get = gets[i];


                for (let j = 0; j < get.writes.length; j++) {
                    writes.push(get.writes[j]);
                }

                // Check if docRef
                getPromiseFuncs.push(() => {
                    return t.get(get.docRef).then(docSnapshot => {
                        if (docSnapshot.exists) {
                            console.log("did exist");

                            // TODO: Handle exists
                            if (get.onExists) {
                                if (get.onExists.counterTasks) {
                                    for (let k = 0; k < get.onExists.counterTasks.length; k++) {
                                        const baseColRef = this.testDB.collection('network_counters');
                                        // handle if inc/dec etc
                                        let counterStuff = this.getIncCounterStuff(t, writes, null, baseColRef);

                                        for (let l = 0; l < counterStuff.length; l++) {
                                            counterGetPromiseFuncs.push(counterStuff[l]);
                                        }
                                    }
                                }
                            }
                        } else {
                            // TODO: Handle doesn't exists
                            if (get.onNone) {
                                console.log("didn't exist");

                                if (get.onNone.counterTasks) {
                                    for (let k = 0; k < get.onNone.counterTasks.length; k++) {
                                        const baseColRef = this.testDB.collection('network_counters');
                                        // handle if inc/dec etc
                                        let counterStuff = this.getIncCounterStuff(t, writes, null, baseColRef);
                                        console.log(counterStuff);
                                        for (let l = 0; l < counterStuff.length; l++) {
                                            counterGetPromiseFuncs.push(counterStuff[l]);
                                        }
                                    }
                                }
                            }
                        }
                    }).catch(error => {
                        console.error(error);
                        throw error;
                    });
                });
            }

            return this.promisePoolService.doPromiseFuncPool(getPromiseFuncs, 8).then(() => {
                console.log(writes);
                return this.promisePoolService.doPromiseFuncPool(counterGetPromiseFuncs, 8).then(() => {
                    return this.handleTransactionWrites(t, writes);
                }).catch(error => {
                    console.error(error);
                    throw error;
                });
            }).catch(error => {
                console.error(error);
                throw error;
            });
        }).catch(error => {
            console.error(error);
            throw error;
        });
    }

    getIncCounterStuff(t, writes, timeStr?: string, baseColRef) {
        let counterPromiseFuncs = [];

        var momentObj = moment(timeStr || undefined);

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

        for (let format of Object.keys(timeData || {})) {
            const timeFormat = timeData[format]['format'];
            const timeStr = timeData[format]['str'];

            // Select a shard of the counter at random
            const shard_id = "" + Math.floor(Math.random() * this.shardCount);
            // const shard_col_ref = this.testDB.collection('network_counters').doc(timeFormat).collection('counter_shards');

            // this.testDB.collection('network_counters')

            const shard_col_ref = baseColRef.doc(timeFormat).collection('counter_shards');
            const shard_doc_ref = shard_col_ref.doc(`${timeStr}_${shard_id}`);

            let counterPromiseFunc = (() => {
                console.log(timeStr);
                return t.get(shard_doc_ref).then(shardDocSnapshot => {
                    const oldCount = shardDocSnapshot.exists && shardDocSnapshot.data().count || 0;

                    writes.push({
                        writeMethod: 'set', 
                        docRef: shard_doc_ref, 
                        data: {
                            count: oldCount + 1,
                            timeStr: timeStr
                        }
                    });
                    console.log(writes);
                });
            });

            counterPromiseFuncs.push(counterPromiseFunc);
        }

        return counterPromiseFuncs;


        // return {
        //     counterPromiseFuncs: counterPromiseFuncs,
        //     writes: writes
        // }
    }

    handleTransactionWrites(transaction: firebase.firestore.Transaction, writes: any[]): void {
        if (!transaction) {
            const msg = `Unexpected missing firestore transaction: ${transaction}`;
            console.error(msg);
            throw {message: msg};
        }

        if (!writes || !writes.length) {
            const msg = `Unexpected writes: ${writes}`;
            console.error(msg);
            throw {message: msg};
        }

        for (let i = 0; i < writes.length; i++) {
            const write = writes[i];

            const writeMethod: string = write.writeMethod;
            const docRef: firebase.firestore.DocumentReference = write.docRef;
            const data: any = write.data;// TODO: strong type?
            // const options: firebase.firestore.DocumentReference = write.options;// TODO: will we need this?

            if (writeMethod === 'set') {
                transaction.set(write.docRef, write.data);
            } else if (writeMethod === 'update') {
                transaction.update(write[i].docRef, write.data);
            } else if (writeMethod === 'delete') {
                transaction.delete(write[i].docRef);
            } else {
                const msg = `unexpected writeMethod ${write.writeMethod}`;
                console.error(msg);
                throw {message: msg};
            }
        }
    }
}
