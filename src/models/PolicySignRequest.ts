import { Cryptide, Models, Clients, Tools, Contracts } from "tide-js";
const TideMemory = Tools.TideMemory;
const BaseTideRequest = Models.BaseTideRequest;
const Policy = Models.Policy;
const GenericResourceAccessThresholdRoleContract = Contracts.GenericResourceAccessThresholdRoleContract

export default class PolicySignRequest extends BaseTideRequest {
    constructor(name: string, version: string, authFlow: string, draft: Uint8Array, dyanmicData: Uint8Array) {
        super(name, version, authFlow, draft, dyanmicData);
    }
    static New(policy: Models.Policy) : PolicySignRequest{
        return new PolicySignRequest(
            "Policy",
            "1",
            "Policy:1",
            TideMemory.CreateFromArray([policy.toBytes()]),
            new TideMemory()
        );
    }

    getRequestedPolicy(){
        return Policy.from(this.draft.GetValue(0));
    }
}