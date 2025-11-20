import {Heimdall, HiddenInit, windowType} from "../heimdall";
import { TideMemory } from "../wrapper";
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
        const pre_resp = this.recieve("approvals");
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
    request: TideMemory;
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
