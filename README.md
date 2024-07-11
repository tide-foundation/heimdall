# Heimdall JavaScript SDK

## This repo is part of the FIRST PHASE code. All repos that have this message interact and use one another in some way.

## What is the Heimdall JS SDK?
Heimdall is the internal code name for Tide SDK. This Javascript SDK enables developers to consume Tide's flows in their own web apps.

## Why use the Heimdall JS SDK?
The Heimdall SDK is a developer tool that allows a website to interact and take advantage of the Tide Cybersecurity Fabric's (Tide's Decentralized Network) many capabilities of unparalleled security: from cryptographic key management, user authentication, authorization to complete authority and privacy management.

## Implementation
This SDK provides 3 layers of functionality for users to achieve maximum control over the flow, while requiring a minimal setup in order to allow extremely simple developer experience, ease of use and clarity.

#### Layer 1 - Main Heimdall Function
At its most basic level, Heimdall enables a Tide button on a Vendor's web page (you, the developer, are the Vendor, for this purpose). For now we only provide the `AddTideButton` function, but more be added in future iterations. This function should be the only Heimdall code that is actually called by you / the Vendor. All other Tide's functions, as shown later, will be called from within the Tide flows.
#### Layer 2 - Tide Button Action
Once the Tide's button is implemented, there are a variety of options available, from `PerformTideAuth` which will redirect your user to another URL with the TideJWT, to `GetUserInfo` which will fulfill a promise allowing the Vendor to retrieve values from the Tide's flow.
#### Layer 3 - Action Promise/Callback
Some Tide's Button Actions take a promise as a parameter, while others take a callback. The promise supplied to the action enables Vendor's devs to retrieve values from the Tide flow once it's finished. This is especially useful because Main Heimdall's Functions won't typically return values associated with Tide's flows, but things that the dev implementor wants such as a button. The promise allows the developer to await on the Tide's flow completely seperate to the main Heimdall function through the usage of a `TidePromise`.

Alternatively, a callback may be supplied to specific Button Actions that require commands from the Vendor halfway through a Tide's flow. For example, Tide's Sign-In, Sign-Up and Change-Password flows allow the user to certify (cryptographically sign) their own data halfway through the process. This enables applications, like SSH Authentication, to sign the public key of the user before completing the flow. In this example, the callback method will be called halfway through the Button Action, supplied with information such as the user's UID, public key, and account creation status, so the Vendor developer can do whatever they require before the Tide flow resumes.

Enough chit-chat. Let's dive in.
### Basic Tide Button - Perform Tide Authentication - Step 1
```javascript
const config = {
    vendorPublic: "+g/dDdxLqJMOLpJMZ3WIiJ1PEe/12bNhDoIBFmAvgR8=",
    vendorUrlSignature: "0dYi2k4V8Qa5BfKkNSkqcCGQ4d1BIJm6+A5Pwl8DNbZcxQljPnbNk0KG5FTkWjDTbckKHSG7xi1xuzb38uy3Bg==",
    homeORKUrl: "https://orkeylessh1.azurewebsites.net",
    vendorReturnAuthUrl: "http://localhost:6001?jwt=",
    enclaveRequest: {
        refreshToken: true, // I want a TideJWT returned
        customModel: undefined // I do not want to provide a customModel
    }
}

const heimdall = new Heimdall(config);
const tideButtonAction = async () => heimdall.PerformTideAuth(); // describe what we want the tide button to do
const tideButton = heimdall.AddTideButton(tideButtonAction); // returns Tide Button for you to stylise
```
### Basic Tide Button - Perform Tide Authentication - Step 2
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
  var customModel = {
    Name: "OpenSSH",
    Data: "Some data to sign" // this obviously won't work, but this is the format customModel should be e.g. have a Name and Data field
  }
  return customModel;
}
const tideButtonAction = async (callback) => heimdall.PerformTideAuth(callback); // describe what we want the tide button to do
const tideButton = heimdall.AddTideButton(tideButtonAction, vendorCallback); // returns Tide Button for you to stylise
```
### Basic Tide Button - Get Completed - Step 1
```javascript
const config = {
    vendorPublic: "+g/dDdxLqJMOLpJMZ3WIiJ1PEe/12bNhDoIBFmAvgR8=",
    vendorUrlSignature: "0dYi2k4V8Qa5BfKkNSkqcCGQ4d1BIJm6+A5Pwl8DNbZcxQljPnbNk0KG5FTkWjDTbckKHSG7xi1xuzb38uy3Bg==",
    homeORKUrl: "https://orkeylessh1.azurewebsites.net",
    vendorReturnAuthUrl: "http://localhost:6001?jwt=",
    enclaveRequest: {
        refreshToken: true, // I want a TideJWT returned
        customModel: undefined // I do not want to provide a customModel
    }
}

const heimdall = new Heimdall(config);
const tidePromise = new TidePromise(); // a TidePromise which allows us to get the values from the FULL sign in process
const tideButtonAction = async (promise) => heimdall.GetCompleted(promise); // describe what we want the tide button to do
const tideButton = heimdall.AddTideButton(tideButtonAction, tidePromise); // returns Tide Button for you to stylise

const values = await tidePromise.promise;
// Will include fields TideJWT, ModelSig (ModelSig will be undefined as no model was supplied)
```
### Basic Tide Button - Get Completed - Step 2
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
## For the full example, see [sample-vendor](https://github.com/tide-foundation/sample-vendor/tree/main) NOT UPDATED YET 22/11/23
