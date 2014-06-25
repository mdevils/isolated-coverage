declare module 'vow' {
    export class Promise {
        then(onFulfilled: Function, onRejected?: Function, onNotified?: Function): Promise;
        done(onFulfilled?: Function, onRejected?: Function, onNotified?: Function): Promise;
        always(): Promise;
        valueOf(): any;
        isResolved(): boolean;
        isFulfilled(): boolean;
        isRejected(): boolean;
        'catch'(onRejected: Function, ctx?: Object): Promise;
        fail(onRejected: Function, ctx?: Object): Promise;
        always(onResolved: Function, ctx?: Object): Promise;
        progress(onProgress: Function, ctx?: Object): Promise;
        spread(onFulfilled: Function, onRejected?: Function, ctx?: Object): Promise;
        delay(delay: number): Promise;
        timeout(delay: number): Promise;
    }

    export class Deferred {
        promise(): Promise;
        resolve(value: any): void;
        reject(error: Error): void;
        notify(value: any): void;
    }

    export function when(
        value: any,
        onFulfilled?: Function,
        onRejected?: Function,
        onProgress?: Function,
        ctx?: Object
        ): Promise;
    export function cast(value: any): Promise;
    export function all(promises: Promise[]): Promise;
    export function any(promises: Promise[]): Promise;
    export function anyResolved(promises: Promise[]): Promise;
    export function allResolved(promises: Promise[]): Promise;
    export function allPatiently(promises: Promise[]): Promise;
    export function race(promises: Promise[]): Promise;
    export function resolve(value: any): Promise;
    export function reject(error: Error): Promise;
    export function fail(error: Error, onRejected?: Function, ctx?: Object): Promise;
    export function always(value: any, onProgress: Function, ctx?: Object): Promise;
    export function spread(value: any, onFulfilled?: Function, onRejected?: Function, ctx?: Object): Promise;
    export function isPromise(value: any): boolean;
    export function valueOf(value: any): any;
    export function isResolved(value: any): boolean;
    export function isFulfilled(value: any): boolean;
    export function isRejected(value: any): boolean;
    export function invoke(callback: Function, ...args: any[]): Promise;
    export function delay(value: any, delay: number): Promise;
    export function timeout(value: any, timeout: number): Promise;

    export function defer(): Deferred;
}
