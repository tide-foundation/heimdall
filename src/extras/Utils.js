export function deserializeUint8Array(base64String) {
    const binaryString = atob(base64String);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}
export function serializeUint8Array(uint8Array) {
    return btoa(String.fromCharCode.apply(null, uint8Array));
}

export function jwtValid(jwt){
    const decoded = jwt.split(".")
        .map(a => a.replace(/-/g, '+').replace(/_/g, '/') + "==".slice(0, (3 - a.length % 4) % 3));

    const header = atob(decoded[0]) // header 
    const payload = atob(decoded[1]) // payload

    if(decoded.length != 3) return false;
    
    try{
        let test_data = JSON.parse(header)
        if(test_data.typ != "JWT" || test_data.alg != "EdDSA") return false;
        test_data = JSON.parse(payload)
        if(test_data.uid == null || test_data.exp == null) return false;
    }catch{
        return false;
    }
    return true;
}
