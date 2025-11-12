export const version = "1";

export function wrapper(arr: NestedEntry): TideMemory {
    // If array is only Uint8Arrays - create a TideMemory out of it 
    // If there is any entry in an array that is another array
    //     -> Go inside that array and repeat the process
    if(arr.every(a => a instanceof Uint8Array)) return TideMemory.CreateFromArray(arr);
    else {
        // Go through each entry
        arr.forEach((a) => {
            // If the entry is an array, apply the wappa on it
            if(Array.isArray(a)){
                // Reassign the value of the entry -> to the serialized wrapper
                a = wrapper(a);
            }else if(a["value"]){
                // Let's check if is a number, boolean or Uint8Array. If none of those, it'll be null
                const res = encode(a["value"]);
                if(res){
                    // serialized correctly
                    a = res;
                }else{
                    if(typeof a["value"] == "string"){
                        // Serialize it into Uint8Array
                        if(!a["encoding"]){
                            // No encoding provided
                            // Let's default to UTF-8
                            a = encodeStr(a["value"], "UTF-8");
                        }else{
                            a = encodeStr(a["value"], a["encoding"]);
                        }
                    }
                    else throw 'Unsupported type';
                }
            }
            else throw 'Unexpected format';
        })
        if(arr.every(a => a instanceof Uint8Array)) return TideMemory.CreateFromArray(arr); // Check to make sure everything was serialized correctly from the wappa
        else throw 'There was an error encoding all your values';
    }
}

export function encodeStr(str: string, enc: string): Uint8Array {
    switch(enc){
        case "UTF-8":
            return new TextEncoder().encode(str);
        case "HEX":
            // 1) Strip 0x prefix
            let normalized = str.replace(/^0x/i, "");

            // treat empty as invalid
            if (normalized.length === 0) {
                throw new Error("Empty hex string");
            }

            // 2) Pad odd length
            if (normalized.length % 2 !== 0) {
                normalized = "0" + normalized;
            }

            // 3) Validate
            if (!/^[0-9A-Fa-f]+$/.test(normalized)) {
                throw new Error("Invalid hex string");
            }

            // 4) Parse into bytes
            const byteCount = normalized.length / 2;
            const out = new Uint8Array(byteCount);
            for (let i = 0; i < byteCount; i++) {
                out[i] = Number.parseInt(normalized.slice(i * 2, i * 2 + 2), 16);
            }

            return out;
        case "B64":
            const binaryString = atob(str);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes;
        case "B64URL":
            // 1) Replace URL-safe chars with standard Base64 chars
            let base64 = str.replace(/-/g, '+').replace(/_/g, '/');

            // 2) Pad with '=' so length is a multiple of 4
            const pad = base64.length % 4;
            if (pad === 2) {
                base64 += '==';
            } else if (pad === 3) {
                base64 += '=';
            } else if (pad === 1) {
                // This shouldn’t happen for valid Base64-URL, but just in case…
                base64 += '===';
            }

            // 3) Decode to binary string
            const binary = atob(base64);

            // 4) Convert to Uint8Array
            const ulen = binary.length;
            const ubytes = new Uint8Array(ulen);
            for (let i = 0; i < ulen; i++) {
                ubytes[i] = binary.charCodeAt(i);
            }
            return ubytes;
        default:
            // catches anything else (should never happen)
            throw new TypeError(`Unsupported encoding: ${enc}`);
    }
}

export function encode(data: number | boolean | Uint8Array): Uint8Array | undefined {
    switch (typeof data) {
    case 'number':
        const buffer = new ArrayBuffer(4);
        const view = new DataView(buffer);
        view.setUint32(0, data, true);
        return new Uint8Array(buffer);

    case 'boolean':
      return new Uint8Array([data ? 1 : 0]);

    case 'object':
      // since a Uint8Array is an object at runtime, we need to check it here
      if (data instanceof Uint8Array) {
        return new Uint8Array(data.slice(0));
      }
      // if we fall through, it wasn't one of our allowed types
      throw new TypeError(`Unsupported object type: ${data}`);

    default:
      // catches anything else (should never happen)
      return undefined;
  }
}

interface entry{
    value: any;
    encoding?: string;
}
type NestedEntry = (entry | Uint8Array | NestedEntry)[]; // added Uint8Array as an optional type so we can serialize it without deep copy


// Tide Memory Object helper functions from tide-js
export class TideMemory extends Uint8Array{
    static CreateFromArray(datas: Uint8Array[]): TideMemory   {
        const length = datas.reduce((sum, next) => sum + 4 + next.length, 0);
        const mem = this.Create(datas[0], length);
        for(let i = 1; i < datas.length; i++){
            mem.WriteValue(i, datas[i]);
        }
        return mem;
    }
    static Create(initialValue: Uint8Array, totalLength: number, version: number = 1): TideMemory {
        if (totalLength < initialValue.length + 4) {
            throw new Error("Not enough space to allocate requested data. Make sure to request more space in totalLength than length of InitialValue plus 4 bytes for length.");
        }

        // Total buffer length is 4 (version) + totalLength
        const bufferLength = 4 + totalLength;
        const buffer = new TideMemory(bufferLength);
        const dataView = new DataView(buffer.buffer);

        // Write version at position 0 (4 bytes)
        dataView.setInt32(0, version, true); // true for little-endian

        let dataLocationIndex = 4;

        // Write data length of initialValue at position 4 (4 bytes)
        dataView.setInt32(dataLocationIndex, initialValue.length, true);
        dataLocationIndex += 4;

        // Write initialValue starting from position 8
        buffer.set(initialValue, dataLocationIndex);

        return buffer;
    }
    
    WriteValue(index: number, value: Uint8Array): void {
        if (index < 0) throw new Error("Index cannot be less than 0");
        if (index === 0) throw new Error("Use CreateTideMemory to set value at index 0");
        if (this.length < 4 + value.length) throw new Error("Could not write to memory. Memory too small for this value");

        const dataView = new DataView(this.buffer);
        let dataLocationIndex = 4; // Start after the version number

        // Navigate through existing data segments
        for (let i = 0; i < index; i++) {
            if (dataLocationIndex + 4 > this.length) {
                throw new RangeError("Index out of range.");
            }

            // Read data length at current position
            const nextDataLength = dataView.getInt32(dataLocationIndex, true);
            dataLocationIndex += 4;

            dataLocationIndex += nextDataLength;
        }

        // Check if there's enough space to write the value
        if (dataLocationIndex + 4 + value.length > this.length) {
            throw new RangeError("Not enough space to write value");
        }

        // Check if data has already been written to this index
        const existingLength = dataView.getInt32(dataLocationIndex, true);
        if (existingLength !== 0) {
            throw new Error("Data has already been written to this index");
        }

        // Write data length of value at current position
        dataView.setInt32(dataLocationIndex, value.length, true);
        dataLocationIndex += 4;

        // Write value starting from current position
        this.set(value, dataLocationIndex);
    }

    GetValue(index: number): TideMemory{
        // 'a' should be an ArrayBuffer or Uint8Array
        if (this.length < 4) {
            throw new Error("Insufficient data to read.");
        }

        // Create a DataView for reading integers in little-endian format
        const dataView = new DataView(this.buffer, this.byteOffset, this.byteLength);

        // Optional: Read the version if needed
        // const version = dataView.getInt32(0, true);

        let dataLocationIndex = 4;

        for (let i = 0; i < index; i++) {
            // Check if there's enough data to read the length of the next segment
            if (dataLocationIndex + 4 > this.length) {
                throw new RangeError("Index out of range.");
            }

            const nextDataLength = dataView.getInt32(dataLocationIndex, true);
            dataLocationIndex += 4 + nextDataLength;
        }

        // Check if there's enough data to read the length of the final segment
        if (dataLocationIndex + 4 > this.length) {
            throw new RangeError("Index out of range.");
        }

        const finalDataLength = dataView.getInt32(dataLocationIndex, true);
        dataLocationIndex += 4;

        // Check if the final data segment is within bounds
        if (dataLocationIndex + finalDataLength > this.length) {
            throw new RangeError("Index out of range.");
        }

        return this.subarray(dataLocationIndex, dataLocationIndex + finalDataLength) as TideMemory;
    }
}