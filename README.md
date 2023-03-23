# Heimdall

## What is Heimdall?
Heimdall is a JS SDK built to allow developers to secure user secrets without holding any keys. Heimdall (yes, the one from Norse mythology) creates a bridge between a vendor's client application and the user's identity (username + password). The only thing that crosses this bridge is the user's CVK, which is securely retrieved from Tide's decentralized network of authentication nodes. The vendor can now secure user data from the client side, without ever needing:
1. The user's username or password for authentication
2. A private key stored on their side to encrypt the user's data
3. To have access to the user's plain text data (all encryption can be done client side)

We acknowledge that some aspects of this can be insure, such as the vendor having access to the same DOM as the user, although these issues will be smoothed out in later releases, where we will begin to introduce signature and decryption services done by the Tide network on a secure enclave.

## Example
A very very basic web page that integrates the Tide Enclave with the vendor's front end can be found in example.html. Notice how tide.js is being sourced at the top of the html page.

## Usage
Add this line to the top of your html page

```<script type="module" src="https://tide-foundation.github.io/heimdall/tide.js"></script>```

Inside another set of ```<script>``` tags, add a function called ```heimdall()``` like this:
```
<script>
        function heimdall(obj){ // i get called from inside tide.js
            // do stuff with cvk
            localStorage.setItem("CVK", obj.CVK);
            localStorage.setItem("UID", obj.UID);

            window.location.replace(window.location.href + "main.html"); // redirect to main page
        }
    </script>
```
The above function ```heimdall``` will be called by either the sign in/up Tide functions, with an object cosisiting of:
```
{
  CVK: BigInt <- The actual CVK of the user, don't steal it from their browser!
  UID: string <- UID of the user for Id purposes
}
```

That's it! This SDK is great for Single Page Apps which want to encrypt user secrets with a key THEY DON'T HOLD. Instead, the Tide Enclave handles retrieving the key from the Tide Network, which it then passes to the heimdall function YOU implement. You can then choose what to do with the user's CVK or UID.
