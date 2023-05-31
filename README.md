# Heimdall JavaScript SDK

## This repo is part of the FIRST PHASE code. All repos that have this message interact and use one another in some way.

## Terms
1. ORKs - (Orchestrated Recluder of Keys) Nodes of the Tide Network that authenticate users and hold their keys.
2. CVK  - (Consumer-Vendor Key) A key associating each user on the network with a vendor/application, held in the ORKs that authenticate the user.
3. UID  - (Unique ID) A unique identifier of a key in the Tide Network. e.g., hash of the user's username.

## Installation
```javascript
import { signIn, signUp, AES, Utils, EdDSA, Hash, KeyExchange } from 'https://cdn.jsdelivr.net/gh/tide-foundation/heimdall@main/heimdall.js';
```

## SDK Functions
| Function          | Description                                                                                                    |
|-------------------|----------------------------------------------------------------------------------------------------------------|
| [signIn](#signin) | Authenticate a user and retrieve their CVK and UID                                                             |
| [signUp](#signup) | Create a new user in the network and generate their CVK and UID                                                |
| [AES](#aes)       | Encrypt/Decrypt data given a 32 byte key using [AES-GCM](https://en.wikipedia.org/wiki/Galois/Counter_Mode).   |
| [EdDSA](#eddsa)   | Sign/Verify data given a private and public keys using [EdDSA](https://en.wikipedia.org/wiki/EdDSA).           |
| [Hash](#hash)     | Hash data using [SHA256 and SHA512](https://en.wikipedia.org/wiki/SHA-2).                                      |
| [Utils](#utils)   | Provides a wide range of functions for serialization and conversions of Base64, Bytes, Hex, String and BigInt. |
| [KeyExchange](#keyexchange) | Establish and maintain a secret key between two users.                                           |

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
Promise of a text string of the decrypted data.
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
(sig: string, pub: string|PublicKey, msg: string|Uint8Array)

Remarks:
PublicKey can be generated with EdDSA.PublicKey.fromPrivate(priv)

Returns:
Promise of a boolean of whether the signature is valid or not.
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
### KeyExchange
#### start
```
Parameters: 
(my_cvk: BigInt, my_uid: string, other_uid: string)

Returns:
{
    session_key: string - base64 AES key,
    to_send: string - send this data to other client wishing to establish shared secret
}
```
#### establish
```
Parameters:
(sent_data: string, my_cvk: BigInt)

Returns:
{
    session_key: string - base64 AES key (the same created in 'start' function),
    other_uid: string - the uid of the user who provided 'sent_data' data
}
```
#### store_session_key
```
Parameters:
(my_cvk: BigInt, other_uid: string, session_key: string)

Remarks:
Will store session_key encrypted with the CVK in localStorage. other_uid is used to identify the session key stored.

Returns:
None
```
#### get_session_key
```
Parameters:
(my_cvk: BigInt, other_uid: string)

Returns:
string - Base64 AES key
```

## Examples
### signIn
```javascript
import { signIn } from 'https://cdn.jsdelivr.net/gh/tide-foundation/heimdall@main/heimdall.js';

var obj = await signIn.start_Heimdall('username1', 'password1');
console.log(obj.CVK); // bigint
console.log(obj.UID); // string encoded in hex
```
### signUp
```javascript
import { signUp } from 'https://cdn.jsdelivr.net/gh/tide-foundation/heimdall@main/heimdall.js';

var obj = await signUp.start_Heimdall('username2', 'password2');
console.log(obj.CVK); // bigint
console.log(obj.UID); // string encoded in hex
```
### AES
```javascript
import { AES } from 'https://cdn.jsdelivr.net/gh/tide-foundation/heimdall@main/heimdall.js';

var priv_key = BigInt(123456);
var msg = "some data";

var encrypted = await AES.encryptData(msg, priv_key);
var decrypted = await AES.decryptData(encrypted, priv_key); 
```
### EdDSA
```javascript
import { EdDSA } from 'https://cdn.jsdelivr.net/gh/tide-foundation/heimdall@main/heimdall.js';

var priv_key = BigInt(123456);
var pub_key = EdDSA.PublicKey.fromPrivate(priv_key); // create public key from private key
var msg = "some data";

var sig = await EdDSA.sign(msg, priv_key); // base64 signature
var valid = await EdDSA.verify(sig, pub_key, msg); // boolean

```
### KeyExchange
```javascript
import { KeyExchange } from 'https://cdn.jsdelivr.net/gh/tide-foundation/heimdall@main/heimdall.js';

var cvk1 = BigInt("96572544179587609705207997177575945883340731486940760508470570103787353305"); // cvk of user1
var cvk2 = BigInt("5176121613103035642549637242454417009050231022047032524491938228551868530590"); // cvk of user2

var uid1 = "76e34c4548e2a2975f9305a557607abb7f3865a9bd592a7e7624a55a77d2f24b"; // uid of user1
var uid2 = "29a3c59705f35e99740059a09ad037a82d5b9bc1eb743930d15a7c368d10a988"; // uid of user2

const {session_key: sk, to_send} = await KeyExchange.start(cvk1, uid1, uid2); // initiate key exchange - typically you would then send 'to_send" however means necessary to user2

const {session_key: sk_received, other_uid: uid_check} = await KeyExchange.establish(to_send, cvk2); // finish key exchange given data 'sent_data' from user1

var check = sk === sk_received && uid1 === uid_check; // check secret key received is same as the one sent, check that uid recieved is the one from the sender (user1)

//-------------------------------------------------------------------------------------------------

await KeyExchange.store_session_key(cvk1, uid2, sk); // example of storing session key in browser
const sk_browser = await KeyExchange.get_session_key(cvk1, uid2); // exmaple of retrieving session key from browser

```

## Integration with PlatyPus Passwords
[PlatyPus Passwords](https://github.com/sundayScoop/PlatyPasswords) is a PoC decentralized password manager that uses a user's CVK to encrypt their passwords. This means that even if PlatyPus Password's servers are completely compromised, all user data is secure with the full 128 bit entropy of the CVK, unlike other password managers that use only the hash of a master password to encrypt all other passwords.
