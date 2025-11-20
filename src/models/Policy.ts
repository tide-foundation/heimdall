import { TideMemory } from "../wrapper";
import { BigIntToByteArray, BigIntFromByteArray, StringFromUint8Array, StringToUint8Array } from "../utils";

export class Policy{
    version: string;
    contractId: string;
    modelId: string;
    keyId: string;
    params: PolicyParameters;

    dataToVerify: TideMemory | undefined;
    signature: Uint8Array | undefined;

    constructor(data: {version: string, contractId: string, modelId: string, keyId: string, params: Map<string, any>} | TideMemory | Uint8Array){
        if(data instanceof Uint8Array){
            const d = new TideMemory(data.length);
            d.set(data);

            this.dataToVerify = d.GetValue(0);
            this.version = StringFromUint8Array(this.dataToVerify.GetValue(0));
            this.contractId = StringFromUint8Array(this.dataToVerify.GetValue(1));
            this.modelId = StringFromUint8Array(this.dataToVerify.GetValue(2));
            this.keyId = StringFromUint8Array(this.dataToVerify.GetValue(3));
            this.params = new PolicyParameters(this.dataToVerify.GetValue(4));

            const sigRes = {result:null};
            if(d.TryGetValue(1, sigRes)){
                this.signature = sigRes.result;
            }
        }else{
            if(typeof data["version"] !== "string") throw 'Version is not a string';
            this.version = data["version"];
            if(typeof data["contractId"] !== "string") throw 'ContractId is not a string';
            this.contractId = data["contractId"];
            if(typeof data["modelId"] !== "string") throw 'ModelId is not a string';
            this.modelId = data["modelId"];
            if(typeof data["keyId"] !== "string") throw 'KeyId is not a string';
            this.keyId = data["keyId"];

            if(!data["params"]) throw 'Params is null';
            this.params = new PolicyParameters(data["params"]);
        }
    }

    toBytes(){
        let d = [
            TideMemory.CreateFromArray([
                StringToUint8Array(this.version),
                StringToUint8Array(this.contractId),
                StringToUint8Array(this.modelId),
                StringToUint8Array(this.keyId),
                this.params.toBytes()
        ])];
        
        return TideMemory.CreateFromArray(d);
    }
}

export class PolicyParameters {
    entries : Map<string, any>;
    constructor(data: Map<string, any> | Uint8Array) {
        if(data instanceof Uint8Array){
            this.entries = PolicyParameters.fromBytes(data);
        }else{
             this.entries = new Map(data);
        }
    }

    private static fromBytes(data: Uint8Array): Map<string, any> {
        let params = new Map();
        let i = 0;
        const value = { result: undefined as TideMemory | undefined };

        // Create TideMemory instance to access TryGetValue
        const tideData = new TideMemory(data.length);
        tideData.set(data);

        // Try to get values at sequential indices
        while (tideData.TryGetValue(i, value)) {
            const nameBytes = value.result!.GetValue(0);
            const name = StringFromUint8Array(nameBytes);

            const typeBytes = value.result!.GetValue(1);
            const type = StringFromUint8Array(typeBytes);

            const dataBytes = value.result!.GetValue(2);

            let datum: any;
            switch (type) {
                case "str":
                    datum = StringFromUint8Array(dataBytes);
                    break;
                case "num":
                    const numView = new DataView(dataBytes.buffer, dataBytes.byteOffset, dataBytes.byteLength);
                    datum = numView.getInt32(0, true); // little-endian
                    break;
                case "bnum":
                    // Convert bytes to BigInt (little-endian)
                    datum = BigIntFromByteArray(dataBytes);
                    break;
                case "bln":
                    datum = dataBytes[0] === 1;
                    break;
                case "byt":
                    datum = new Uint8Array(dataBytes);
                    break;
                default:
                    throw new Error(`Could not find type of ${type}`);
            }

            params.set(name, datum);
            i++;
        }
        return params;
    }

    toBytes(): Uint8Array {
        let params = [];
        
        for (const [key, value] of this.entries) {
            const nameBytes = StringToUint8Array(key);
            let dataBytes, typeStr;
            
            if (typeof value === 'string') {
                dataBytes = StringToUint8Array(value);
                typeStr = "str";
            } else if (typeof value === 'number' && Number.isInteger(value)) {
                const buffer = new ArrayBuffer(4);
                const view = new DataView(buffer);
                view.setInt32(0, value, true); // little-endian
                dataBytes = new Uint8Array(buffer);
                typeStr = "num";
            } else if (typeof value === 'bigint') {
                dataBytes = BigIntToByteArray(value);
                typeStr = "bnum";
            } else if (typeof value === 'boolean') {
                dataBytes = new Uint8Array([value ? 1 : 0]);
                typeStr = "bln";
            } else if (value instanceof Uint8Array) {
                dataBytes = value;
                typeStr = "byt";
            } else {
                throw new Error(
                    `Could not serialize key '${key}' of type '${typeof value}'`
                );
            }
            
            const typeBytes = StringToUint8Array(typeStr);
            const paramMemory = TideMemory.CreateFromArray([nameBytes, typeBytes, dataBytes]);
            params.push(paramMemory);
        }
        
        return TideMemory.CreateFromArray(params);
    }
}