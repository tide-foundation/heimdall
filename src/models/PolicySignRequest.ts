import { TideMemory } from "asgard-tide";
import { BaseTideRequest } from "asgard-tide";
import { Policy } from "asgard-tide";

export default class PolicySignRequest extends BaseTideRequest {
    constructor(name: string, version: string, authFlow: string, draft: Uint8Array, dyanmicData: Uint8Array) {
        super(name, version, authFlow, draft, dyanmicData);
    }
    static New(policy: Policy) : PolicySignRequest{
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