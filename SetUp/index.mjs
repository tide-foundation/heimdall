import { ed25519 } from '@noble/curves/ed25519';
import * as utils from '@noble/curves/abstract/utils';

const yourURL ='http://localhost:9000';

const priv = ed25519.utils.randomPrivateKey();

const pub = ed25519.getPublicKey(priv);
const msg = new TextEncoder().encode(yourURL);
const sig = ed25519.sign(msg, priv);

console.log("Vendor private key (save it somewhere): " + Buffer.from(priv).toString('base64'));
console.log("Vendor public key: " + Buffer.from(pub).toString('base64'));
console.log("Vendor URL Signature: " + Buffer.from(sig).toString('base64'));