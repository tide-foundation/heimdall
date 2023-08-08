export default class Heimdall{
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
    CompleteSignIn(modelToSign: string): Promise<{
        responseType: string,
        ModelSig: string,
        TideJWT: string
    }>
}