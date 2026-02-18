import { Heimdall, HiddenInit, windowType } from "../heimdall";
import { Cryptide, Models, Clients, Tools } from "tide-js";
const TideMemory = Tools.TideMemory;
const BaseTideRequest = Models.BaseTideRequest;

enum State{
    Closed,
    InitializingIFrame,
    FailedIFrameInitialization,
    InitializingPopUp,
    FailedPopUpInitialization,
    Ready
}

export class RequestEnclave extends Heimdall<RequestEnclave>{
    name: string = "request";
    protected doken: string;
    protected dokenRefreshCallback: () => Promise<string> | undefined;
    protected requireReloginCallback: () => Promise<string>;
    private state: State = State.Closed;

    protected bgUrl: string;
    protected logoUrl: string;

    _windowType: windowType = windowType.Hidden;

    protected initDone: Promise<any> = this.recieve("init done");
    private sessionId?: string;

    init(data: HiddenInit): RequestEnclave {
        if(!data.doken) throw 'Doken not provided';

        if(data.backgroundUrl) this.bgUrl = data.backgroundUrl
        if(data.logoUrl) this.logoUrl = data.logoUrl

        this.doken = data.doken;
        let parsedDoken = decodeToken(this.doken);
        if(parsedDoken["t.uho"]) this.enclaveOrigin = parsedDoken["t.uho"]; // use tidecloak set user home ork from doken
        this.dokenRefreshCallback = data.dokenRefreshCallback;
        this.requireReloginCallback = data.requireReloginCallback;

        this.handleSessionCheck();

        if(this.state !== State.Closed) return; // someone has already called init
        
        if(this._windowType === windowType.Hidden){
            this.recieve("hidden enclave").then((data) => this.handleHiddenEnclaveResponse(data));
            this.checkEnclaveOpen(); // try iframe immediately
        }

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
            console.log(`[HEIMDALL] Session key mismatch between enclave and doken. Reinitiating login`);
            this.requireReloginCallback(); // should initiate a full client page reload, killing this
            this.state = State.Closed;
        }
        else if(msg == "storage issue"){
            // Convert hidden enclave into popup
            this.close();
            console.log(`[HEIMDALL] Storage issue found on hidden iframe. Trying popup window next`);
            this.state = State.FailedIFrameInitialization;
            this.checkEnclaveOpen();
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
        url.searchParams.set("type", this.name);

        this.doken

        if(this.bgUrl) url.searchParams.set("backgroundUrl", this.bgUrl)
        if(this.logoUrl) url.searchParams.set("logoUrl", this.logoUrl)

        return url;
    }
    checkEnclaveOpen(){
        if(this.enclaveClosed()){
            switch(this.state){
                case State.InitializingIFrame:
                case State.InitializingPopUp:
                    return;
                case State.Closed:
                    // if closed try iframe
                    if(this._windowType === windowType.Hidden) this.state = State.InitializingIFrame;
                    else if(this._windowType === windowType.Popup) this.state = State.InitializingPopUp;
                    break;
                case State.FailedIFrameInitialization:
                    // if failed iframe try popup
                    this.state = State.InitializingPopUp;
                    this._windowType = windowType.Popup;
                    break;
                case State.FailedPopUpInitialization:
                    // if failed popup give up
                    console.warn("[HEIMDALL] Failed to initialize the popup enclave")
                    window.alert("There was an issue opening the fallback popup on this page. Please enable popups or let the administrator know about this problem. For more information, visit https://tide.org/browserwindow");
                    return;
                case State.Ready:
                    // if ready (but no enclave) try popup again
                    console.error("[HEIMDALL] State says ready but no enclave open. Trying popup again");
                    this.state = State.InitializingPopUp;
                    this._windowType = windowType.Popup;
                    break;
            }
            // Enclave is closed!
            // We need to reopen the enclave and await the init again
            this.initDone = this.recieve("init done");
            console.log(`[HEIMDALL] Attempting to open ${windowType[this._windowType]} window`);
            this.open().then((success: boolean) => {
                if(success){
                    const session = new Uint32Array(5);
                    self.crypto.getRandomValues(session);
                    this.sessionId = Array.from(session, v => v.toString(16).padStart(8, '0')).join('');
                    this.send({
                        type: "init",
                        message:{
                            doken: this.doken,
                            sessionId: this.sessionId
                        }
                    });
                    console.log(`[HEIMDALL] Successfully opened ${windowType[this._windowType]} window`);
                    this.state = State.Ready;
                }else {
                    if(this.state === State.InitializingIFrame){
                        this.state = State.FailedIFrameInitialization;
                        console.error('Error opening enclave of type: ' + windowType[this._windowType] + '. Trying popup.');
                        this.checkEnclaveOpen();
                    }else if(this.state === State.InitializingPopUp){
                        this.state = State.FailedIFrameInitialization; // so next checkEnclaveOpen call tries popup again
                        console.error('Error opening enclave of type: ' + windowType[this._windowType]);
                    }
                }
            });
        }
    }

    async initializeRequest(request: Tools.TideMemory): Promise<Uint8Array>{
        // construct request to sign this request's creation
        const requestToInitialize = BaseTideRequest.decode(request);
        const requestToInitializeDetails = await requestToInitialize.getRequestInitDetails();
        const initRequest = new BaseTideRequest(
            "TideRequestInitialization",
            "1",
            "Doken:1",
            TideMemory.CreateFromArray([
                requestToInitializeDetails.creationTime,
                requestToInitializeDetails.expireTime,
                requestToInitializeDetails.modelId,
                requestToInitializeDetails.draftHash
            ]),
            new TideMemory()
        );

        const creationSig = (await this.execute(initRequest.encode()))[0];

        // returns the same request provided except with the policy authorized creation datas included
        return requestToInitialize.addCreationSignature(requestToInitializeDetails.creationTime, creationSig).encode();
    }

    async execute(data: Tools.TideMemory, waitForAll: boolean = false): Promise<Uint8Array[]>{
        this.checkEnclaveOpen();
        await this.initDone;
        const pre_resp = this.recieve("sign request completed");
        this.send({
            type: "request",
            message:{
                flow: "sign",
                request: data,
                waitForAll,
            }
        })
        const resp = await pre_resp;
        if(typeof resp.error === 'string') {
            throw Error(resp.error);
        }
        if(!Array.isArray(resp)) throw 'Expecting request completed data to be an array, not' + resp;
        if(!resp.every((d: any) => d instanceof Uint8Array)) throw 'Expecting all entries in response to be Uint8Arrays';
        return resp;
    }
    async decrypt(data: decryptRequest[], policy?: Uint8Array): Promise<Uint8Array[]>{
        this.checkEnclaveOpen();
        await this.initDone;
        const pre_resp = this.recieve("decrypt request completed");
        this.send({
            type: "request",
            message:{
                flow: "decrypt",
                request: data,
                policy: policy
            }
        })
        const resp = await pre_resp;
        if(typeof resp.error === 'string') {
            throw Error(resp.error);
        }        
        if(!Array.isArray(resp)) throw 'Expecting request completed data to be an array, not' + resp;
        if(!resp.every((d: any) => d instanceof Uint8Array)) throw 'Expecting all entries in response to be Uint8Arrays';
        return resp;
    }
    async encrypt(data: encryptRequest[], policy?: Uint8Array): Promise<Uint8Array[]>{
        this.checkEnclaveOpen();
        await this.initDone;
        const pre_resp = this.recieve("encrypt request completed");
        this.send({
            type: "request",
            message: {
                flow: "encrypt",
                request: data,
                policy: policy
            }
        })
        const resp = await pre_resp;
        if(typeof resp.error === 'string') {
            throw Error(resp.error);
        }
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

    async handleSessionCheck() {
        this.recieve("session check").then(() => this.handleSessionCheck());
        this.send({
            type: "current session",
            message: this.sessionId
        })
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