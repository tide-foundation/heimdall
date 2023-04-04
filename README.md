# Heimdall JavaScript SDK

## Terms
1. ORKs - Nodes of the Tide Network that authenticate users and hold their keys.
2. CVK  - (Consumer Vendor Key) A key associated with each user in the network, held in the ORKs that authenticate the user.
3. UID  - (Unique ID) A unique identifier of a user in the Tide Network, created by hashing the user's username.

## Installation
```
import { signIn, signUp, AES, Utils, EdDSA, Point, Hash } from 'https://cdn.jsdelivr.net/gh/tide-foundation/heimdall@main/heimdall.js';
```

## Available Functions
```
SDK Commands:
  signIn.start_Heimdall     Authenticate a user and retrieve their CVK and UID
  signUp.start_Heimdall     Create a new user in the network and retrive their CVK and UID once the process completes
  AES.encryptData           Encrypt data given a 32 byte key using AES GCM.
  AES.decryptData           Decrypt encrypted data given a 32 byte key using AES GCM.
  EdDSA.sign                Sign data given a private key using EdDSA.
  EdDSA.verify              Verify a signature provided a public key and data to verify.
  Point                     Provides access to low level point arithmetic and serialization functions for Ed25519 points.           
  Hash.SHA256_Digest        Hash data using SHA256.
  Hash.SHA512_Digest        Hash data using SHA512.
  Utils                     Provides a wide range of functions for serialization and conversions of Base64, Bytes, Hex, String and BigInt.
```
## Usage
### signIn
#### start_Heimdall
```
Parameters:
(username: string, password: string)

Returns:
Promise of Object
{
    CVK: BigInt,
    UID: string
}
```
### signUp
#### start_Heimdall
```
Parameters:
(username: string, password: string)

Returns:
Promise of Object
{
    CVK: BigInt,
    UID: string
}
```
### AES
#### encryptData
```
Parameters:
(secretData: string|Uint8Array, key: Uint8Array|CryptoKey|bigint|string)

Returns:
Promise of a base64 string of the encrypted data.
```
#### decryptData

```
Parameters:
(encryptedData: string, key: Uint8Array|CryptoKey|bigint|string)

Returns:
Promise of a basic ASCII string of the decrypted data.
```
### EdDSA
#### sign
```
Parameters:
(msg: string|Uint8Array, priv: bigint)

Returns:
Promise of a base64 encoded EdDSA signature.
```
#### verify
```
Parameters:
(sig: string, pub: string|Point, msg: string|Uint8Array)

Returns:
Promise of a boolean of whether the signature is valid or not.
```
### Point
```
Static values:
Point.g                       Ed25519 Base Point

Functions:
times(num: bigint)      Returns a point multiplied by specificied num
add(other: Point)       Returns a point summed with another point
toBase64()              Returns base64 encoding of point. Used to send point across network.
fromB64(data: string)   Returns a point object provided a 
```
### Hash
#### SHA256_Digest
```
Parameters:
(message: string|Uint8Array)

Returns:
Promise of a Uint8Array
```
#### SHA512_Digest
```
Parameters:
(message: string|Uint8Array)

Returns:
Promise of a Uint8Array
```
### Utils
#### RandomBigInt
```
Paramteres:
None

Returns:
BigInt
```
#### BigIntToByteArray
```
Parameters:
(num: BigInt)

Returns:
Uint8Array
```
#### BigIntFromByteArray
```
Parameters:
(bytes: Uint8Array)

Returns:
BigInt
```
#### ConcatUint8Arrays
```
Parameteres:
(arrays: Uint8Array[])

Returns:
Uint8Array
```
#### StringToUint8Array
```
Parameters:
(string: string)

Returns:
Uint8Array
```
#### Hex2Bytes
```
Parameters: 
(string: string)

Returns:
Uint8Array
```
#### Bytes2Hex
```
Parameters:
(byteArray: Uint8Array)

Returns:
String encoded in hexadecimal
```
#### bytesToBase64
```
Parameters:
(bytes: Uint8Array)

Returns:
String encoded in base64
```
#### base64ToBytes
```
Parameters:
(str: string)

Returns:
Uint8Array
```

## Examples
### signIn
```
var obj = await signIn.start_Heimdall('username1', 'password1');
console.log(obj.CVK); // bigint
console.log(obj.UID) // string encoded in hex
```
### signUp
```
var obj = await signUp.start_Heimdall('username2', 'password2');
console.log(obj.CVK); // bigint
console.log(obj.UID) // string encoded in hex
```
### AES
```
var priv_key = BigInt(123456);
var msg = "some data";

var encrypted = await AES.encryptData(msg, priv_key);
var decrypted = await AES.decryptData(encrypted, priv_key);
```
### EdDSA



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

## Integration with PlatyPus Passwords
PlatyPus Passwords [link](https://github.com/sundayScoop/PlatyPasswords) is a PoC decentralized password manager that uses a user's CVK to encrypt their passwords. This means that even if PlatyPus Password's servers are completely compromised by adverseries, all user data is secure with 128 bit entropy from the CVK, unlike other password managers that use the hash of a master password to encrypt all other passwords.
