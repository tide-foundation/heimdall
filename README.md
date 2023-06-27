# Heimdall JavaScript SDK

## This repo is part of the FIRST PHASE code. All repos that have this message interact and use one another in some way.

## What is the Heimdall JS SDK?
This Javascript SDK was built to enable developers to use Tide's authentication flows in their own apps. Assuming you have already implemented the .NET [vendor-sdk](https://github.com/tide-foundation/vendor-sdk), you can follow these simple steps to implement the "Tide Button" in your front end page. This Tide Button works similar to the login with google button (just a lot simpler for now). 

## Key Generation
You'll have to first create a secret key and sign the URL where you implement your Tide Button with EdDSA, luckily I created a JSFiddle so you don't have to do it yourself. Go to [this fiddle](https://jsfiddle.net/NotMyDog/vos0eLbq/1/) and change the ```yourYourSiteURL``` value to the URL where you will host the Tide Button (your login page). Click the "RUN" button on the top left and you'll see two values pop up in the console. Keep these for later.

Keep in mind you don't need to store your site's private key for now, just the public key which is shown in the console.

## Implementation
1. Import Heimdall into your JS:
```javascript
import {AddTideButton} from "https://cdn.jsdelivr.net/gh/tide-foundation/heimdall@main/heimdall.js";
```
2. Create the config object:
```javascript
const config = {
  vendorPublic: {VALUE FROM THE CONSOLE},
  vendorUrlSignature: {VALUE FROM THE CONSOLE},
  homeORKUrl: "https://h4x22ork1.azurewebsites.net/index.html" // THIS MAY CHANGE!!!! WE WILL POST A LINK OF ALL THE AVAILABLE ORKS SOMEWHERE ONE DAY
    }
```

3. Add the Tide Button to your page:
```javascript
const button = AddTideButton(config);
```

You can then modify the button's style positioning and other stuff by interacting with the button object, which represents the Tide Button.

## Example implementation
```javascript
const config = {
  vendorPublic: "bGKZOFa1LUJzgHY1HOVNQdO9iFTuBkB6EvpJiYqSDBs=",
  vendorUrlSignature: "Fi/fvZmmwsK2IJfXC9y2Oh0UIabnSBJlS5XYlsSYAxf9OEOK543D6nM5b5Xs2h2GFl93AzJ7yrU1u7fzk4/EDQ==",
  homeORKUrl: "http://localhost:1002"
}

const button = AddTideButton(config);
button.className = "vendor-form-btn";
button.innerHTML = "LOGIN";
let btnDiv = document.getElementById("tide-btn-div");
btnDiv.appendChild(button);

```

## For the full example, see [sample-vendor](https://github.com/tide-foundation/sample-vendor/tree/main)
