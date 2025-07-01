import { Heimdall, windowType } from "../heimdall";
import { TideMemory } from "../wrapper";

interface HiddenInit{
    doken: string;
    /**
     * @returns A refresh doken for Heimdall
     */
    dokenRefreshCallback: () => Promise<string> | undefined;
    /**
     * @param vendorData The encrypted data you have to send back to Tidecloak to update the TideAuthMsg with one with the newest session key
     * @returns 
     */
    sessionKeyUpdatedCallback: (vendorData: string) => Promise<void> | undefined;
    /**
     * Returns GVRK Auth Pack + "." + Signature            I MADE IT A FUNCTION BECAUSE WE ONLY NEED TO CALL IT ON REQUEST ENCLAVE UI INSTANCIATION. PLUS IF SOMEONE KEEPS THERE BROWSER OPEN FOR LONGER THAN A MONTH THERE MAY BE A KEY MISMTACH HERE AND ON TIDECLAOK
     */
    vendorRotatingPublic: (rotatingPublic: string) => Promise<string>;
}

export class RequestEnclave extends Heimdall<RequestEnclave>{
    private doken: string;
    private dokenRefreshCallback: () => Promise<string> | undefined;
    private sessionKeyUpdatedCallback: (vendorData: string) => Promise<void> | undefined;
    private vendorRotatingPublic: string;

    _windowType: windowType = windowType.Hidden;

    private initDone: Promise<any> = this.recieve("init done");

    init(data: HiddenInit): RequestEnclave {
        if(!data.doken) throw 'Doken not provided';

        this.doken = data.doken;
        this.vendorRotatingPublic = data.vendorRotatingPublic;
        this.dokenRefreshCallback = data.dokenRefreshCallback;
        this.sessionKeyUpdatedCallback = data.sessionKeyUpdatedCallback;

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

    async handleHiddenEnclaveResponse(msg: any){
        if(msg == "session key mismatch" && this._windowType == windowType.Hidden){
            this.initDone = this.recieve("init done"); // await the REOPENED HIDDEN ENCLAVE INIT DONE SIGNAL
            // looks like the hidden iframe has not allowed data to be stored on the browser OR the session key is mismatched with whats on the enclave vs doken
            // either way we gotta get a doken with the appropriate session key

            // Close the hidden enclave
            this.close();

            // We're now going to open the request enclave as a popup with the mismatched doken
            // The page should recognise the doken is mismatched, generate a new one, then close
            this._windowType = windowType.Popup;

            // open popup
            await this.open();
            // send doken to refresh
            this.send({
                type: "init",
                message:{
                    doken: this.doken
                }
            });
            // wait for new doken
            const resp = await this.recieve("refreshed doken"); 
            this.doken = resp.doken;
            if(this.sessionKeyUpdatedCallback) this.sessionKeyUpdatedCallback(resp.vendorData);

            // close pop up enclave
            this.close();

            // reset page to hidden iframe
            this._windowType = windowType.Hidden;
            // open hidden iframe
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

        }

        this.recieve("hidden enclave").then((data) => this.handleHiddenEnclaveResponse(data));
    }

    getOrkUrl(): URL {
        // construct ork url
        const url = new URL(this.enclaveOrigin);

        // Set hidden status
        url.searchParams.set("hidden", this._windowType == windowType.Hidden ? "true" : "false");

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
    checkEnclaveOpen(){
        if(this.enclaveClosed()){
            // Enclave was closed!
            // We need to reopen the enclave and await the init again
            this.initDone = this.recieve("init done");
            this.open().then((success: boolean) => {
                if(success){
                    this.send({
                        type: "init",
                        message:{
                            doken: this.doken
                        }
                    });
                }else throw 'Error opening enclave';
            });
        }
    }

    async execute(data: TideMemory): Promise<Uint8Array[]>{
        this.checkEnclaveOpen();
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
        this.checkEnclaveOpen();
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
        this.checkEnclaveOpen();
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
                    console.log("[HEIMDALL] Refreshing doken");
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