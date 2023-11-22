# Heimdall JavaScript SDK

## This repo is part of the FIRST PHASE code. All repos that have this message interact and use one another in some way.

## What is the Heimdall JS SDK?
This Javascript SDK was built to enable developers to use Tide's authentication flows in their own apps.

## Why should you use the Heimdall JS SDK?
The Heimdall SDK is a tool that allows a website developer to interact and take advantage of the Tide Network's many capabilities. This includes providing unparalleled security for private key management, authentication, and user account recovery.

## Implementation
The Heimdall SDK was designed to provide 3 layers of functionality for users to have maximum control over the flow, while also allowing a minimal setup to be extremely easy to understand.

#### Layer 1 - Main Heimdall Function
What do you want from Heimdall at its most general level? The tide button on your main page? For now we only provide the AddTideButton function, but more will soon come. This function should be the only heimdall code that is actually called by you / the vendor, all the other tide functions we'll see later will be called from within the tide process.
#### Layer 2 - Tide Button Action
What do you want the main heimdall function to do? Using AddTideButton as an example, what Tide process do you expect the button to execute. We have a variety of options, from PerformTideAuth which will redirect your user with the TideJWT to another URL, to GetUserInfo which will fulfill a promise allowing the vendor to retrieve values from the tide process.
#### Layer 3 - Action Promise/Callback
Some Tide Button Actions take a promise as a parameter, while others take a callback. The promise supplied to the action enables us to retrieve values from the tide process after its finished. This is especially useful because Main Heimdall Functions won't typically return values associated with tide flows, but things that the implementor wants such as a button. The promise allows the implementor to await on the tide flow completey seperate to the main heimdall function through the usage of a TidePromise.

On the other hand, a callback may be supplied to specific Button Actions that require commands from the vendor halfway through a tide process. For example, Tide's sign in, up and change password flows allow for the user to supply their own data to sign halfway through the process. This was allowed since for some applications e.g. SSH Authentication, the public key of the user is required to be signed - among other things. Hence, the callback will be called halfway through the button action, supplied with information such as the user's UID, public key, and account creation status, so the implementor can do whatever they require before the tide flow continues.

Enough talk, let's see some examples.
### Basic Tide Button - Perform Tide Auth - 1 Step
```javascript
const config = {
    vendorPublic: "+g/dDdxLqJMOLpJMZ3WIiJ1PEe/12bNhDoIBFmAvgR8=",
    vendorUrlSignature: "0dYi2k4V8Qa5BfKkNSkqcCGQ4d1BIJm6+A5Pwl8DNbZcxQljPnbNk0KG5FTkWjDTbckKHSG7xi1xuzb38uy3Bg==",
    homeORKUrl: "http://localhost:1001",
    vendorReturnAuthUrl: "http://localhost:6001?jwt=",
    enclaveRequest: {
        getUserInfoFirst: false, // 1 step process - callback is redundant
        refreshToken: true, // I want a TideJWT returned
        customModel: undefined // I do not want to provide a customModel
    }
}

const heimdall = new Heimdall(config);
const vendorCallback = () => null; // since getUserInfoFirst is false, a callback should just return null
const tideButtonAction = async (callback) => heimdall.PerformTideAuth(callback); // describe what we want the tide button to do
const tideButton = heimdall.AddTideButton(tideButtonAction, vendorCallback); // returns Tide Button for you to stylise
```
### Basic Tide Button - Perform Tide Auth - 2 Step
```javascript
const config = {
    vendorPublic: "+g/dDdxLqJMOLpJMZ3WIiJ1PEe/12bNhDoIBFmAvgR8=",
    vendorUrlSignature: "0dYi2k4V8Qa5BfKkNSkqcCGQ4d1BIJm6+A5Pwl8DNbZcxQljPnbNk0KG5FTkWjDTbckKHSG7xi1xuzb38uy3Bg==",
    homeORKUrl: "http://localhost:1001",
    vendorReturnAuthUrl: "http://localhost:6001?jwt=",
    enclaveRequest: {
        getUserInfoFirst: true, // 2 step process - we need to define a callback that returns a customModel
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
### Basic Tide Button - Get Completed - 1 Step
```javascript
const config = {
    vendorPublic: "+g/dDdxLqJMOLpJMZ3WIiJ1PEe/12bNhDoIBFmAvgR8=",
    vendorUrlSignature: "0dYi2k4V8Qa5BfKkNSkqcCGQ4d1BIJm6+A5Pwl8DNbZcxQljPnbNk0KG5FTkWjDTbckKHSG7xi1xuzb38uy3Bg==",
    homeORKUrl: "http://localhost:1001",
    vendorReturnAuthUrl: "http://localhost:6001?jwt=",
    enclaveRequest: {
        getUserInfoFirst: false, // 1 step process - we will not supply a customModel halfway through the process
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
### Basic Tide Button - Get Completed - 2 Step
```javascript
const config = {
    vendorPublic: "+g/dDdxLqJMOLpJMZ3WIiJ1PEe/12bNhDoIBFmAvgR8=",
    vendorUrlSignature: "0dYi2k4V8Qa5BfKkNSkqcCGQ4d1BIJm6+A5Pwl8DNbZcxQljPnbNk0KG5FTkWjDTbckKHSG7xi1xuzb38uy3Bg==",
    homeORKUrl: "http://localhost:1001",
    vendorReturnAuthUrl: "http://localhost:6001?jwt=",
    enclaveRequest: {
        getUserInfoFirst: true, // 2 step process - we will supply a customModel halfway through the process through the function "vendorAction"
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
