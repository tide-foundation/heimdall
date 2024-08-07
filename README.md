# Heimdall JavaScript SDK

## This repo is part of the FIRST PHASE code. All repos that have this message interact and use one another in some way.

## What is the Heimdall JS SDK?
Heimdall is the internal code name for Tide SDK. This Javascript SDK enables developers to consume Tide's flows in their own web apps.

## Why use the Heimdall JS SDK?
The Heimdall SDK is a developer tool that allows a website to interact and take advantage of the Tide Cybersecurity Fabric's (Tide's Decentralized Network) many capabilities of unparalleled security: from cryptographic key management, user authentication, authorization to complete authority and privacy management.

## Overview
This SDK provides 3 layers of functionality for users to achieve maximum control over the flow, while requiring a minimal setup in order to allow extremely simple developer experience, ease of use and clarity.

#### Layer 1 - Main Heimdall Function
At its most basic level, Heimdall enables a Tide button on a Vendor's web page (you, the developer, are the Vendor, for this purpose). For now we only provide the `AddTideButton` function, but more be added in future iterations. This function should be the only Heimdall code that is actually called by you / the Vendor. All other Tide's functions, as shown later, will be called from within the Tide flows.
#### Layer 2 - Tide Button Action
Once the Tide's button is implemented, there are a variety of options available, from `PerformTideAuth` which will redirect your user to another URL with the TideJWT, to `GetUserInfo` which will fulfill a promise allowing the Vendor to retrieve values from the Tide's flow.
#### Layer 3 - Action Promise/Callback
Some Tide's Button Actions take a promise as a parameter, while others take a callback. The promise supplied to the action enables Vendor's devs to retrieve values from the Tide flow once it's finished. This is especially useful because Main Heimdall's Functions won't typically return values associated with Tide's flows, but things that the dev implementor wants such as a button. The promise allows the developer to await on the Tide's flow completely seperate to the main Heimdall function through the usage of a `TidePromise`.

Alternatively, a callback may be supplied to specific Button Actions that require commands from the Vendor halfway through a Tide's flow. For example, Tide's Sign-In, Sign-Up and Change-Password flows allow the user to certify (cryptographically sign) their own data halfway through the process. This enables applications, like SSH Authentication, to sign the public key of the user before completing the flow. In this example, the callback method will be called halfway through the Button Action, supplied with information such as the user's UID, public key, and account creation status, so the Vendor developer can do whatever they require before the Tide flow resumes.

Enough chit-chat. Let's dive in.
## Implementation
To implement the Heimdall SDK, you only need to follow these 3 simple steps:
1. Download SDK
2. Generate a Vendor key and sign your Vendor URL
4. Implement Tide Button in page

### Securing the Vendor
One of Tide's strongest security feature is the binding of the security around the Vendor. This is to guarantee that no one other than the rightful Vendor has access to the services and information of that Vendor. This is done by the assignment of a cryptographic key to the Vendor.

To generate a key, use the provided `SetUp` utility in this SDK. This simple nodeJS utility will generate a new key for the Vendor and sign the base URL of the Vendor's site. See detailed usage instructions [here](README.md#using-the-vendorsign-utility).
Before you run the utility, make sure to verify the URL is set correctly for your application by editing the `index.mjs` file: `yourURL` should point to the base URL of your site, e.g. https://myapp.io or http://localhost:8000

The utility will spit out 3 results for you, that you'll need to keep:
- `Vendor private key` A BASE64 string representing your Vendor's private key. Keep it secret. Keep it safe.
- `Vendor public key` A BASE64 string representing your Vendor's public key. You'll need that key in your app.
- `Vendor URL Signature` A BASE64 string representing the signed URL of your application. You'll need that signature in your app.

### Basic Tide Button - 1 Step process
Here's an example you can put in your web app:
```javascript
import {Heimdall, TidePromise, FieldData} from './src/heimdall.js';
const config = {
    vendorPublic: "+g/dDdxLqJMOLpJMZ3WIiJ1PEe/12bNhDoIBFmAvgR8=",
    vendorUrlSignature: "0dYi2k4V8Qa5BfKkNSkqcCGQ4d1BIJm6+A5Pwl8DNbZcxQljPnbNk0KG5FTkWjDTbckKHSG7xi1xuzb38uy3Bg==",
    homeORKUrl: "https://orkeylessh1.azurewebsites.net",
    vendorReturnAuthUrl: "http://localhost:6001?jwt=",
    enclaveRequest: {
        refreshToken: true, 
        customModel: undefined 
    }
}

const heimdall = new Heimdall(config);
const tidePromise = new TidePromise(); // a TidePromise which allows us to get the values from the FULL sign in process
const tideButtonAction = async (promise) => heimdall.GetCompleted(promise); // describe what we want the tide button to do
const tideButton = heimdall.AddTideButton(tideButtonAction, tidePromise); // returns Tide Button for you to stylise

const values = await tidePromise.promise;
// Will include fields TideJWT, ModelSig (ModelSig will be undefined as no model was supplied)
```
Explenation:
- Import the Heimdall.js from a relative position of your app or store it in a CDN.
- Place the `Vendor private key` from previous step in the `vendorPublic` setting.
- Place the `Vendor URL Signature` in the `vendorUrlSignature` setting.
- The `homeORKUrl` setting denotes the default ORK (Tide Node) to be used by your user. Keep as is or select the one of your choice.
- Change the `vendorReturnAuthUrl` setting to include your app URL, but keep the "?jwt=" suffix as is. So if your app is hosted on myapp.io, change this setting to `"https://myapp.io?jwt="`.
- `refreshToken` should stay set to `true` to receive the JWT access token back.
- `customModel` is used to handle custom signature models (other than JWT) e.g. SSH access request

### Advanced Tide Button - 2 Step process
This examples shows a 2-step process that injects a request to sign a message with the user's key midway through the authentication flow:
```javascript
const config = {
    vendorPublic: "+g/dDdxLqJMOLpJMZ3WIiJ1PEe/12bNhDoIBFmAvgR8=",
    vendorUrlSignature: "0dYi2k4V8Qa5BfKkNSkqcCGQ4d1BIJm6+A5Pwl8DNbZcxQljPnbNk0KG5FTkWjDTbckKHSG7xi1xuzb38uy3Bg==",
    homeORKUrl: "https://orkeylessh1.azurewebsites.net",
    vendorReturnAuthUrl: "http://localhost:6001?jwt=",
    enclaveRequest: {
        refreshToken: true, // I want a TideJWT returned
        customModel: undefined // I do not want to provide a customModel - yet
    }
}

const heimdall = new Heimdall(config);
const vendorCallback = (userInfo) => {
    console.log("This is being run halfway through the flow");
    // I can build my customModel here since I have userInfo values => userInfo.PublicKey, userInfo.UID. userInfo.NewAccount
    var customModel = {
      Name: "OpenSSH",
      Data: "Some data to sign" // this obviously won't work, but this is the format customModel should be e.g. have a Name and Data field
    }
    //if(something fails idk) return null; <= Returning null to provide NO customModel is OK as long as enclaveRequest.refreshToken == true
    return customModel;
}
const tidePromise = new TidePromise(vendorCallback); // remember to add VendorCallBack here into the promise that gets sent to the button action
const tideButtonAction = async (promise) => heimdall.GetCompleted(promise); // describe what we want the tide button to do
const tideButton = heimdall.AddTideButton(tideButtonAction, tidePromise); // returns Tide Button for you to stylise

const values = await tidePromise.promise;
// Will include fields TideJWT, ModelSig
```

### Secure user data
The Heimdall SDK can also be used to lock and unlock sensitive data with keys stored in the Fabric through decentralized encryption and decryption processes in your web app.
Here's an example of encyption. This code needs to be added to the ones above:
``` javascript
const vuid = values.UID;

const enc = new TextEncoder();
const dec = new TextDecoder();

const encryptPromise = new TidePromise();
const idList = ["secret1", "secret2", "secret3"]
const fieldData = new FieldData(idList);
fieldData.add(enc.encode("yomamma"), ["secret2"]);

const ac2 = async(params) => { return await heimdall.EncryptUserData(params); }
const params = [vuid, fieldData, encryptPromise];
const tBtn2 = heimdall.AddTideButton(ac2, params);
tBtn2.style.background = "blue";
        
const serializedFields = await encryptPromise.promise;

console.log(serializedFields);
```
This example will create a list of 3 fields of secrets to encrypt. It will encode the value `yomamma` as secret #2. After loggin-in to Tide, another blue button will appear, once pressed, will encrypt that field-array and hold it in memory as `serializedFields`. This example will display that serialized variable in the browser's console.

Here's the code to decrypt that field:
``` javascript
const decryptPromise = new TidePromise();
const ac3 = async(params) => { return await heimdall.DecryptUserData(params); }
const params2 = [vuid, serializedFields, decryptPromise];
const tBtn3 = heimdall.AddTideButton(ac3, params2);
tBtn3.style.background = "purple";

const decrypted = await decryptPromise.promise;
const fieldData2 = new FieldData(idList);
fieldData2.addManyWithTag(decrypted);
const fdIds = fieldData2.getAllWithIds();

console.log(fdIds);
console.log(dec.decode(fdIds[1].Data));
```
This script will present a purple Tide button, once pressed will decrypt the encrypted data and will log the results to console.

## Secure user data (without buttons)
Here's another way to encrypt and decrypt similar information using a similar technique that doesn't use a Tide-branded button. Be aware that without a user interaction, like pressing a button, most browsers will block the necessary "pop-up" action required for this facility.
``` javascript
// encryption
const encryptPromise = new TidePromise();
const idList = ["secret1", "secret2", "secret3"]
const fieldData = new FieldData(idList);
fieldData.add(enc.encode("yomamma"), ["secret2"]);
heimdall.EncryptUserData([vuid, fieldData, encryptPromise]);
const serializedFields = await encryptPromise.promise;
console.log(serializedFields)

//decryption		
const fieldDatasDecrypted = new FieldData(idList);
const tidePromiseDecrypt = new TidePromise();
heimdall.DecryptUserData([vuid, serializedFields, tidePromiseDecrypt]);
const decryptedRaw = await tidePromiseDecrypt.promise; 
fieldDatasDecrypted.addManyWithTag(decryptedRaw); 
const decryptedWithIds = fieldDatasDecrypted.getAllWithIds();
console.log(decryptedWithIds)
console.log(dec.decode(decryptedWithIds[1].Data));
```

## For a full project example, see [SecretAlbum example](SecretAlbum) in this repo.

# FAQ

## Using the SetUp utility
To use the `SetUp` utility to generate keys and sign the app URL, you'll need to build it first. The utility is a nodeJS application that requires NPM and NODE installed on your machine.
1. Install prerequisits: [Node and NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
2. Navigate to the `/SetUp/` folder in this repo
3. Compile using `npm install`
4. Change the `yourURL` URL setting in `index.mjs`
5. Run using `node index.mjs`
Here's this process on a Debian machine:
``` shell
sudo apt install -y npm
sudo apt install -y node
cd SetUp
nano index.mjs
npm install
node index.mjs
```
