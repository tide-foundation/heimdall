import { TidePromise, FieldData } from 'https://cdn.jsdelivr.net/gh/tide-foundation/heimdall@main/src/heimdall.js';
import { heimdall, idList } from "./config.js"
import { encrypt, decrypt } from "./AES.js";

export const canvasWidth = 300;
export const canvasHeight = 300;
export const encryptedDefaultImage = new Image(150, 150);
encryptedDefaultImage.src = "/images/encrypted2.png";

export function verifyLogIn() {
    var uid = window.sessionStorage.getItem("uid");
    var publicKey = window.sessionStorage.getItem("publickey");
    var jwt = window.sessionStorage.getItem("jwt");


    if (uid === null || publicKey == null || jwt == null) {
        alert("uid or publicKey not found, please log in first")
        window.location.replace(window.location.origin);
    }
    return [uid, publicKey, jwt]
}

export async function getTime() {
    const respTime = await fetch(window.location.origin + `/user/getTime`);
    return await respTime.text()
}

export async function registerAlbum() {
    console.log("REGISTER")
    
    const [uid, publicKey, jwt] = verifyLogIn()

    const form = new FormData();
    form.append("userAlias", uid.substring(0, 15))
    form.append("jwt", jwt)
    form.append("publicKey", publicKey)
    const resp = await fetch(window.location.origin + `/user/registeralbum?albumId=${uid}`, {
        method: 'POST',
        body: form
    });
    if (!resp.ok) alert("Something went wrong with uploading the image");
    return
}

export function processImage(imgFile) {
    const imgUrl = `${URL.createObjectURL(imgFile)}`
    const imgInstance = new Image(150, 150);
    imgInstance.src = imgUrl;
    return imgInstance;
}

export function prepareAlbumCanvas(imageCell, i, canvasWidth, canvasHeight) {
    let canvas = document.createElement("canvas");
    let canvasName = "myAlbumCanvas" + i.toString()
    canvas.setAttribute("id", canvasName);
    imageCell.appendChild(canvas)
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    return canvas
}

// source: https://alicebobandmallory.com/articles/2010/10/14/encrypt-images-in-javascript
function pixelArrToString(arr) {
    var s = "";
    for (var i = 0; i < arr.length; i += 4) {
        s += (String.fromCharCode(arr[i])
            + String.fromCharCode(arr[i + 1])
            + String.fromCharCode(arr[i + 2])
            + String.fromCharCode(arr[i + 3]));
    }
    return s;
}

// source: https://alicebobandmallory.com/articles/2010/10/14/encrypt-images-in-javascript
function stringToPixelArr(s) {
    var arr = [];
    for (var i = 0; i < s.length; i += 4) {
        for (var j = 0; j < 4; j++) {
            arr.push(s.substring(i + j, i + j + 1).charCodeAt());
        }
    }
    return arr;
}

export async function encryptImage(imgData, vuid) {
    console.log(imgData.data.length)
    var pixelArray = imgData.data;
    const [encrypted, key] = await encrypt(pixelArray);

    const fd = new FieldData(idList);
    fd.add(key, ["photoKey"]);
    const tP = new TidePromise();
    heimdall.EncryptUserData([vuid, fd, tP]);

    const encryptedKey = await tP.promise;
    console.log("Image E Length 1 " + encrypted.length);
    console.log("Image Key: ");
    console.log(key);
    return [bytesToBase64(new Uint8Array(encrypted)), bytesToBase64(encryptedKey[0])]; // we only encrypted one key
    
}



export async function decryptImage(vuid, encryptedImgs, encryptedImgKeys) {
    console.log("about to decrypt");
    // decrypt encryptedImgKey with heimdall
    const tP = new TidePromise();
    heimdall.DecryptUserData([vuid, encryptedImgKeys.map(e => base64ToBytes(e)), tP])
    const d = (await tP.promise);
    const fd = new FieldData(idList);
    fd.addManyWithTag(d);
    const fdIds = fd.getAllWithIds();

    console.log("heimdall decrypted");

    // decrypt encryptedImg with key
    const pre_images = encryptedImgs.map(async (image, i) => await decrypt(base64ToBytes(image), fdIds[i].Data));
    const images = await Promise.all(pre_images);

    return images;
}



function getBase64Code(charCode) {
    if (charCode >= base64codes.length) {
        throw new Error("Unable to parse base64 string.");
    }
    const code = base64codes[charCode];
    if (code === 255) {
        throw new Error("Unable to parse base64 string.");
    }
    return code;
}
export function base64ToBytes(str) {
    if (str.length % 4 !== 0) {
        throw new Error("Unable to parse base64 string.");
    }
    const index = str.indexOf("=");
    if (index !== -1 && index < str.length - 2) {
        throw new Error("Unable to parse base64 string.");
    }
    let missingOctets = str.endsWith("==") ? 2 : str.endsWith("=") ? 1 : 0,
        n = str.length,
        result = new Uint8Array(3 * (n / 4)),
        buffer;
    for (let i = 0, j = 0; i < n; i += 4, j += 3) {
        buffer =
            getBase64Code(str.charCodeAt(i)) << 18 |
            getBase64Code(str.charCodeAt(i + 1)) << 12 |
            getBase64Code(str.charCodeAt(i + 2)) << 6 |
            getBase64Code(str.charCodeAt(i + 3));
        result[j] = buffer >> 16;
        result[j + 1] = (buffer >> 8) & 0xFF;
        result[j + 2] = buffer & 0xFF;
    }
    return result.subarray(0, result.length - missingOctets);
}

const base64codes = [
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 62, 255, 255, 255, 63,
    52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 255, 255, 255, 0, 255, 255,
    255, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
    15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 255, 255, 255, 255, 255,
    255, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51
];

const base64abc = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
    "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
    "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "/"
];
export function bytesToBase64(bytes) {
    let result = '', i, l = bytes.length;
    for (i = 2; i < l; i += 3) {
        result += base64abc[bytes[i - 2] >> 2];
        result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
        result += base64abc[((bytes[i - 1] & 0x0F) << 2) | (bytes[i] >> 6)];
        result += base64abc[bytes[i] & 0x3F];
    }
    if (i === l + 1) { // 1 octet yet to write
        result += base64abc[bytes[i - 2] >> 2];
        result += base64abc[(bytes[i - 2] & 0x03) << 4];
        result += "==";
    }
    if (i === l) { // 2 octets yet to write
        result += base64abc[bytes[i - 2] >> 2];
        result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
        result += base64abc[(bytes[i - 1] & 0x0F) << 2];
        result += "=";
    }
    return result;
}