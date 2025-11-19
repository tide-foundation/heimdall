import { TideMemory } from "../wrapper";
import BaseTideRequest from "./BaseTideRequest";
import { Policy } from "./Policy";

export default class PolicySignRequest extends BaseTideRequest {
    constructor(policy: Policy){
        super(
            "Policy",
            "1",
            "Policy:1",
            TideMemory.CreateFromArray([policy.toBytes()]),
            new TideMemory()
        );
    }

    getRequestedPolicy(){
        return new Policy(this.draft.GetValue(0));
    }

    static decode(data: Uint8Array): PolicySignRequest {
        // Use parent decode to get the base request
        const baseRequest = BaseTideRequest.decode(data);

        // Extract the policy from the draft
        const policy = new Policy(baseRequest.draft.GetValue(0));

        // Create a new PolicySignRequest with the policy
        const policyRequest = new PolicySignRequest(policy);

        // Copy over all the other fields from the decoded base request
        policyRequest.expiry = baseRequest.expiry;
        policyRequest.authorizer = baseRequest.authorizer;
        policyRequest.authorization = baseRequest.authorization;
        policyRequest.authorizerCert = baseRequest.authorizerCert;
        policyRequest.policy = baseRequest.policy;

        return policyRequest;
    }
}