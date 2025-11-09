import {Heimdall, windowType} from "../heimdall";
import { TideMemory } from "../wrapper";
import { RequestEnclave } from "./RequestEnclave";

export class ApprovalEnclaveNew extends RequestEnclave{
    name: string = "approvalNew";
    _windowType: windowType = windowType.Popup;

    async initializeRequest(request: TideMemory){
        return await super.execute(request);
    }
    
    async approve(requestsToApprove: RequestToApprove[]){
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
        if(!resp.every((d: any) => d instanceof Uint8Array)) throw 'Expecting all entries in response to be Uint8Arrays';
        return resp;
    }
    
}
class RequestToApprove{
    id: string;
    request: TideMemory;
}
