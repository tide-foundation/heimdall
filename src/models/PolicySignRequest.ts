import { Cryptide, Models, Clients, Tools, Contracts } from "@tide/js";
const TideMemory = Tools.TideMemory;
const BaseTideRequest = Models.BaseTideRequest;
const Policy = Models.Policy;
const GenericResourceAccessThresholdRoleContract = Contracts.GenericResourceAccessThresholdRoleContract

const forsetiType = "forseti";
const forsetiEntryType = "Contract";

export default class PolicySignRequest extends BaseTideRequest {
    private new_policy: Models.Policy;
    constructor(name: string, version: string, authFlow: string, draft: Uint8Array, dyanmicData: Uint8Array) {
        super(name, version, authFlow, draft, dyanmicData);
    }
    static New(policy: Models.Policy) : PolicySignRequest{
        const p = new PolicySignRequest(
            "Policy",
            "1",
            "Policy:1",
            TideMemory.CreateFromArray([policy.toBytes()]),
            new TideMemory()
        );
        p.new_policy = policy;
        return p;
    }

    addForsetiContractToUpload(source: Uint8Array | string){
        const te = new TextEncoder();
        const s = typeof source === "string" ? te.encode(source) : source;
        const innerPayload = TideMemory.CreateFromArray([s, te.encode(forsetiEntryType)]);
        const forsetiData = TideMemory.CreateFromArray([new Uint8Array(0), innerPayload]);
        const contractTransport = TideMemory.CreateFromArray([te.encode(forsetiType), forsetiData]);
        const draft = TideMemory.CreateFromArray([this.new_policy.toBytes(), contractTransport]);
        this.draft = draft;
        return this;
    }

    getRequestedPolicy(){
        return Policy.from(this.draft.GetValue(0));
    }
}