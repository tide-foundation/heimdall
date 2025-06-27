import { Heimdall, windowType } from "../heimdall";
import { TideMemory } from "../wrapper";

interface HiddenInit{
    doken: string;
    dokenRefreshCallback: () => Promise<string> | undefined;
}

export class RequestEnclave extends Heimdall<RequestEnclave>{
    private doken: string;
    private dokenRefreshCallback: () => Promise<string> | undefined;

    _windowType: windowType = windowType.Hidden;

    private initDone: Promise<any> = this.recieve("init done");
    private requestEnclaveHidden: boolean = true;

    init(data: HiddenInit): RequestEnclave {
        if(!data.doken) throw 'Doken not provided';

        this.doken = data.doken;
        this.dokenRefreshCallback = data.dokenRefreshCallback;

        this.recieve("hidden enclave").then((data) => this.handleHiddenEnclaveResponse(data));

        this.open().then((success: boolean) => {
            if(success){
                this.send({
                    type: "init",
                    message: {
                        doken: this.doken
                    }
                });
            }else throw 'Error opening enclave';
        });

        return this;
    }

    async handleHiddenEnclaveResponse(data: any){
        if(data == "refresh doken" && this._windowType == windowType.Hidden){
            // looks like the hidden iframe has not allowed data to be stored on the browser OR the session key is mismatched with whats on the enclave vs doken
            // either way we gotta get a doken with the appropriate session key

            // Close the hidden enclave
            this.close();

            // We're now going to open the request enclave as a popup with the mismatched doken
            // The page should recognise the doken is mismatched, generate a new one, then await our requests
            this._windowType = windowType.Popup;
            this.requestEnclaveHidden = false;
            this.open().then((success: boolean) => {
                if(success){
                    this.send({
                        type: "init",
                        message:{
                            doken: this.doken
                        }
                    });
                }else throw 'Error opening enclave';
            })
        }

        this.recieve("hidden enclave").then((data) => this.handleHiddenEnclaveResponse(data));
    }

    getOrkUrl(): URL {
        // construct ork url
        const url = new URL(this.enclaveOrigin);

        // Set hidden status
        url.searchParams.set("hidden", this.requestEnclaveHidden ? "true" : "false");

        // Set vendor public
        url.searchParams.set("vendorId", this.vendorId);

        // Set client origin
        url.searchParams.set("origin", encodeURIComponent(window.location.origin));

        // Set client origin signature (by vendor)
        url.searchParams.set("originsig", encodeURIComponent(this.signed_client_origin));

        // Set voucher url
        url.searchParams.set("voucherURL", encodeURIComponent(this.voucherURL));

        // Set requestsed enclave
        url.searchParams.set("type", "request");

        return url;
    }

    async execute(data: TideMemory): Promise<Uint8Array[]>{
        await this.initDone;
        const pre_resp = this.recieve("sign request completed");
        this.send({
            type: "request",
            message:{
                flow: "sign",
                request: data,
            }
        })
        const resp = await pre_resp;
        if(!Array.isArray(resp)) throw 'Expecting request completed data to be an array, not' + resp;
        if(!resp.every((d: any) => d instanceof Uint8Array)) throw 'Expecting all entries in response to be Uint8Arrays';
        return resp;
    }
    async decrypt(data: decryptRequest): Promise<Uint8Array[]>{
        await this.initDone;
        const pre_resp = this.recieve("decrypt request completed");
        this.send({
            type: "request",
            message:{
                flow: "decrypt",
                request: data
            }
        })
        const resp = await pre_resp;
        if(!Array.isArray(resp)) throw 'Expecting request completed data to be an array, not' + resp;
        if(!resp.every((d: any) => d instanceof Uint8Array)) throw 'Expecting all entries in response to be Uint8Arrays';
        return resp;
    }
    async encrypt(data: encryptRequest): Promise<Uint8Array[]>{
        await this.initDone;
        const pre_resp = this.recieve("encrypt request completed");
        this.send({
            type: "request",
            message: {
                flow: "encrypt",
                request: data
            }
        })
        const resp = await pre_resp;
        if(!Array.isArray(resp)) throw 'Expecting request completed data to be an array, not' + resp;
        if(!resp.every((d: any) => d instanceof Uint8Array)) throw 'Expecting all entries in response to be Uint8Arrays';
        return resp;
    }

    async onerror(data: any) {
        if(typeof data.message === "string"){
            switch(data.message){
                case "expired":
                    if(!this.dokenRefreshCallback){
                        console.error("[HEIMDALL] Doken on enclave has expired but there is no Doken Refresh Callback registered");
                        return;
                    }
                    this.doken = await this.dokenRefreshCallback();
                    this.send({
                        type: "doken refresh",
                        message:{
                            doken: this.doken
                        }
                    });
                    break;
                default:
                    this.close();
                    throw new Error("[HEIMDALL] Recieved enclave error: " + data.message);
            }
        }
    }
}

interface decryptRequest{
    encrypted: Uint8Array;
    tags: string[]
}
interface encryptRequest{
    data: Uint8Array;
    tags: string[]
}