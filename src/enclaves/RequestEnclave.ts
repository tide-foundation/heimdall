import { Heimdall, windowType } from "../heimdall";
import { TideMemory } from "../wrapper";

interface HiddenInit{
    doken: string;
    /**
     * @returns A refresh doken for Heimdall
     */
    dokenRefreshCallback: () => Promise<string> | undefined;
    /**
     * @returns A function that re authenticates the current user from the client. (Used to update their session key on Identity System). Returns a new doken too.
     */
    requireReloginCallback: () => Promise<string>;
}

export class RequestEnclave extends Heimdall<RequestEnclave>{
    protected doken: string;
    protected dokenRefreshCallback: () => Promise<string> | undefined;
    protected requireReloginCallback: () => Promise<string>;

    _windowType: windowType = windowType.Hidden;

    protected initDone: Promise<any> = this.recieve("init done");

    init(data: HiddenInit): RequestEnclave {
        if(!data.doken) throw 'Doken not provided';

        this.doken = data.doken;
        let parsedDoken = decodeToken(this.doken);
        if(parsedDoken["t.uho"]) this.enclaveOrigin = parsedDoken["t.uho"]; // use tidecloak set user home ork from doken
        this.dokenRefreshCallback = data.dokenRefreshCallback;
        this.requireReloginCallback = data.requireReloginCallback;

        this.recieve("hidden enclave").then((data) => this.handleHiddenEnclaveResponse(data));

        this.open().then((success: boolean) => {
            if(success){
                this.send({
                    type: "init",
                    message: {
                        doken: this.doken
                    }
                });
            }else{
                // If injecting iframe fails, try setting it as a popup and opening it
                this._windowType = windowType.Popup;
                this.open().then((success: boolean) => {
                    if(success){
                        this.send({
                            type: "init",
                            message: {
                                doken: this.doken
                            }
                        });
                    }
                    else throw 'Error opening all types of Request Enclave';
                });
            }
        });

        return this;
    }

    async handleHiddenEnclaveResponse(msg: any){
        // Below is the session key mismatch flow that was implemented but then it was decided a basic relogin was more elegent
        // Keeping it though because it is nearly identical to the flow where a tide user delegates a token to another tide user
        // This would require the second tide user to sign a new delegated token with their current session key 
        // This would be gold in a cvk scenario
        // if(msg == "session key mismatch" && this._windowType == windowType.Hidden){
        //     this.initDone = this.recieve("init done"); // await the REOPENED HIDDEN ENCLAVE INIT DONE SIGNAL
        //     // looks like the hidden iframe has not allowed data to be stored on the browser OR the session key is mismatched with whats on the enclave vs doken
        //     // either way we gotta get a doken with the appropriate session key

        //     // Close the hidden enclave
        //     this.close();

        //     // We're now going to open the request enclave as a popup with the mismatched doken
        //     // The page should recognise the doken is mismatched, generate a new one, then close
        //     this._windowType = windowType.Popup;

        //     // open popup
        //     await this.open();
        //     // send doken to refresh
        //     this.send({
        //         type: "init",
        //         message:{
        //             doken: this.doken
        //         }
        //     });
        //     // wait for new doken
        //     const resp = await this.recieve("refreshed doken"); 
        //     this.doken = resp.doken;
        //     if(this.requireReloginCallback) this.requireReloginCallback();

        //     // close pop up enclave
        //     this.close();

        //     // reset page to hidden iframe
        //     this._windowType = windowType.Hidden;
        //     // open hidden iframe
        //     this.open().then((success: boolean) => {
        //         if(success){
        //             this.send({
        //                 type: "init",
        //                 message: {
        //                     doken: this.doken
        //                 }
        //             });
        //         }else throw 'Error opening enclave';
        //     });

        // }
        if(msg == "session key mismatch"){
            this.close();
            this.requireReloginCallback(); // should initiate a full client page reload, killing this
        }
        else if(msg == "storage issue"){
            // Convert hidden enclave into popup
            this.close();
            this._windowType = windowType.Popup;
            this.open().then((success: boolean) => {
                if(success){
                    this.send({
                        type: "init",
                        message: {
                            doken: this.doken
                        }
                    });
                }else{
                    window.alert("There was an issue opening the fallback popup on this page. Please enable popups or let the administrator know about this problem. For more information, visit https://tide.org/browserwindow");
                    throw "Could not open popup";
                }
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

    async updateDoken(doken: string){
        this.doken = doken;
        this.send({
            type: "doken refresh",
            message:{
                doken: this.doken
            }
        });
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

function decodeToken(token: string): any {
    const [header, payload] = token.split(".");

    if (typeof payload !== "string") {
        throw new Error("Unable to decode token, payload not found.");
    }

    let decoded;

    try {
        decoded = base64UrlDecode(payload);
    } catch (error) {
        throw new Error("Unable to decode token, payload is not a valid Base64URL value. Error: " + error);
    }

    try {
        return JSON.parse(decoded);
    } catch (error) {
        throw new Error("Unable to decode token, payload is not a valid JSON value. Error: " + error);
    }
}

function base64UrlDecode(input: string): string {
    let output = input
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    switch (output.length % 4) {
        case 0:
            break;
        case 2:
            output += "==";
            break;
        case 3:
            output += "=";
            break;
        default:
            throw new Error("Input is not of the correct length.");
    }

    try {
        return b64DecodeUnicode(output);
    } catch (error) {
        return atob(output);
    }
}

function b64DecodeUnicode(input: string): string {
    return decodeURIComponent(atob(input).replace(/(.)/g, (m, p) => {
        let code = p.charCodeAt(0).toString(16).toUpperCase();

        if (code.length < 2) {
            code = "0" + code;
        }

        return "%" + code;
    }));
}

interface decryptRequest{
    encrypted: Uint8Array;
    tags: string[]
}
interface encryptRequest{
    data: Uint8Array;
    tags: string[]
}