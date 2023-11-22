export class Heimdall{
    constructor(config: object);
    AddTideButton(tideButtonAction: function, actionParameter: any): HTMLButtonElement
    PerformTideAuth(callback: function): void
    GetUserInfo(promise: TidePromise): Promise<{
        responseType: string,
        PublicKey: string,
        UID: string,
        NewAccount: boolean
    }>
    GetCompleted(promise: TidePromise): Promise<{
        responseType: string,
        ModelSig: string,
        TideJWT: string
    }>
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
    CompleteSignIn(customModel: object = null): Promise<{
        responseType: string,
        ModelSig: string,
        TideJWT: string
    }>
    CloseEnclave(): void
}
export class TidePromise{
    constructor(callback: function = null);
    callback: function;
    promise: Promise;
    fulfill(value: any): void
}