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

export default class Heimdall{
    /**
     * 
     * @example Config:
    * {
    * vendorPublic: string //Make sure to create some public key for this
    * vendorUrlSignature: string //The value of this web page's URL (such as https://www.yoursite.com/login) signed (EdDSA) with this vendor's VVK.
    * homeORKUrl: string //Just the origin. For example => https://someOrk.com
    * mode: string (Optional) // An identifier of what kind of model 'modelToSign' is. "Default" mode indiciates there is no model to sign.
    * modelToSign: string (Optional) // The model you want to sign in the Tide flow. Available models: ["openssh"]
    * }
    * @param {object} config
     */
    constructor(config){
        if (!Object.hasOwn(config, 'vendorPublic')) { throw Error("No vendor public key has been included in config") }
        if (!Object.hasOwn(config, 'vendorUrlSignature')) { throw Error("No vendor url sig has been included in config") }
        if (!Object.hasOwn(config, 'homeORKUrl')) { throw Error("No home ork URL has been included in config") }

        this.vendorPublic = config.vendorPublic;
        this.vendorUrlSignature = config.vendorUrlSignature;
        this.homeORKUrl = config.homeORKUrl;

        this.mode = Object.hasOwn(config, 'mode') ? config.mode : "default";
        this.modelToSign = Object.hasOwn(config, 'modelToSign') ? config.modelToSign : "";

        this.currentOrkURL = this.homeORKUrl;
        this.enclaveWindow = undefined;
    }

    // Vendor flow / returns button
    AddEnclaveButton(){
        const button = document.createElement('button');
        button.textContent = "Tide Button";
        button.addEventListener('click', this.redirectToOrk); // no need to pass params for this redirectToOrk call
        document.body.appendChild(button); // add button to page

        window.addEventListener("message", (event) => {
            let result = processEvent(event); // remember 'processEvent' will return new ork url OR just switch page to vendor's page (default mode)
            if(result.responseType == "completed"){
                // redirect to vendor Auth Url  with jwt
                window.location.replace(window.location.origin + `/tide/auth?auth_token=${result.TideJWT}`); // redirect user to this vendor's authentication endpoint with auth token
            }
            else{
                // TODO: Handle 2 stage AddEnclaveButton flow (model to sign not prepped b4hand)
                throw Error("Unhandled error")
            }
        }, false);
        return button;
    }

    // Get's user details (Pub, VUID) / returns pub, vuid
    async OpenEnclave(){
        if((this.mode == "default" && this.modelToSign != "")) throw Error("Default mode cannot take a model to sign.")
        this.redirectToOrk();
        return await this.waitForSignal(); // will return pubKey and UID  OR  signature depending on whether a model To Sign was supplied
    }

    // Signs the requested model / returns TideJWT + sig
    async CompleteSignIn(modelToSign){
        // you'll need to post message here to the enclave containing the model to sign
        if(typeof(modelToSign) !== "string") throw Error("Model to sign must be a string");
        const pre_resp = this.waitForSignal();
        this.enclaveWindow.postMessage(modelToSign, this.currentOrkURL); // check this works
        const resp = await pre_resp;
        if(resp.responseType !== "completed") throw Error("Unexpected response from enclave");
        return resp;
    }

    redirectToOrk(){
        this.enclaveWindow = window.open(this.currentOrkURL + `?vendorPublic=${encodeURIComponent(this.vendorPublic)}&vendorUrl=${encodeURIComponent(window.location.origin)}&vendorUrlSig=${encodeURIComponent(this.vendorUrlSignature)}&mode=${encodeURIComponent(this.mode)}&modelToSign=${encodeURIComponent(this.modelToSign)}&vendorOrks=0`, 'popup', 'width=800,height=800');
    }

    waitForSignal() {
        return new Promise((resolve) => {
            const handler = (event) => {
                //window.removeEventListener("message", handler);
                resolve(this.processEvent(event));
            };
            window.addEventListener("message", handler, false);
        });
    }

    /**
 * 
 * @param {MessageEvent} event 
 * @param {string} mode
 */
    processEvent(event){
        if (event.origin !== this.currentOrkURL) {
            // Something's not right... The message has come from an unknown domain... 
            return {status: "NOT OK", data: "WRONG WINDOW SENT MESSAGE"};
        }

        const enclaveResponse = event.data; // this will contain the jwt signed by the orks from a successful sign in 

        if(enclaveResponse.ok != true) throw Error("Tide Enclave had an error: " + enclaveResponse.message);

        switch (enclaveResponse.dataType) {
            case "userData":
                return {
                    responseType: "userData",
                    PublicKey: enclaveResponse.publicKey,
                    UID: enclaveResponse.uid
                }
            case "completed":
                if(!jwtValid(enclaveResponse.TideJWT)) throw Error("TideJWT not valid")
                return {
                    responseType: "completed",
                    ModelSig: enclaveResponse.modelSig,
                    TideJWT: enclaveResponse.TideJWT
                }
            case "newORKUrl":
                this.currentOrkURL = enclaveResponse.url;
                this.redirectToOrk();
                break;
            default:
                throw Error("Unknown data type returned from enclave");
        }
    }
}




function jwtValid(jwt){
    const decoded = jwt.split(".")
        .map(a => a.replace(/-/g, '+').replace(/_/g, '/') + "==".slice(0, (3 - a.length % 4) % 3));

    const header = atob(decoded[0]) // header 
    const payload = atob(decoded[1]) // payload

    if(decoded.length != 3) return false;
    
    try{
        let test_data = JSON.parse(header)
        if(test_data.typ != "JWT" || test_data.alg != "EdDSA") return false;
        test_data = JSON.parse(payload)
        if(test_data.uid == null || test_data.exp == null) return false;
    }catch{
        return false;
    }
    return true;
}