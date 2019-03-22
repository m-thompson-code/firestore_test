import { Injectable } from '@angular/core';

import * as firebase from 'firebase/app';
import * as moment from 'moment';

declare var PromisePool: any;

@Injectable()
export class PromisePoolService {

    constructor() {
    }

    // TODO: string type promise funcs
    doPromiseFuncPool(promiseFuncs: any[], poolSize?: number, exitFunc?: any, callbackFunc?: any) {
        if (!promiseFuncs || !promiseFuncs.length) {
            return Promise.resolve(null);
        }

        // Create a pool
        const promisePool = new PromisePool(() => {
            if (exitFunc) {
                if (exitFunc()) {
                    return null;
                }
            }

            if (!promiseFuncs.length) {
                return null;
            }

            let promiseFunc = promiseFuncs.pop();

            return promiseFunc().then(result => {
                if (callbackFunc) {
                    return callbackFunc(result);
                }
            });
        }, poolSize || 1);
    
        // Wait for the pool to settle
        return promisePool.start();
    }

    // doPromiseFuncPool(promiseFuncs: any[], poolSize?: number, exitFunc?: any, callbackFunc?: any) {
    //     if (!promiseFuncs || !promiseFuncs.length) {
    //         return Promise.resolve(null);
    //     }

    //     // Create a pool
    //     const promisePool = new PromisePool(() => {
    //         if (exitFunc) {
    //             if (exitFunc()) {
    //                 return null;
    //             }
    //         }

    //         if (!promiseFuncs.length) {
    //             return null;
    //         }

    //         let promiseFunc = promiseFuncs.pop();

    //         // return promiseFunc().then(delay(1000)).then(result => {
    //         return promiseFunc().then(result => {
    //             if (callbackFunc) {
    //                 return callbackFunc(result);
    //             }
    //         });
    //     }, poolSize || 1);
    
    //     // Wait for the pool to settle
    //     return promisePool.start();
    // }
}
