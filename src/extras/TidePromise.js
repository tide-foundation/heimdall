export class TidePromise {
    constructor(callback=null) {
        this.promise = new Promise((resolve, reject) => {
            // Store the resolve function to be called later
            this.resolve = resolve;
            this.reject = reject;
        });
        this.callback = callback
    }

    fulfill(value) {
        // Fulfill the promise with the provided value
        this.resolve(value);
    }

    reject(error) {
        this.reject(error);
    }
}