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
export class RequestEnclave extends Heimdall {
    constructor() {
        super(...arguments);
        this._windowType = windowType.Hidden;
        this.requestEnclaveHidden = true;
    }
    init(data) {
        if (!data.signed_origin)
            throw 'Must supply signed origin for wherever youre running this client';
        if (!data.doken)
            throw 'Doken not provided';
        if (!data.voucherURL)
            throw 'No voucher url provided';
        this.signed_client_origin = data.signed_origin;
        this.doken = data.doken;
        this.voucherURL = data.voucherURL;
        this.recieve("hidden enclave").then((data) => this.handleHiddenEnclaveResponse(data));
        this.open().then((success) => {
            if (success) {
                this.initDone = this.recieve("init done");
                this.send({
                    type: "init",
                    doken: this.doken,
                    voucher: this.voucherURL
                });
            }
            else
                throw 'Error opening enclave';
        });
        return this;
    }
    handleHiddenEnclaveResponse(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (data.message == "refresh doken" && this._windowType == windowType.Hidden) {
                // looks like the hidden iframe has not allowed data to be stored on the browser OR the session key is mismatched with whats on the enclave vs doken
                // either way we gotta get a doken with the appropriate session key
                // Close the hidden enclave
                this.close();
                // We're now going to open the request enclave as a popup with the mismatched doken
                // The page should recognise the doken is mismatched, generate a new one, then await our requests
                this._windowType = windowType.Popup;
                this.requestEnclaveHidden = false;
                this.open().then((success) => {
                    if (success) {
                        this.initDone = this.recieve("init done");
                        this.send({
                            type: "init",
                            doken: this.doken,
                            voucher: this.voucherURL
                        });
                    }
                    else
                        throw 'Error opening enclave';
                });
            }
            this.recieve("hidden enclave").then((data) => this.handleHiddenEnclaveResponse(data));
        });
    }
    getOrkUrl(data) {
        // this
        // is very fucked up and note done
        // and where do we get voucher url from????
        // how do we construct it
        // you need to put client origin in here
        this.enclaveUrl.searchParams.set("hidden", this.requestEnclaveHidden ? "true" : "false");
        return this.enclaveUrl;
    }
    execute(data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initDone;
            const pre_resp = this.recieve("request completed");
            this.send({
                type: "request",
                request: data,
            });
            const resp = yield pre_resp;
            if (!Array.isArray(resp.data))
                throw 'Expecting request completed data to be an array';
            if (!resp.data.every((d) => d instanceof Uint8Array))
                throw 'Expecting all entries in response to be Uint8Arrays';
            return resp.data;
        });
    }
}
//# sourceMappingURL=RequestEnclave.js.map