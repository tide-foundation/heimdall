// 
// Tide Protocol - Infrastructure for a TRUE Zero-Trust paradigm
// Copyright (C) 2022 Tide Foundation Ltd
// 
// This program is free software and is subject to the terms of 
// the Tide Community Open Code License as published by the 
// Tide Foundation Limited. You may modify it and redistribute 
// it in accordance with and subject to the terms of that License.
// This program is distributed WITHOUT WARRANTY of any kind, 
// including without any implied warranty of MERCHANTABILITY or 
// FITNESS FOR A PARTICULAR PURPOSE.
// See the Tide Community Open Code License for more details.
// You should have received a copy of the Tide Community Open 
// Code License along with this program.
// If not, see https://tide.org/licenses_tcoc2-0-0-en


//
export interface HeimdallConstructor{
    vendorId: string;
    homeOrkOrigin: string,
    voucherURL: string,
    signed_client_origin: string;
}
export abstract class Heimdall<T> implements EnclaveFlow<T> {
    name: string;
    _windowType: windowType;
    enclaveOrigin: string;
    voucherURL: string;
    signed_client_origin: string;
    vendorId: string;
    
    private enclaveWindow: WindowProxy;

    constructor(init: HeimdallConstructor){
        this.enclaveOrigin = init.homeOrkOrigin; 
        this.voucherURL = init.voucherURL;
        this.signed_client_origin = init.signed_client_origin;
        this.vendorId = init.vendorId;
    }

    enclaveClosed(){
        return this.enclaveWindow.closed;
    }

    getOrkUrl(): URL {
        throw new Error("Method not implemented.");
    }

    public async open(): Promise<boolean> {
        switch(this._windowType){
            case windowType.Popup:
                return this.openPopUp();
            case windowType.Redirect:
                throw new Error("Method not implemented.");
            case windowType.Hidden:
                return this.openHiddenIframe();
        }
    }
    public send(data: any): void {
        switch(this._windowType){
            case windowType.Popup:
                this.sendPostWindowMessage(data);
                break;
            case windowType.Redirect:
                throw new Error("Method not implemented.");
            case windowType.Hidden:
                this.sendPostWindowMessage(data);
                break;
        }
    }
    public async recieve(type: string): Promise<any> {
        switch(this._windowType){
            case windowType.Popup:
                return this.waitForWindowPostMessage(type);
            case windowType.Redirect:
                throw new Error("Method not implemented.");
            case windowType.Hidden:
                return this.waitForWindowPostMessage(type);
        }
    }
    public close() {
        switch(this._windowType){
            case windowType.Popup:
                this.closePopupEnclave();
                break;
            case windowType.Redirect:
                throw new Error("Method not implemented.");
            case windowType.Hidden:
                this.closeHiddenIframe();
                break;
            default:
                throw "Unknown window type";
        }
    }

    onerror(data: any): void {
        throw new Error("Method not implemented.");
    }

    private async openPopUp(): Promise<boolean> {
        const left_pos = (window.length / 2) - 400;
        const w = window.open(this.getOrkUrl(), "_blank", `width=800,height=800,left=${left_pos}`);
        if(!w) return false;
        this.enclaveWindow = w;
        await this.waitForWindowPostMessage("pageLoaded"); // we need to wait for the page to load before we send sensitive data
        return true;
    }

    private async closeHiddenIframe(){
        window.document
            .querySelectorAll<HTMLIFrameElement>('iframe#heimdall')
            .forEach(iframe => iframe.remove());
    }

    private async openHiddenIframe() {
        try{
            // Remove any existing iframes with heimdall id
            this.closeHiddenIframe();

            // 1. Create the iframe
            const iframe = document.createElement('iframe');

             // Create iframe error listener
            const iframeErrorListener = new Promise<boolean>((res) => {
                iframe.onerror = () => res(false);
                iframe.addEventListener("error", () => {
                    res(false); // failed to load
                });
            });

            iframe.src = this.getOrkUrl().toString();          
            iframe.style.display = 'none';          // hide it visually
            iframe.id = "heimdall"; // in case multiple frames get popped up - we only want one
            iframe.setAttribute('aria-hidden', 'true'); // accessibility hint

            // 2. Add it to the document
            document.body.appendChild(iframe);

            // 3. Keep a reference to its window for postMessage
            this.enclaveWindow = iframe.contentWindow;
            if (!this.enclaveWindow) return false;

            // Create an iframe success listener
            const pageLoaded = new Promise<boolean>(async (res) => {
                await this.waitForWindowPostMessage("pageLoaded");
                res(true); // page loaded
            });

            const timeout = new Promise<boolean>((resolve) => {
                setTimeout(() => resolve(false), 2000); // 2-second timeout
            });

            const loadedResult = await Promise.race([iframeErrorListener, pageLoaded, timeout]);

            return loadedResult;
        }catch{
            return false;
        }
    }

    private closePopupEnclave() {
        this.enclaveWindow.close();
    }

    private async waitForWindowPostMessage(responseTypeToAwait: string) {
        return new Promise((resolve) => {
            const handler = (event) => {
                const response = this.processEvent(event.data, event.origin, responseTypeToAwait);
                if (response.ok) {
                    resolve(response.message);
                    window.removeEventListener("message", handler);
                } else {
                    if(response.print) console.error("[HEIMDALL] Recieved enclave error: " + response.error);
                }
            };
            window.addEventListener("message", handler, false);
        });
    }

    private sendPostWindowMessage(message: any) {
        this.enclaveWindow.postMessage(message, this.enclaveOrigin);
    }

    private processEvent(data: any, origin: string, expectedType: string){
        if (origin !== new URL(this.enclaveOrigin).origin) {
            // Something's not right... The message has come from an unknown domain... 
            return {ok: false, print: false, error: "WRONG WINDOW SENT MESSAGE"};
        }

        switch (data.type) {
            case "newORKUrl":
                this.enclaveOrigin = new URL(data.url).origin;
                break;
            case "error":
                this.onerror(data);
                return {ok: false, print: false, error: "handled error"}
        }

        if(expectedType !== data.type) {
            console.log("[HEIMDALL] Received type{" + data.type + "} but waiting for type{" + expectedType + "}");
            return {ok: false, print: false, error: "handled error"}
        }else{
            console.log("[HEIMDALL] Correctly received type{" + data.type + "}");
            return {ok: true, message: data.message}
        }
    }
}
export enum windowType{
    Popup,
    Redirect,
    Hidden
};
export interface HiddenInit{
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
interface EnclaveFlow<T>{
    name: string;
    _windowType: windowType;

    open(): Promise<boolean>;
    send(data: any): void;
    recieve(type: string): Promise<any>;
    close(): void;

    onerror(data: any): void;

    getOrkUrl(): URL;
};