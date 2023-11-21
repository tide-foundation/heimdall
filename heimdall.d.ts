export class Heimdall{
    constructor(config: object);
    OpenEnclave(): Promise<{
        responseType: string,
        ModelSig: string,
        TideJWT: string
    } | {
        responseType: string,
        PublicKey: string,
        UID: string,
        NewAccount: boolean
    }>
    CompleteSignIn(modelToSign: string = null): Promise<{
        responseType: string,
        ModelSig: string,
        TideJWT: string
    }>
    CloseEnclave(): void
}
export class TidePromise{
    constructor(callback: function);
    callback: function;
    promise: Promise;
    fulfill(value: any): void
}