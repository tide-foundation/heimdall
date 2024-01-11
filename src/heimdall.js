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
        if (!Object.hasOwn(config, 'homeORKUrl')) { throw Error("No home ork URL has been included in config") }
        if (!Object.hasOwn(config, 'enclaveRequest')) { throw Error("No enclave request has been included in config") }

        this.vendorPublic = config.vendorPublic;
        this.homeORKUrl = config.homeORKUrl;
        this.enclaveRequest = config.enclaveRequest;
        this.vendorReturnAuthUrl = config.vendorReturnAuthUrl;
        // check enclave request for invalid values
        if(this.enclaveRequest.refreshToken == false && this.enclaveRequest.customModel == undefined){
            throw Error("It seems you are trying to log a user into Tide and expect nothing in return. Make sure you at least use the sign in process for something.")
        }

        this.currentOrkURL = this.homeORKUrl;
        this.enclaveWindow = undefined;
        this.enclaveFunction = "standard";

        let locationURL = new URL(window.location.href)
        this.heimdallPlatform = "";
        if(locationURL.protocol === "http:" || locationURL.protocol === "https:"){
            if (!Object.hasOwn(config, 'vendorLocationSignature')) { throw Error("No vendor url sig has been included in config") }
            this.vendorLocationSignature = config.vendorLocationSignature;
            this.heimdallPlatform = "website";
            this.vendorLocation = window.location.origin;
        } 
        else if(locationURL.protocol === "chrome-extension:"){
            if (!Object.hasOwn(config, 'vendorLocationSignature')) { throw Error("No vendor url sig has been included in config") }
            this.vendorLocationSignature = config.vendorLocationSignature;
            this.heimdallPlatform = "extension";
            if((typeof chrome === "undefined" || !chrome.runtime)) throw Error("Heimdall is being run in a chrome extension without access to chrome runtime");
            this.vendorLocation = chrome.runtime.id;
            this.extensionPort = undefined;
        }
        else if(locationURL.protocol === "file:"){
            this.heimdallPlatform = "app";
            if (!Object.hasOwn(config, 'appOriginText')) { throw Error("No appOriginText has been included in config. Since you are running an app with Heimdall, appOriginText is required") } 
            if (!Object.hasOwn(config, 'appOriginTextSignature')) { throw Error("No appOriginTextSignature has been included in config. Since you are running an app with Heimdall, appOriginTextSignature is required") } 
            this.appOriginText = config.appOriginText;
            this.appOriginTextSignature = config.appOriginTextSignature;
            this.vendorLocation = window.location.href; // this isn't going to be used in any meaningful way
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
        button.style.width="200";
        button.style.height="100";
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
     * @param {function} callback 
     */
    async PerformTideAuth(callback=null){
        await this.redirectToOrk();

        this.enclaveFunction = "standard";
        if(typeof(this.vendorReturnAuthUrl) !== "string") throw Error("Vendor's Return Auth URL has not been defined in config.enclaveRequest")

        let jwt = undefined;
        if(callback == null){
            // expect completed
            const userInfo = await this.waitForSignal("completed");
            jwt = userInfo.TideJWT;
        }else{
            // expect userData
            const userInfo = await this.waitForSignal("userData");
            callback(userInfo); // this can be used for the vendor page to perform operations before user signs in/up to tide
            jwt = await this.CompleteSignIn(null).TideJWT; // null for customModel as no signedModel will be returned
        }

        if(typeof(jwt) !== "string") throw Error("PerformTideAuth function requires a RefreshToken (TideJWT) to be requested in the config");
        window.location.replace(this.vendorReturnAuthUrl + jwt); // redirect user to this vendor's authentication endpoint with auth token
    }

    /**
     * TIDE BUTTON ACTION
     * @param {TidePromise} promise 
     */
    async GetUserInfo(promise){
        this.enclaveFunction = "standard";
        await this.redirectToOrk();
        const userData = await this.waitForSignal("userData");
        promise.fulfill(userData);
        // continue sign in so vendor doesn't have to do it (i can't think of why vendor would abort this process, if something screws up, it's on the vendor, they already paid for the user)
        await this.CompleteSignIn();
    }

    /**
     * TIDE BUTTON ACTION
     * @param {TidePromise} promise
     */
    async GetCompleted(promise){
        this.enclaveFunction = "standard";
        await this.redirectToOrk();
        let customModel = null;
        if(promise.callback != null){
            const userInfo = await this.waitForSignal("userData");
            customModel = await promise.callback(userInfo); // putting await here in case implementor uses async
        }
        const completedData = await this.CompleteSignIn(customModel);
        promise.fulfill(completedData);
    }

    /**
     * TIDE BUTTON ACTION
     * @param {[string, FieldData, TidePromise]} params 
     */
    async EncryptUserData([vuid, fieldData, promise]){ 
        try{
            this.enclaveFunction = "encrypt";
            // try opening an iframe in the current document first
            // if that fails - for any reason (e.g. jwt expired, sessionkey not found, iframe blocked) - open the tide enclave
            this.openHiddenIFrame();

            // send field data through window.postMessage so all of the vendor's super sensitive data isn't in the f***ing URL
            const dataToSend = {
                VUID: vuid,
                FieldData: fieldData.getAll()
            }
            this.sendMessage(dataToSend);

            const iFrameResp = await this.waitForSignal('iframeData');
            if(iFrameResp.errorEncountered == false) {
                promise.fulfill(iFrameResp.encryptedFields); // in case iframe worked - fulfill promise with data
                return;
            }

            await this.redirectToOrk(); // in case iframe didn't work - let's pull up our sweet enclave
            this.sendMessage(dataToSend); // gotta send it again for the new window / enclave
            
            const enclaveResp = await this.waitForSignal("iframeData");
            promise.fulfill(enclaveResp.encryptedFields);
        }catch{
            promise.reject(error);
        }
        
    }

    /**
     * TIDE BUTTON ACTION
     * @param {[string, FieldData, TidePromise]} params 
     */
    async TESTencryptUserDataTEST([tideJWT, fieldData, promise]){
        try{
            if(!jwtValid(tideJWT)) throw Error("Invalid TideJWT")
            const key = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]);
            // encrypt each field with this key
            // encrypted data will be in the same order as provided
            const enc = new TextEncoder();
            const datas = fieldData.getAll().map(a => enc.encode(JSON.stringify(a)));
            const pre_encrypted = datas.map(async (data) => await this.TESTencryptDataTEST(data, key));
            const encrypted = await Promise.all(pre_encrypted);
            promise.fulfill(encrypted)
        }catch(error){
            promise.reject(error);
        }
    }

    /**
     * @param {[string, Uint8Array[], TidePromise]} params 
     */
    async TESTdecryptUserDataTEST([tideJWT, encryptedData, promise]){
        try{
            if(!jwtValid(tideJWT)) throw Error("Invalid TideJWT")
            const key = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]);
            const pre_decrypted = encryptedData.map(async (enc) => await this.TESTdecryptDataTEST(enc, key));
            const decrypted = await Promise.all(pre_decrypted);
            
            const decoder = new TextDecoder('utf-8');
            const data = decrypted.map(dec => JSON.parse(decoder.decode(dec)));
            promise.fulfill(data);

        }catch(error){
            promise.reject(error);
        }
    }

    /**
     * @param {Uint8Array} secretBytes 
     * @param {Uint8Array} key 
     * @returns 
     */
    async TESTencryptDataTEST(secretBytes, key) {
        const AESKey = await window.crypto.subtle.importKey(
            "raw",
            key,
            "AES-GCM",
            true,
            ["encrypt"]
        );
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encryptedBuffer = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv: iv },
            AESKey,
            secretBytes
          );
        const len = iv.length + (new Uint8Array(encryptedBuffer)).length;
        const buff = new Uint8Array(len);
        buff.set(iv);
        buff.set(new Uint8Array(encryptedBuffer), iv.length);
        return buff;
    }

    /**
     * @param {Uint8Array} encryptedBytes 
     * @param {Uint8Array} key 
     * @returns 
     */
    async TESTdecryptDataTEST(encryptedBytes, key){
        const AESKey = await window.crypto.subtle.importKey(
            "raw",
            key,
            "AES-GCM",
            true,
            ["decrypt"]
        );
        const iv = encryptedBytes.slice(0, 12);
        const data = encryptedBytes.slice(12)
        const decryptedContent = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv,
            },
            AESKey,
            data
        );
        return decryptedContent;
    }

    async OpenEnclave(){
        await this.redirectToOrk();
        return await this.waitForSignal("userData");
    }

    // Signs the requested model / returns TideJWT + sig
    async CompleteSignIn(customModel=null){
        // you'll need to post message here to the enclave containing the model to sign
        if(!(typeof(customModel) === "object" || customModel == null)) throw Error("Custom model must be a object or null");
        this.enclaveRequest.customModel = customModel;
        const pre_resp = this.waitForSignal("completed");
        this.sendMessage(customModel);
        const resp = await pre_resp;
        return resp;
    }

    // In case of vendor side error, we can close enclave
    CloseEnclave(){
        this.sendMessage("VENDOR ERROR: Close Tide Enlcave");
    }

    openHiddenIFrame(){
        let iframe = document.createElement('iframe');
        iframe.style.display = "none";
        iframe.src = this.createOrkURL();
        this.enclaveWindow = iframe.contentWindow;
        /// set up error handling here in case iframe encounters error and needs enclave
        document.body.appendChild(iframe);
    }

    async redirectToOrk(){
        if(this.heimdallPlatform == "extension"){
            /// TODO TODO TODO
            // I'm 99% sure that if a user does ork rehoming while using heimdall through a extension - it will break due to the listener/port being created at the start. Fix ASAP
            // opening ork for first time
            const openEnclavePromise = new Promise((resolve) => {
                const handler = (port) => {
                    if(port.sender.origin !== this.currentOrkURL) chrome.runtime.onConnectExternal.removeListener(handler); // someone else connected to us
                    else this.extensionPort = port; // we connected to the right ork
                    resolve("done");
                }
                chrome.runtime.onConnectExternal.addListener(handler);
            });

            // open enclave here
            chrome.windows.create({ 
                url: this.createOrkURL(),
                width: 800,  // Specify the desired width in pixels
                height: 800  // Specify the desired height in pixels
            });

            await openEnclavePromise;
        }else{
            this.enclaveWindow = window.open(this.createOrkURL(), new Date().getTime(), 'width=800,height=800');
        }
    }

    createOrkURL(){
        return this.currentOrkURL + 
        `?vendorPublic=${encodeURIComponent(this.vendorPublic)}` +
        `&vendorPlatform=${encodeURIComponent(this.heimdallPlatform)}` +
        `&vendorLocation=${encodeURIComponent(this.vendorLocation)}` +
        (this.heimdallPlatform === "app" 
        ? `&vendorOriginText=${encodeURIComponent(this.appOriginText)}&vendorOriginTextSig=${encodeURIComponent(this.appOriginTextSignature)}` 
        : `&vendorLocationSig=${encodeURIComponent(this.vendorLocationSignature)}`)
        +
        `&vendorLocationSig=${encodeURIComponent(this.vendorLocationSignature)}` +
        `&enclaveRequest=${encodeURIComponent(JSON.stringify(this.enclaveRequest))}` +
        `&enclaveFunction=${this.enclaveFunction}` +
        `&vendorOrks=0`;
    }

    waitForSignal(responseTypeToAwait) {
        if(this.heimdallPlatform == "extension"){
            if(this.extensionPort == undefined){
                // we haven't connected to the enclave yet
                throw Error("Must open enclave before calling waitForSignal() as an extension");
            }
            return new Promise((resolve) => {
                const handler = (msg) => {
                    const response = this.processEvent(msg, this.currentOrkURL); // i pass currentORKUrl here as we know previously we connected to the right ork (in redirectToOrk())
                    if(response.responseType === responseTypeToAwait){
                        this.extensionPort.onMessage.removeListener(handler);
                        resolve(response);
                    } 
                }
                this.extensionPort.onMessage.addListener(handler);
            });
            
        }else{
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
    }

    sendMessage(message){
        if(this.heimdallPlatform == "extension"){
            if(this.extensionPort == undefined){
                // we haven't connected to the enclave yet
                throw Error("Must open enclave before calling sendMessage() as an extension");
            }
            else{
                this.extensionPort.postMessage(message);
            }
        }
        else{
            this.enclaveWindow.postMessage(message, this.currentOrkURL);
        }
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
            case "userData":
                return {
                    responseType: "userData",
                    PublicKey: enclaveResponse.publicKey,
                    UID: enclaveResponse.uid,
                    NewAccount: enclaveResponse.newAccount
                }
            case "completed":
                if(this.enclaveRequest.refreshToken){
                    if(!jwtValid(enclaveResponse.TideJWT)) throw Error("TideJWT not valid")
                }
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
            case "iframeData":
                return {
                    responseType: "iframeData",
                    errorEncountered: enclaveResponse.errorEncountered,
                    encryptedFields: enclaveResponse.encryptedFields
                }
            default:
                throw Error("Unknown data type returned from enclave");
        }
    }

    
    
}

export class TidePromise {
    constructor(callback=null) {
        this.promise = new Promise((resolve, reject) => {
            // Store the resolve function to be called later
            this.resolve = resolve;
            this.reject = reject;
        });
        this.callback = callback
    }

    fulfill(value) {
        // Fulfill the promise with the provided value
        this.resolve(value);
    }

    reject(error) {
        this.reject(error);
    }
}

// FieldData on Heimdall turns into Datum on enclave
export class FieldData {
    /**
     * These identifiers must ALWAYS - EVERY TIME HEIMDALL IS CALLED FROM THIS VENDOR - be supplied in the SAME ORDER. APPEND list for new identifiers
     * @param {string[]} identifiers 
     */
    constructor(identifiers){
        if(identifiers.length > 255) throw Error("Heimdall: Too many identifiers provided for FieldData");
        if(identifiers.length == 0) throw Error("Identifiers list required to convert tags to ids");
        this.identifiers = identifiers
        this.datas = []
    }

    /**
     * @param {Uint8Array} data 
     * @param {string[]} ids 
     */
    add(data, ids){
        let datum = {
            Data: data,
            Tag: this.getTag(ids)
        }
        this.datas.push(datum);
    }

    /**
     * @param {Uint8Array} data 
     * @param {number} tag 
     */
    addWithTag(data, tag){
        let datum = {
            Data: data,
            Tag: tag
        }
        this.datas.push(datum);
    }

    /**
     * @param {object[]} fieldDatas 
     */
    addManyWithTag(fieldDatas){
        if(this.datas.length > 0) throw Error("This FieldData object already has objects in its contents");
        this.datas = fieldDatas.map(fd => {
            if(!fd.Data || !fd.Tag) throw Error("Invalid field data supplied");
            return fd;
        })
    }

    getAll(){
        return [...this.datas];
    }

    getAllWithIds(){
        return this.datas.map(da => {
            const datum = {
                Data: da.Data,
                Ids: this.getIds(da.Tag)
            }
            return datum;
        })
    }

    /**
     * @param {string[]} ids 
     */
    getTag(ids){
        let tag = 0; // its basically a mask
        ids.forEach(id => {
            // get index of id in id list
            const index = this.identifiers.indexOf(id);
            if(index == -1) throw Error("Id not found in identifiers");
            const mask = 1 << (index);
            tag |= mask;
        });
        return tag;
    }
    /**
     * @param {number} tag 
     */
    getIds(tag){
        const bitLen = this.identifiers.length;
        let ids = [];
        for(let i = 0; i < bitLen; i++){
            const mask = 1 << i;
            if((tag & mask) != 0){
                const id = this.identifiers[i];
                ids.push(id);
            }
        }
        return ids;
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
