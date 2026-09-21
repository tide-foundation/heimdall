import {APPROVAL_WAIT_TIMEOUT_MS, Heimdall, windowType} from "../heimdall";

export class ApprovalEnclave extends Heimdall<ApprovalEnclave>{
    name: string = "approval";
    _windowType: windowType = windowType.Popup;
    private acceptedAdminIds: string[];
    enclaveUrl: URL;
    private initDone: Promise<any>;

    init(data: string[], enclaveUrl: string): ApprovalEnclave {
        this.acceptedAdminIds = data;
        this.enclaveUrl = new URL(enclaveUrl);
        this.initDone = this.open();
        return this;
    }

    async getAuthorizerAuthentication() {
        await this.initDone;
        // ready to accept reply
        const pre_response = this.recieveOrFail("authentication", {
            detectClose: true,
            timeoutMs: APPROVAL_WAIT_TIMEOUT_MS,
        });

        // send to enclave
        this.send({
            type: "authentication",
            message: "pretty please"
        });

        // wait for response - this does not mean that enclave it closed, just that the admin has responded to the approval request from the enclave
        return await pre_response;
    }

    
    async getAuthorizerApproval(draftToApprove, modelId, expiry, encoding = "bytes", authflow = "") {
        await this.initDone;
        // ready to accept reply
        const pre_response = this.recieveOrFail("approval", {
            detectClose: true,
            timeoutMs: APPROVAL_WAIT_TIMEOUT_MS,
        });

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
        this.enclaveUrl.searchParams.set("type", "approval");
        this.enclaveUrl.searchParams.set("acceptedIds", JSON.stringify(this.acceptedAdminIds));
        return this.enclaveUrl;
    }
    
}
