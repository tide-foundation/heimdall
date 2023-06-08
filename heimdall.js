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

/**
 * Add the Tide Button to any website. You just need a public key and the URL of an ORK you trust.
 * @param {string} vendorPublic Make sure to create some public key for this
 * @param {string} vendorAuthRedirectUrl Where you want to redirect the user with a valid jwt
 * @param {string} homeORKUrl Just the origin. For example => https://someOrk.com
 * @returns {HTMLButtonElement} The Tide button object so you can modity it's CSS and stuff
 */
export function AddTideButton(vendorPublic, vendorAuthRedirectUrl, homeORKUrl){
    const button = document.createElement('button');
    button.textContent = "Tide Button";
    const redirectToOrk = () => {
        // open pop up window with vendorPublic and this window's location in URL
        window.open(homeORKUrl + `?vendorPublic=${vendorPublic}&vendorUrl=${window.location.href}&vendorOrks=0`, 'popup', 'width=800,height=800');
    }
    button.addEventListener('click', redirectToOrk);
    document.body.appendChild(button); // add button to page
    window.addEventListener("message", (event) => {
        if (event.origin !== homeORKUrl) {
            // Something's not right... The message has come from an unknown domain... 
            return;
        }

        const info = event.data; // this will contain the jwt signed by the orks from a successful sign in 

        // Check the JWT is valid
        const decoded = info.split(".")
            .map(a => a.replace(/-/g, '+').replace(/_/g, '/') + "==".slice(0, (3 - a.length % 4) % 3));

        decoded[0] = atob(decoded[0]) // header 
        decoded[1] = atob[decoded[1]] // payload

        if(decoded.length != 3) throw Error("Heimdall: JWT malformed")
        
        try{
            let test_data = JSON.parse(decoded[0])
            if(test_data.typ != "JWT" || test_data.alg != "EdDSA") throw Error()
            test_data = JSON.parse(decoded[1])
            if(test_data.uid == null || test_data.exp == null) throw Error() ////// REMEMBER TO ADD IAT TO JWT!!!
        }catch{
            throw Error("Heimdall: JWT did not include the correct information")
        }
        
        // redirect to vendor Auth Url  with jwt
        window.location.replace(vendorAuthRedirectUrl + `?auth_token=${info}`); // redirect user to this vendor's authentication endpoint with auth token
    }, false);
    return button;
}

export { signIn, signUp, AES, Utils, EdDSA, Hash, KeyExchange }