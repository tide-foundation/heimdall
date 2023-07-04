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
var currentOrkURL = "";
/**
 * Add the Tide Button to any website. You just need a public key and the URL of an ORK you trust.
 * @example
 * {
 * vendorPublic: string //Make sure to create some public key for this
 * vendorUrlSignature: string //The value of this web page's URL (such as https://www.yoursite.com/login) signed (EdDSA) with this vendor's VVK.
 * homeORKUrl: string //Just the origin. For example => https://someOrk.com
 * }
 * @param {object} config
 * @returns {HTMLButtonElement} The Tide button object so you can modity it's CSS and stuff
 */
export function AddTideButton(config){
    if (!Object.hasOwn(config, 'vendorPublic')) { throw Error("No vendor public key has been included in config") }
    if (!Object.hasOwn(config, 'vendorUrlSignature')) { throw Error("No vendor url sig has been included in config") }
    if (!Object.hasOwn(config, 'homeORKUrl')) { throw Error("No home ork URL has been included in config") }
    const button = document.createElement('button');
    button.textContent = "Tide Button";
    currentOrkURL = config.homeORKUrl;
    const redirectToOrk = () => {
        // open pop up window with vendorPublic and this window's location in URL
        window.open(currentOrkURL + `?vendorPublic=${encodeURIComponent(config.vendorPublic)}&vendorUrl=${encodeURIComponent(window.location.href)}&vendorUrlSig=${encodeURIComponent(config.vendorUrlSignature)}&vendorOrks=0`, 'popup', 'width=800,height=800');
    }
    button.addEventListener('click', redirectToOrk);
    document.body.appendChild(button); // add button to page
    window.addEventListener("message", (event) => {
        let result = processEvent(event);
        if(result.status == "OK"){
            currentOrkURL = result.data;
            window.open(result.data + `?vendorPublic=${encodeURIComponent(config.vendorPublic)}&vendorUrl=${encodeURIComponent(window.location.href)}&vendorUrlSig=${encodeURIComponent(config.vendorUrlSignature)}&vendorOrks=0`, 'popup', 'width=800,height=800');
        }else{
            return;
        }
    }, false);
    return button;
}

/**
 * 
 * @param {MessageEvent} event 
 */
function processEvent(event){
        if (event.origin !== currentOrkURL) {
            // Something's not right... The message has come from an unknown domain... 
            return {status: "NOT OK", data: "WRONG WINDOW SENT MESSAGE"};
        }

        const info = event.data; // this will contain the jwt signed by the orks from a successful sign in 

        if(info.charAt(0) == "*") return {status: "OK", data: info.substring(1, info.length)} // returns OK and newORKURL

        // Check the JWT is valid
        const decoded = info.split(".")
            .map(a => a.replace(/-/g, '+').replace(/_/g, '/') + "==".slice(0, (3 - a.length % 4) % 3));

        const header = atob(decoded[0]) // header 
        const payload = atob(decoded[1]) // payload

        if(decoded.length != 3) throw Error("Heimdall: JWT malformed")
        
        try{
            let test_data = JSON.parse(header)
            if(test_data.typ != "JWT" || test_data.alg != "EdDSA") throw Error()
            test_data = JSON.parse(payload)
            if(test_data.uid == null || test_data.exp == null) throw Error()
        }catch{
            throw Error("Heimdall: JWT did not include the correct information")
        }
        
        // redirect to vendor Auth Url  with jwt
        window.location.replace(window.location.origin + `/tide/auth?auth_token=${info}`); // redirect user to this vendor's authentication endpoint with auth token
}
