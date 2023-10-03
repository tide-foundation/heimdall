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
    * enclaveRequest: object // Contains the neccessary information on what how the enclave should behave and the information it returns
    * }
    * @param {object} config
     */
    constructor(config){
        if (!Object.hasOwn(config, 'vendorPublic')) { throw Error("No vendor public key has been included in config") }
        if (!Object.hasOwn(config, 'vendorUrlSignature')) { throw Error("No vendor url sig has been included in config") }
        if (!Object.hasOwn(config, 'homeORKUrl')) { throw Error("No home ork URL has been included in config") }
        if (!Object.hasOwn(config, 'enclaveRequest')) { throw Error("No enclave request has been included in config") }


        this.vendorPublic = config.vendorPublic;
        this.vendorUrlSignature = config.vendorUrlSignature;
        this.homeORKUrl = config.homeORKUrl;
        this.enclaveRequest = config.enclaveRequest;
        // check enclave request for invalid values
        if(this.enclaveRequest.refreshToken == false && this.enclaveRequest.customModel == undefined && this.enclaveRequest.getUserInfoFirst == false){
            throw Error("It seems you are trying to log a user into Tide and expect nothing in return. Make sure you at least use the sign in process for something.")
        }

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
        this.redirectToOrk();
        if(this.enclaveRequest.getUserInfoFirst == true) return await this.waitForSignal("userData");
        else if(this.enclaveRequest.getUserInfoFirst == false) return await this.waitForSignal("completed");
        else throw Error("Did you define getUserInfoFirst in enclave request?");
    }

    // Signs the requested model / returns TideJWT + sig
    async CompleteSignIn(customModel={name: "None"}){
        // you'll need to post message here to the enclave containing the model to sign
        if(!(typeof(customModel) === "object" || customModel == null)) throw Error("Custom model must be a object or null");
        const pre_resp = this.waitForSignal("completed");
        this.enclaveWindow.postMessage(customModel, this.currentOrkURL);
        const resp = await pre_resp;
        if(resp.responseType !== "completed") throw Error("Unexpected response from enclave");
        return resp;
    }

    // In case of vendor side error, we can close enclave
    CloseEnclave(){
        this.enclaveWindow.postMessage("VENDOR ERROR: Close Tide Enlcave", this.currentOrkURL);
    }

    redirectToOrk(){
        this.enclaveWindow = window.open(this.currentOrkURL + `?vendorPublic=${encodeURIComponent(this.vendorPublic)}&vendorUrl=${encodeURIComponent(window.location.origin)}&vendorUrlSig=${encodeURIComponent(this.vendorUrlSignature)}&enclaveRequest=${encodeURIComponent(JSON.stringify(this.enclaveRequest))}&vendorOrks=0`, new Date().getTime(), 'width=800,height=800');
    }

    waitForSignal(responseTypeToAwait) {
        return new Promise((resolve) => {
            const handler = (event) => {
                const response = this.processEvent(event);
                if(response.responseType === responseTypeToAwait){
                    window.removeEventListener("message", handler);
                    resolve(response);
                }
                
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
                    UID: enclaveResponse.uid,
                    NewAccount: enclaveResponse.newAccount
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
                return {
                    responseType: "newORKUrl"
                }
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