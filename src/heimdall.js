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

import { POST } from "./extras/HTTPRequest.js"
import { FieldData } from "./extras/FieldData.js"
import { deserializeUint8Array, serializeUint8Array, jwtValid } from "./extras/Utils.js"
import { TidePromise } from "./extras/TidePromise.js"

export class Heimdall{
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
        if (!Object.hasOwn(config, 'vendorRotatingPublic')) { throw Error("No vendor rotating public key has been included in config") }
        if (!Object.hasOwn(config, 'homeORKUrl')) { throw Error("No home ork URL has been included in config") }
        if (!Object.hasOwn(config, 'vendorRotatingPublicSignature')) { throw Error("No vendor rotating public sig has been included in config") }
        if (!Object.hasOwn(config, 'enclaveRequest')) { throw Error("No enclave request has been included in config") }

        this.vendorPublic = config.vendorPublic;
        this.vendorRotatingPublic = config.vendorRotatingPublic;
        this.homeORKUrl = config.homeORKUrl;
        this.enclaveData = {}; // don't get from config for CIAM scenario
        this.BiFrostPublicKey = Object.hasOwn(config, 'BiFrostPublicKey') ? config.BiFrostPublicKey : "";
        this.vendorRotatingPublicSignature = config.vendorRotatingPublicSignature;

        this.currentOrkURL = this.homeORKUrl;
        this.enclaveWindow = undefined;

        let locationURL = new URL(window.location.href)
        this.heimdallPlatform = "";
        if(locationURL.protocol === "http:" || locationURL.protocol === "https:"){
            this.heimdallPlatform = "website";
            this.vendorLocation = window.location.origin;
        }
        else{
            throw Error("Heimdall is not supported in whatever application you are using");
        }
    }

    AddTideButton(tideButtonAction, actionParameter=null){ // action parameter can be null for PerformTideAuth 1 Step
        const button = document.createElement('button');
      
        //button styling
        button.textContent = "";
        button.innerHTML='<img src ="https://tide.org/assets/images/logo-tide-white.png"/>';
        button.type="image";
        button.style.background="orange";
        button.style.color="white";
        button.style.fontSize="13px";
        button.style.padding="6px 40px";
        button.style.borderColor="white";
        button.style.borderRadius="6px";
      
        button.addEventListener('click', async () => {
            tideButtonAction(actionParameter);
        });
        document.body.appendChild(button); // add button to page
        return button;
    }
    /**
     * TIDE BUTTON ACTION
     * @param {TidePromise} promise
     */
    async GetCompleted(promise){
        throw Error("DO NOT USE. Experimental function");
        this.enclaveData.getUserInfoFirst = promise.callback == null ? false : true;
        this.enclaveFunction = "standard";
        await this.redirectToOrk();
        let customModel = null;
        if(promise.callback != null){
            const userInfo = await this.waitForSignal("userData");
            customModel = await promise.callback(userInfo); // putting await here in case implementor uses async
        }
        const pre_resp = this.waitForSignal("completed");
        this.sendMessage(customModel);
        const resp = await pre_resp;
        promise.fulfill(resp);
    }

    /**
     * TIDE BUTTON ACTION
     * @param {[string, FieldData, TidePromise]} params 
     */
    async EncryptUserData([vuid, fieldData, promise]){ 
        throw Error("DO NOT USE. Experimental function");
        try{
            this.enclaveFunction = "encrypt";
            // try opening an iframe in the current document first
            // if that fails - for any reason (e.g. jwt expired, sessionkey not found, iframe blocked) - open the tide enclave
            await this.openHiddenIFrame(); // have to add await so the DOM on the iframe loads

            // send field data through window.postMessage so all of the vendor's super sensitive data isn't in the f***ing URL
            const dataToSend = {
                VUID: vuid,
                FieldData: fieldData.getAll()
            }
            this.sendMessage(dataToSend);

            const iFrameResp = await this.waitForSignal('encrypt');
            document.getElementById("tideEncryptIframe").remove(); // close iframe
            if(iFrameResp.errorEncountered == false) {
                promise.fulfill(iFrameResp.encryptedFields.map(ef => deserializeUint8Array(ef))); // in case iframe worked - fulfill promise with data
                return;
            }
            await this.redirectToOrk(); // in case iframe didn't work - let's pull up our sweet enclave
            this.sendMessage(dataToSend); // gotta send it again for the new window / enclave
            
            const enclaveResp = await this.waitForSignal("encrypt");
            const s = enclaveResp.encryptedFields.map(ef => deserializeUint8Array(ef));
            promise.fulfill(s);
        }catch(error){
            promise.reject(error);
        }
    }

    /**
     * TIDE BUTTON ACTION
     * @param {[string, Uint8Array[], TidePromise]} params 
     */
    async DecryptUserData([vuid, serializedFields, promise]){
        throw Error("DO NOT USE. Experimental function");
        try{
            this.enclaveFunction = "decrypt";
            // try opening an iframe in the current document first
            // if that fails - for any reason (e.g. jwt expired, sessionkey not found, iframe blocked) - open the tide enclave
            await this.openHiddenIFrame(); // have to add await so the DOM on the iframe loads

            const dataToSend = {
                VUID: vuid,
                SerializedFields: serializedFields.map(sf => serializeUint8Array(sf))
            }
            this.sendMessage(dataToSend);

            const iFrameResp = await this.waitForSignal('decrypt');
            document.getElementById("tideEncryptIframe").remove(); // close iframe
            if(iFrameResp.errorEncountered == false) {
                promise.fulfill(iFrameResp.decryptedFields); // in case iframe worked - fulfill promise with data
                return;
            }
            await this.redirectToOrk(); // in case iframe didn't work - let's pull up our sweet enclave
            this.sendMessage(dataToSend); // gotta send it again for the new window / enclave
            
            const enclaveResp = await this.waitForSignal("decrypt");
            promise.fulfill(enclaveResp.decryptedFields);
        }catch(err){
            promise.reject(err);
        }
    }

    /**
     * TIDE BUTTON ACTION
     * @param {TidePromise} promise
     */
    async PerformTAGFlow(promise){
        try{
            this.enclaveData = {
                getUserInfoFirst: false,
                gVVK: this.vendorPublic,
                gVRK: this.vendorRotatingPublic,
                gVRKSig: this.vendorRotatingPublicSignature,
                gBFK: this.BiFrostPublicKey
            };
            this.enclaveFunction = "TAG";
            await this.redirectToOrk();

            const TAGdata = await this.waitForSignal("tag");

            // send to TAG endpoint /validate, receive TAG Commit data
            const TAGJsonData = JSON.parse(TAGdata.DataForTAG);

            if(!Object.hasOwn(TAGJsonData, 'VendorEncryptedData')
            || !Object.hasOwn(TAGJsonData, 'BiFrostEncryptedData')
            || !Object.hasOwn(TAGJsonData, 'JWT_unsigned')) throw Error("TAGData from enclave does not include all neccessary fields");

            const TAGCommitResponse = await POST('/tide/validate', {
                VendorEncryptedData: TAGJsonData.VendorEncryptedData,
                BiFrostEncryptedData: TAGJsonData.BiFrostEncryptedData,
                JWT_unsigned: TAGJsonData.JWT_unsigned
            });

            // send commit data back to enclave (so it can forward it to the orks)
            this.sendMessage(TAGCommitResponse);
            promise.fulfill(); // fulfil promise, assume Logged In
        }catch(err){
            promise.reject(err);
        }
    }

    async OpenEnclave(){
        await this.redirectToOrk();
        return await this.waitForSignal("userData");
    }

    // In case of vendor side error, we can close enclave
    CloseEnclave(){
        this.sendMessage("VENDOR ERROR: Close Tide Enlcave");
    }

    async openHiddenIFrame(){
        this.enclaveType = "iframe";
        let iframe = document.createElement('iframe');
        iframe.id = "tideEncryptIframe";
        iframe.style.display = "none";
        iframe.src = this.createOrkURL();
        document.body.appendChild(iframe);
        this.enclaveWindow = iframe.contentWindow;

        // we need to await just the page loading
        return new Promise((resolve) => {
            iframe.addEventListener('load', () => resolve());
        })
    }

    async redirectToOrk(){
        this.enclaveType = "standard";
        this.enclaveWindow = window.open(this.createOrkURL(), new Date().getTime(), 'width=800,height=800');
        return await this.waitForSignal("pageLoaded"); // wait for page to load, useful for many reasons e.g. sending sensitive data
    }

    createOrkURL(){
        return this.currentOrkURL + 
        `?vendorLocation=${encodeURIComponent(this.vendorLocation)}` +
        `&vendorPlatform=${encodeURIComponent(this.heimdallPlatform)}` +
        `&enclaveData=${encodeURIComponent(JSON.stringify(this.enclaveData))}` +
        `&enclaveType=${this.enclaveType}` +
        `&enclaveFunction=${this.enclaveFunction}` +
        `&vendorOrks=0`;
    }

    waitForSignal(responseTypeToAwait) {
        return new Promise((resolve) => {
            const handler = (event) => {
                const response = this.processEvent(event.data, event.origin);
                if(response.responseType === responseTypeToAwait){
                    resolve(response);
                    window.removeEventListener("message", handler);
                }  
            };
            window.addEventListener("message", handler, false);
        });
        
    }

    sendMessage(message){
        this.enclaveWindow.postMessage(message, this.currentOrkURL);
    }

    /**
 * 
 * @param {string} data 
 * @param {string} origin
 */
    processEvent(data, origin){
        if (origin !== this.currentOrkURL) {
            // Something's not right... The message has come from an unknown domain... 
            return {status: "NOT OK", data: "WRONG WINDOW SENT MESSAGE"};
        }

        const enclaveResponse = data; // this will contain the jwt signed by the orks from a successful sign in 

        if(enclaveResponse.ok != true) throw Error("Tide Enclave had an error: " + enclaveResponse.message);

        switch (enclaveResponse.dataType) {
            case "tag":
                return {
                    responseType: "tag",
                    DataForTAG: enclaveResponse.DataForTAG,
                    NewAccount: enclaveResponse.newAccount
                }
            case "userData":
                return {
                    responseType: "userData",
                    PublicKey: enclaveResponse.publicKey,
                    UID: enclaveResponse.uid,
                    NewAccount: enclaveResponse.newAccount
                }
            case "completed":                
                return {
                    responseType: "completed",
                    ModelSig: enclaveResponse.modelSig,
                    TideJWT: enclaveResponse.TideJWT // this will probs change
                }
            case "encrypt":
                return {
                    responseType: "encrypt",
                    errorEncountered: enclaveResponse.errorEncountered,
                    encryptedFields: enclaveResponse.encryptedFields
                }
            case "decrypt":
                return {
                    responseType: "decrypt",
                    errorEncountered: enclaveResponse.errorEncountered,
                    decryptedFields: enclaveResponse.decryptedFields
                }
            case "newORKUrl":
                this.currentOrkURL = enclaveResponse.url;
                return {
                    responseType: "newORKUrl"
                }
            case "pageLoaded":
                return {
                    responseType: "pageLoaded"
                }
            default:
                throw Error("Unknown data type returned from enclave");
        }
    }
}