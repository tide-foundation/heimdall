import { Heimdall, windowType } from "../heimdall";
import { TideMemory } from "../wrapper";

interface HiddenInit{
    doken: string;
    signed_origin: string;
    voucherURL: string;
}

export class RequestEnclave extends Heimdall<RequestEnclave>{
    private signed_client_origin: string;
    private doken: string;
    private voucherURL: string;

    _windowType: windowType = windowType.Hidden;

    private initDone: Promise<any>;
    private requestEnclaveHidden: boolean = true;

    init(data: HiddenInit): RequestEnclave {
        if(!data.signed_origin) throw 'Must supply signed origin for wherever youre running this client';
        if(!data.doken) throw 'Doken not provided';
        if(!data.voucherURL) throw 'No voucher url provided';

        this.signed_client_origin = data.signed_origin;
        this.doken = data.doken;
        this.voucherURL = data.voucherURL;

        this.recieve("hidden enclave").then((data) => this.handleHiddenEnclaveResponse(data));

        this.open().then((success: boolean) => {
            if(success){
                this.initDone = this.recieve("init done");
                this.send({
                    type: "init",
                    doken: this.doken,
                    voucher: this.voucherURL
                });
            }else throw 'Error opening enclave';
        });

        return this;
    }

    async handleHiddenEnclaveResponse(data: any){
        if(data.message == "refresh doken" && this._windowType == windowType.Hidden){
            // looks like the hidden iframe has not allowed data to be stored on the browser OR the session key is mismatched with whats on the enclave vs doken
            // either way we gotta get a doken with the appropriate session key

            // Close the hidden enclave
            this.close();

            // We're now going to open the request enclave as a popup with the mismatched doken
            // The page should recognise the doken is mismatched, generate a new one, then await our requests
            this._windowType = windowType.Popup;
            this.requestEnclaveHidden = false;
            this.open().then((success: boolean) => {
                if(success){
                    this.initDone = this.recieve("init done");
                    this.send({
                        type: "init",
                        doken: this.doken,
                        voucher: this.voucherURL
                    });
                }else throw 'Error opening enclave';
            })
        }

        this.recieve("hidden enclave").then((data) => this.handleHiddenEnclaveResponse(data));
    }

    getOrkUrl(data: any): URL {
        // this



        // is very fucked up and note done

        // and where do we get voucher url from????
        // how do we construct it

        // you need to put client origin in here
        this.enclaveUrl.searchParams.set("hidden", this.requestEnclaveHidden ? "true" : "false");
        return this.enclaveUrl;
    }

    async execute(data: TideMemory): Promise<Uint8Array[]>{
        await this.initDone;
        const pre_resp = this.recieve("request completed");
        this.send({
            type: "request",
            request: data,
        })
        const resp = await pre_resp;
        if(!Array.isArray(resp.data)) throw 'Expecting request completed data to be an array';
        if(!resp.data.every((d: any) => d instanceof Uint8Array)) throw 'Expecting all entries in response to be Uint8Arrays';
        return resp.data;
    }
}