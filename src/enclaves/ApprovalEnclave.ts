import {Heimdall, windowType} from "../heimdall";
import { TideMemory } from "../wrapper";

export class ApprovalEnclaveFlow extends Heimdall<ApprovalEnclaveFlow>{
    name: string = "approval";
    _windowType: windowType = windowType.Popup;
    private acceptedAdminIds: string[];
    enclaveUrl: URL;

    init(data: string[], enclaveUrl: string): ApprovalEnclaveFlow {
        this.acceptedAdminIds = data;
        this.enclaveUrl = new URL(enclaveUrl);
        return this;
    }

    async getAuthorizerAuthentication() {
        // ready to accept reply
        const pre_response = this.recieve("authentication");

        // send to enclave
        this.send({
            type: "authentication",
            message: "pretty please"
        });

        // wait for response - this does not mean that enclave it closed, just that the admin has responded to the approval request from the enclave
        return await pre_response;
    }

    
    async getAuthorizerApproval(draftToApprove, modelId, expiry, encoding = "bytes", authflow = "") {
        // ready to accept reply
        const pre_response = this.recieve("approval");

        // send to enclave
        this.send({
            type: "approval",
            message: {
                draftToAuthorize: {
                    data: draftToApprove,
                    encoding: encoding
                },
                modelId: modelId,
                expiry: expiry,
                authflow: authflow
            }
        });

        // wait for response - this does not mean that enclave it closed, just that the admin has responded to the approval request from the enclave
        return await pre_response;
    }

    getOrkUrl() { 
        // how to create approval ork url for openinging enclave?
        const u = new URL("data");
        u.searchParams.set("type", "approval");
        u.searchParams.set("acceptedIds", JSON.stringify(this.acceptedAdminIds));
        return new URL(this.enclaveOrigin + u.pathname + u.search);
    }
    
}
