import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import * as firebase from 'firebase/app';

@Component({
    selector: 'rr-counters',
    styleUrls: [ './counters.style.scss' ],
    templateUrl: './counters.template.html',
    providers: [ ]
})

// https://firebase.google.com/docs/firestore/solutions/counters

export class CountersComponent {

    counterRef: any;
    db: firebase.firestore.Firestore;;

    constructor() {
    }

    ngOnInit() {
        this.db = firebase.firestore();

        this.countersDocRef = this.db.collection('test').doc('distCounters');
        this.networksColRef = this.countersDocRef.collection('networks');

        this.networksCountersDocRef = countersDocRef.doc("networkCounters");

        this.networksRef = this.systemDoc.collection('networks');
        this.networksRef = this.systemDoc.collection('networks');
    }

    addNetwork(networkID: string, networkText: string) {
        return db.runTransaction(t => {
            var promises = [];

            // Handle dist counters
            promises.push(t.get(this.networksCountersDocRef).then(networksCountersDoc => {
                const shardCount = networksCountersDoc.shardCount;

                const rndShardID = Math.floor(Math.random() * shardCount).toString();

                const rndShardDocRef = this.networksCountersDocRef.collection('shards').doc(shard_id);

                return t.get(rndShardDocRef).then(doc => {
                    if (doc.exists) {
                        const newCount = (doc.data().count || 0) + 1;
                        t.set(rndShardDocRef, { count: newCount });
                    } else {
                        t.set(rndShardDocRef, { count: 1 });
                    }
                });
            }));

            promises.push(t.get(this.networksCountersDocRef).then(networksCountersDoc => {
                const shardCount = networksCountersDoc.shardCount;

                const rndShardID = Math.floor(Math.random() * shardCount).toString();

                const rndShardDocRef = this.networksCountersDocRef.collection('shards').doc(shard_id);

                return t.get(rndShardDocRef).then(doc => {
                    if (doc.exists) {
                        const newCount = (doc.data().count || 0) + 1;
                        t.set(rndShardDocRef, { count: newCount });
                    } else {
                        t.set(rndShardDocRef, { count: 1 });
                    }
                });
            }));

            return Promise.all(promises).then(() => {
                console.log("addNetwork completed", networkID, networkText);
            });

            const networksCounterRef = this.networkCountersDoc.collection('shards').doc(shard_id);
            this.systemDoc = ref.
        });
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