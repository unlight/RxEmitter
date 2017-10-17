import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/observer';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import 'rxjs/add/operator/first';
import 'rxjs/add/operator/take';

/**
* RxJs + EventBus
*
*
* @langversion TypeScript 2.0
* @tiptext
*
*/
export class RxEmitter {

    static cache: any = {};

    static on<T>(eventName: string, target?: any): Observable<T> {
        const exists = this.has(eventName);
        this.createChache<T>(eventName);
        if (target !== undefined) {
            this.cache[eventName].targets.push(target);
        }
        if (!exists) {
            const subject = this.cache[eventName].subject as Observable<any>;
            return subject.skip(1);
        }
        return this.cache[eventName].subject;
    }

    static one<T>(eventName: string, target?: any): Observable<T> {
        return this.on(eventName, target).take(1);
    }

    static emit<T>(eventName: string, ...rest: T[]): string {
        this.createChache<T>(eventName);
        const value = (rest.length === 1) ? rest[0] : rest;
        this.cache[eventName].subject.next(value);
        return this.cache[eventName].target;
    }

    static has(eventName: string): boolean {
        return !!this.cache[eventName];
    }

    static get(eventName: string): any {
        return this.cache[eventName];
    }

    static getByTarget(target: any, eventName?: string): ICacheObj<any>[] {
        let caches: ICacheObj<any>[] = [];

        for (let key in this.cache) {
            let cache: ICacheObj<any> = this.cache[key];

            if (cache.targets.indexOf(target) > -1) {
                if (eventName) {
                    if (eventName == cache.eventName) caches.push(cache);
                } else {
                    caches.push(cache);
                }
            }
        }

        return caches;
    }

    static off(eventName: string): any {
        if (this.cache[eventName]) {
            for (let key in this.cache[eventName]) {
                if (key == 'targets') this.cache[eventName][key].length = 0;
                delete this.cache[eventName][key];
            }
        }

        delete this.cache[eventName];
    }

    static unsubscribe(target: any, eventName?: string) {
        let cache: ICacheObj<any>[] = this.getByTarget(target, eventName);

        for (let i: number = 0; i < cache.length; i++) {
            cache[i].subscription && cache[i].subscription.unsubscribe();
        }
    }

    static offAllByTarget(target: any) {
        try {
            this.offByTarget(target);
            this.unsubscribe(target);
        } catch (e) {
        }
    }

    static offByTarget(target: any) {
        for (let key in this.cache) {
            let cache: ICacheObj<any> = this.cache[key];
            if (cache.targets.indexOf(target)) delete this.cache[key];
        }
    }

    static offAll(eventName?: string): void {
        if (!eventName) {
            for (let key in this.cache) delete this.cache[key];
        } else {
            delete (this.cache[eventName]);
        }
    }

    /** 
    * create cache at emit time 
    * eventName ->  subject
    */
    private static createChache<T>(eventName: string): ICacheObj<T> {
        if (!this.cache[eventName]) {
            this.cache[eventName] = <ICacheObj<T>>{};
            this.cache[eventName].id = guid();
            this.cache[eventName].targets = [];
            this.cache[eventName].eventName = eventName;
            this.cache[eventName].subject = new BehaviorSubject(undefined);
        }

        return this.cache[eventName];
    }
}

export interface ICacheObj<T> {
    subject?: Subject<T>;
    eventName?: string;
    id?: any;
    target?: any;
    targets?: any[];
    callback?: (...rest: any[]) => any;
    subscription?: Subscription;
}

function guid(): string {
    return 'xxxxxx-xxxx-4xxx-yxxx-xxxxxx'.
        replace(/[xy]/g, c => { let r = Math.random() * 16 | 0, v = c == 'x' ? r : r & 0x3 | 0x8; return v.toString(16); });
}