import { TideMemory } from "../wrapper.js";

export default class BaseTideRequest {
    name: string;
    version: string;
    authFlow: string;
    draft: TideMemory;
    dyanmicData: TideMemory;
    authorization: TideMemory;
    authorizerCert: TideMemory;
    authorizer: TideMemory;
    expiry: number;
    policy: TideMemory;

    constructor(name: string, version: string, authFlow: string, draft: TideMemory, dyanmicData: TideMemory) {
        this.name = name;
        this.version = version;
        this.authFlow = authFlow
        this.draft = draft.slice() as TideMemory;
        this.dyanmicData = dyanmicData.slice() as TideMemory;
        this.authorization = new TideMemory();
        this.authorizerCert = new TideMemory();;
        this.authorizer = new TideMemory();;
        this.expiry = Math.floor(Date.now() / 1000) + 30; // default is 30s
        this.policy = new TideMemory();
    }

    id() {
        return this.name + ":" + this.version;
    }

    /**
     * This isn't copying. Just created another BaseTideRequest object that allows you to point each individual field to OTHER sections of memory.
     * If you modify an existing 'replicated' field, you'll also modify the other object you originally replicated.
     */
    replicate() {
        const r = new BaseTideRequest(this.name, this.version, this.authFlow, this.draft, this.dyanmicData);
        r.authorization = this.authorization;
        r.authorizerCert = this.authorizerCert;
        r.authorizer = this.authorizer;
        r.expiry = this.expiry;
        r.policy = this.policy;
        return r;
    }

    setNewDynamicData(d: TideMemory) {
        this.dyanmicData = d;
        return this;
    }

    setCustomExpiry(timeFromNowInSeconds: number) {
        this.expiry = timeFromNowInSeconds;
        return this;
    }

    addAuthorizer(authorizer: TideMemory) {
        this.authorizer = authorizer;
    }

    addAuthorizerCertificate(authorizerCertificate: TideMemory) {
        this.authorizerCert = authorizerCertificate
    }

    addAuthorization(authorization: TideMemory) {
        this.authorization = authorization
        return this;
    }

    addPolicy(policy: TideMemory){
        this.policy = policy;
        return this;
    }

    async getRequestInitDetails() {
        const te = new TextEncoder();
        return {
            "creationTime": BaseTideRequest.uint32ToUint8ArrayLE(Math.floor(Date.now() / 1000)), // now
            "expireTime": BaseTideRequest.uint32ToUint8ArrayLE(this.expiry),
            "modelId": te.encode(this.id()),
            "draftHash": new TideMemory(await crypto.subtle.digest("SHA-512", this.draft))
        }
    }

    addCreationSignature(creationTime: Uint8Array, sig: Uint8Array) {
        this.authorization = TideMemory.CreateFromArray([
            TideMemory.CreateFromArray([
                creationTime,
                sig
            ]),
            new TideMemory() // empty as no approvals have been added yet
        ]);
        return this;
    }

    isInitialized(): boolean {
        try{
            // check that creation time and sig fields are present
            if(this.authorization.GetValue(0).GetValue(0).length > 0 && 
                this.authorization.GetValue(0).GetValue(1).length == 64)
                return true;
        }catch {
            return false;
        }
    }

    getUniqueId(): string {
        if(!this.isInitialized()) throw 'Must initialize request to generate unique id';
        const bytes = this.authorization.GetValue(0).GetValue(1) as Uint8Array;
        return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(''); // hex
    }

    encode() {
        if (this.authorizer == null) throw Error("Authorizer not added to request");
        if (this.authorizerCert == null) throw Error("Authorizer cert not provided");
        if (this.authorization == null) throw Error("Authorize this request first with an authorizer");

        const te = new TextEncoder();
        const name_b = te.encode(this.name);
        const version_b = te.encode(this.version);
        const authFlow_b = te.encode(this.authFlow);
        const expiry = BaseTideRequest.uint32ToUint8ArrayLE(this.expiry);

        const req = TideMemory.CreateFromArray([
            name_b,
            version_b,
            expiry,
            this.draft,
            authFlow_b,
            this.dyanmicData,
            this.authorizer,
            this.authorization,
            this.authorizerCert,
            this.policy
        ]);

        return req;
    }

    static decode(data: Uint8Array) {
        const d = data as TideMemory;
        // Read field 0 (name) - this is part of the TideMemory structure
        const name = new TextDecoder().decode(d.GetValue(0));

        // Read all other fields
        const version = new TextDecoder().decode(d.GetValue(1));

        const expiry = BaseTideRequest.uint8ArrayToUint32LE(d.GetValue(2));

        const draft = d.GetValue(3);

        const authFlow = new TextDecoder().decode(d.GetValue(4));

        const dynamicData = d.GetValue(5);

        const authorizer = d.GetValue(6);
        const authorization = d.GetValue(7);
        const authorizerCert = d.GetValue(8);
        const policy = d.GetValue(9);

        // Create a new BaseTideRequest with the decoded data
        const request = new BaseTideRequest(name, version, authFlow, draft, dynamicData);

        // Set the remaining fields
        request.expiry = expiry;
        request.authorizer = authorizer;
        request.authorization = authorization;
        request.authorizerCert = authorizerCert;
        request.policy = policy;

        return request;
    }

    static uint32ToUint8ArrayLE(num: number): Uint8Array {
        // We want 8 bytes to match .NET Int64 (long) layout: low 32 bits in first 4 bytes, rest zero.
        const arr = new Uint8Array(8);

        // low 32 bits, little-endian
        arr[0] = num & 0xff;
        arr[1] = (num >>> 8) & 0xff;
        arr[2] = (num >>> 16) & 0xff;
        arr[3] = (num >>> 24) & 0xff;

        // arr[4..7] are already 0 from Uint8Array init, matching a .NET long with high 32 bits = 0.
        return arr;
    }

    static uint8ArrayToUint32LE(bytes: Uint8Array): number {
        if (bytes.length !== 8) {
            throw new Error("Expected 8 bytes for a 64-bit value");
        }

        // Optional safety check: ensure high 32 bits are zero (no real 64-bit longs passed).
        // If you *really* want to enforce the "no longs" assumption, uncomment:
        //
        // if (bytes[4] | bytes[5] | bytes[6] | bytes[7]) {
        //     throw new Error("High 32 bits are not zero; expected a 32-bit value stored in 64-bit field.");
        // }

        // Reconstruct from the low 4 bytes (little-endian)
        return (
            bytes[0] +
            (bytes[1] << 8) +
            (bytes[2] << 16) +
            (bytes[3] * 0x1000000) // avoids sign issues of << 24
        );
    }
}