# SecretAlbum
## What is SecretAlbum?
Social media companies have created platforms where people can upload and share data about their personal lives with friends, family, acquaintances, and even strangers. Some data are meant to be public, while others more private. Unfortunately, there are too many ways your private data can find its way to unauthorized players: hackers can exploit and leak data from the companies' servers, intrusive government entities can use them on a whim, social media companies can sell them to the highest bidders through legal loopholes, and etc. Despite such concerns, uploading private data to social media apps have become all too commonplace today.

SecretAlbum is a proof-of-concept image-sharing social media app that aims to give complete privacy and control to its users. It achieves this by encrypting a user's image with a secure key before sending it to the server. Hence, it is impossible for the server to make any sense of the user's data that it stores in its own database (unless the user chooses to make it public), let alone a hacker or the government. The said secure key, also known as Consumer-Vendor Key (CVK), can only be obtained by the user by authenticating with username + password through the Heimdall SDK (https://github.com/tide-foundation/heimdall), which uses Tide's decentralized authentication protocol. This means that the app's server does not hold the users' passwords (nor hashes), which gives one more reason for malicious actors to leave it alone. Learn more about the Tide Protocol here: https://tide.org/tideprotocol

SecretAlbum is forked from [AgeOfAlgorithms](https://github.com/AgeOfAlgorithms/SecretAlbum).

## Implementation
Heimdall SDK's signIn and signUp functions are used to retrieve the user's CVK and UID (hash of username), which are then stored in the browser session for later. The user is always given the option to 'log out' which would clear the session of the CVK and UID. 

The app uses Elliptic Curve Cryptography (ECC) on Ed25519 curve to encrypt/decrypt sensitive data. In the following sections, I use the notation * to denote elliptic curve multiplication.

### 1. Encrypting/Decrypting and Publishing Images 
Heimdall SDK's AES functions are used to encrypt sensitive data that would be stored in the server, which ensures that the server cannot make any sense of the data. When uploading an image, a random BigInt seed value is chosen and the RGB image data is AES encrypted with `imageKey = G * seed`. The seed is then AES encrypted with CVK before being sent along with the encrypted image data to the server to be stored. The reason why `G * seed` is used as the key rather than just seed is to allow the sharing mechanism described in the next subsection.

Later, when viewing the image, the user can retrieve from the server the encrypted image data along with the encrypted seed, and perfom the following operations to decrypt the image data: 

```
imageKey = G * AESdecrypt(encryptedSeed, CVK) = G * seed
decryptedImage = AESdecrypt(encryptedImage, imageKey)
```

Evidently, only the user with the correct CVK can decrypt the seed, then decrypt the image data.

A user can also choose to make his/her image public. In this case, the image key is sent to the server to be stored in the database, and anyone can retrieve this key to decrypt the corresponding image.

### 2. Authenticating Requests
An http request to the server is assumed to be coming from the user with the UID specified in the request, which means that an imposter can pretend to be another user by changing the UID value before sending it. This poses no security issue for actions such as viewing images, since an imposter cannot decrypt the images without a proper CVK. However, the vulnerability does allow an imposter to perform other dangerous actions such as deleting or publishing another user's images. Hence the app authenticates these requests to the server using Heimdall SDK's EdDSA functions. To send each sensitive request, a user signs a message using their CVK (also known as private key) and includes this signature in the request form. When the server receives the request, it verifies the signature using the corresponding public key queried from the simulator website, ensuring that the request came from the indicated user.

However, if the same message is used each time, it would generate the same signature over and over again. In this case, a hacker who somehow obtains the signature could masquerade as the victim and pass the EdDSA verification test. To solve this problem, a modified JWT protocol was implemented. With each action request, the client sends a JWT token consisting of: 1. a message which is the current time of the server queried and converted to base64, and 2. the said message signed with CVK (private key). Upon receiving this request, the server can verify the signature using the given message and the public key which is either queried from the simulator website or loaded from the database if it has already been registered. Once verification passes, the server then checks whether the time in the message is within the last n seconds of the current time. If not, the token has expired and the server denies the requested action. Since every request would generate a unique message, it would generate a unique signature, which means the signature could never be used again after it expires.

## How to run SecretAlbum Locally
Make sure to have the [.NET SDK](https://dotnet.microsoft.com/en-us/download/dotnet/6.0) installed, clone the repo, then run the following code from the SecretAlbum directory:

```
dotnet run --urls=http://localhost:8000
```

Navigating to [localhost](http://localhost:8000) will show you the login page. 

To explore what the encrypted data looks like, install a DB explorer such as [Db Browswer](https://sqlitebrowser.org/) and open the LocalDatabase.db in the project.

