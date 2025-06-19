var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Heimdall, windowType } from "../heimdall";
export class ApprovalEnclaveFlow extends Heimdall {
    constructor() {
        super(...arguments);
        this.name = "approval";
        this._windowType = windowType.Popup;
    }
    init(data) {
        this.acceptedAdminIds = data;
        return this;
    }
    getAuthorizerAuthentication() {
        return __awaiter(this, void 0, void 0, function* () {
            // ready to accept reply
            const pre_response = this.recieve("authentication");
            // send to enclave
            this.send({
                type: "authentication",
                message: "pretty please"
            });
            // wait for response - this does not mean that enclave it closed, just that the admin has responded to the approval request from the enclave
            return yield pre_response;
        });
    }
    getAuthorizerApproval(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // ready to accept reply
            const pre_response = this.recieve("approval");
            // send to enclave
            this.send({
                type: "approval",
                version: "0.0.1",
                message: data
            });
            // wait for response - this does not mean that enclave it closed, just that the admin has responded to the approval request from the enclave
            return yield pre_response;
        });
    }
    getOrkUrl(data) {
        // how to create approval ork url for openinging enclave?
        const u = new URL(data);
        u.searchParams.set("type", "approval");
        u.searchParams.set("acceptedIds", JSON.stringify(this.acceptedAdminIds));
        return new URL(this.enclaveOrigin + u.pathname + u.search);
    }
}
//# sourceMappingURL=ApprovalEnclave.js.map