export async function encrypt(encodedData) {
    const rawKey = window.crypto.getRandomValues(new Uint8Array(32));
    let key = await window.crypto.subtle.importKey("raw", rawKey, "AES-GCM", true, [
        "encrypt",
        "decrypt",
    ]);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        encodedData
    );
    return [ConcatUint8Arrays([iv, new Uint8Array(encryptedBuffer)]), rawKey]; // key will be encrypted with tide
}

export async function decrypt(encrypted, rawKey) {
    let key = await window.crypto.subtle.importKey("raw", rawKey, "AES-GCM", true, [
        "encrypt",
        "decrypt",
    ]);
    const iv = encrypted.slice(0, 12);
    const data = encrypted.slice(12);
    const decryptedContent = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        key,
        data
    );
    return new Uint8Array(decryptedContent);
}

export function ConcatUint8Arrays(arrays) {
    const totalLength = arrays.reduce((sum, next) => next.length + sum, 0);
    var newArray = new Uint8Array(totalLength);
    var offset = 0;
    arrays.forEach(item => {
        newArray.set(item, offset);
        offset += item.length;
    });
    return newArray;
}