# Heimdall JavaScript SDK

## Terms
1. ORKs - Nodes of the Tide Network that authenticate users and hold their keys.
2. CVK  - (Consumer Vendor Key) A key associated with each user in the network, held in the ORKs that authenticate the user.
3. UID  - (Unique ID) A unique identifier of a user in the Tide Network, created by hashing the user's username.

## Installation
```
import { signIn, signUp, AES, Utils, EdDSA, Point, Hash } from 'https://cdn.jsdelivr.net/gh/tide-foundation/heimdall@main/heimdall.js';
```

## SDK Functions
| Function          | Description                                                                                                    |
|-------------------|----------------------------------------------------------------------------------------------------------------|
| [signIn](#signin) | Authenticate a user and retrieve their CVK and UID                                                             |
| [signUp](#signup) | Create a new user in the network and retrieve their CVK and UID once the process completes                     |
| [AES](#aes)       | Encrypt/Decrypt data given a 32 byte key using AES GCM.                                                        |
| [EdDSA](#eddsa)   | Sign/Verify data given a private and public keys using EdDSA.                                                  |
| [Point](#point)   | Provides access to low level point arithmetic and serialization functions for Ed25519 points.                  |
| [Hash](#hash)     | Hash data using SHA256 and SHA512.                                                                             |
| [Utils](#utils)   | Provides a wide range of functions for serialization and conversions of Base64, Bytes, Hex, String and BigInt. |

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

Remarks:
pub paramter can either be a Point object, or a base64 encoded point, obtained from point.toBase64().

Returns:
Promise of a boolean of whether the signature is valid or not.
```
### Point
```
Static values:
Point.g                 Ed25519 Base Point

Functions:
times(num: bigint)      Returns a point multiplied by specificied num.
add(other: Point)       Returns a point summed with another point.
toBase64()              Returns base64 encoding of point. Used to send point across network.
fromB64(data: string)   Returns a point object provided a base64 encoded string.
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
import { signIn } from 'https://cdn.jsdelivr.net/gh/tide-foundation/heimdall@main/heimdall.js';

var obj = await signIn.start_Heimdall('username1', 'password1');
console.log(obj.CVK); // bigint
console.log(obj.UID) // string encoded in hex
```
### signUp
```
import { signUp } from 'https://cdn.jsdelivr.net/gh/tide-foundation/heimdall@main/heimdall.js';

var obj = await signUp.start_Heimdall('username2', 'password2');
console.log(obj.CVK); // bigint
console.log(obj.UID) // string encoded in hex
```
### AES
```
import { AES } from 'https://cdn.jsdelivr.net/gh/tide-foundation/heimdall@main/heimdall.js';

var priv_key = BigInt(123456);
var msg = "some data";

var encrypted = await AES.encryptData(msg, priv_key);
var decrypted = await AES.decryptData(encrypted, priv_key); 
```
### EdDSA
```
import { EdDSA, Point } from 'https://cdn.jsdelivr.net/gh/tide-foundation/heimdall@main/heimdall.js';

var priv_key = BigInt(123456);
var pub_key = Point.g.times(priv_key).toBase64(); // create public key from private key
var msg = "some data";

var sig = await EdDSA.sign(msg, priv_key); // base64 signature
var valid = await EdDSA.verify(sig, pub_key, msg); // boolean

```

## Integration with PlatyPus Passwords
PlatyPus Passwords [link](https://github.com/sundayScoop/PlatyPasswords) is a PoC decentralized password manager that uses a user's CVK to encrypt their passwords. This means that even if PlatyPus Password's servers are completely compromised by adverseries, all user data is secure with 128 bit entropy from the CVK, unlike other password managers that use the hash of a master password to encrypt all other passwords.
