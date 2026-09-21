import {APPROVAL_WAIT_TIMEOUT_MS, Heimdall, HiddenInit, windowType} from "../heimdall";
import { Cryptide, Models, Clients, Tools } from "@tideorg/js";
import { RequestEnclave } from "./RequestEnclave";

export class ApprovalEnclaveNew extends RequestEnclave{
    name: string = "approvalNew";
    _windowType: windowType = windowType.Popup;

    init(data: HiddenInit): ApprovalEnclaveNew {
        return super.init(data) as ApprovalEnclaveNew;
    }
    
    async approve(requestsToApprove: RequestToApprove[]) : Promise<OperatorApprovalResponse[]>{
        // return fully serialized approved requests
        this.checkEnclaveOpen();
        await this.initDone;
        // Human-gated: the operator reads the requests and decides. Closing the
        // window is the normal way to say no, and used to hang the caller forever.
        const pre_resp = this.recieveOrFail("approvals", {
            detectClose: true,
            timeoutMs: APPROVAL_WAIT_TIMEOUT_MS,
        });
        this.send({
            type: "approvalRequests",
            message:{
                requests: requestsToApprove,
            }
        })
        const resp = await pre_resp; 
        if(!Array.isArray(resp)) throw 'Expecting request completed data to be an array, not' + resp;
        if(!resp.every((d: any) => OperatorApprovalResponse.isOperatorApprovalResponse(d))) throw 'Expecting all entries in response to be OperatorApprovalResponse';
        this.close();
        return resp;
    }
    
}
class RequestToApprove{
    id: string;
    request: Tools.TideMemory;
}
class OperatorApprovalResponse extends RequestToApprove{
    status: Status;
    static isOperatorApprovalResponse(object: any): object is OperatorApprovalResponse {
        return (
            object != null &&
            typeof object.id === 'string' &&
            (object.request instanceof Uint8Array || object.request == null) &&
            Object.values(Status).includes(object.status)
        );
    }
}
enum Status{
    Approved = "approved",
    Denied = "denied",
    Pending = "pending"
}
