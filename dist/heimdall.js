// 
// Tide Protocol - Infrastructure for a TRUE Zero-Trust paradigm
// Copyright (C) 2022 Tide Foundation Ltd
// 
// This program is free software and is subject to the terms of 
// the Tide Community Open Code License as published by the 
// Tide Foundation Limited. You may modify it and redistribute 
// it in accordance with and subject to the terms of that License.
// This program is distributed WITHOUT WARRANTY of any kind, 
// including without any implied warranty of MERCHANTABILITY or 
// FITNESS FOR A PARTICULAR PURPOSE.
// See the Tide Community Open Code License for more details.
// You should have received a copy of the Tide Community Open 
// Code License along with this program.
// If not, see https://tide.org/licenses_tcoc2-0-0-en
//
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class Heimdall {
    constructor(homeOrkOrigin) {
        this.enclaveOrigin = homeOrkOrigin; // for child classes to make their enclave urls
    }
    init(data) {
        throw new Error("Method not implemented.");
    }
    getOrkUrl(data) {
        throw new Error("Method not implemented.");
    }
    open() {
        return __awaiter(this, void 0, void 0, function* () {
            switch (this._windowType) {
                case windowType.Popup:
                    return this.openPopUp();
                case windowType.Redirect:
                    throw new Error("Method not implemented.");
                case windowType.Hidden:
                    throw new Error("Method not implemented.");
            }
        });
    }
    send(data) {
        switch (this._windowType) {
            case windowType.Popup:
                this.sendPostWindowMessage(data);
            case windowType.Redirect:
                throw new Error("Method not implemented.");
            case windowType.Hidden:
                throw new Error("Method not implemented.");
        }
    }
    recieve(type) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (this._windowType) {
                case windowType.Popup:
                    return this.waitForWindowPostMessage(type);
                case windowType.Redirect:
                    throw new Error("Method not implemented.");
                case windowType.Hidden:
                    throw new Error("Method not implemented.");
            }
        });
    }
    close() {
        switch (this._windowType) {
            case windowType.Popup:
                this.closePopupEnclave();
            case windowType.Redirect:
                throw new Error("Method not implemented.");
            case windowType.Hidden:
                throw new Error("Method not implemented.");
        }
    }
    onerror(data) {
        throw new Error("Method not implemented.");
    }
    openPopUp() {
        return __awaiter(this, void 0, void 0, function* () {
            const left_pos = (window.length / 2) - 400;
            const w = window.open(this.enclaveUrl, "_blank", `width=800,height=800,left=${left_pos}`);
            if (!w)
                return false;
            this.enclaveWindow = w;
            yield this.waitForWindowPostMessage("pageLoaded"); // we need to wait for the page to load before we send sensitive data
            return true;
        });
    }
    closePopupEnclave() {
        this.enclaveWindow.close();
    }
    waitForWindowPostMessage(responseTypeToAwait) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                const handler = (event) => {
                    const response = this.processEvent(event.data, event.origin, responseTypeToAwait);
                    if (response.ok) {
                        resolve(response.message);
                        window.removeEventListener("message", handler);
                    }
                    else {
                        console.log(response.error);
                    }
                };
                window.addEventListener("message", handler, false);
            });
        });
    }
    sendPostWindowMessage(message) {
        this.enclaveWindow.postMessage(message, this.enclaveUrl.origin);
    }
    processEvent(data, origin, expectedType) {
        if (origin !== this.enclaveUrl.origin) {
            // Something's not right... The message has come from an unknown domain... 
            return { ok: false, error: "WRONG WINDOW SENT MESSAGE" };
        }
        if (expectedType !== data.type)
            return { ok: false, error: "Received " + data.type + " but waiting for " + expectedType };
        switch (data.type) {
            case "newORKUrl":
                this.enclaveOrigin = new URL(data.url).origin;
                break;
            case "error":
                this.onerror(data);
                break;
        }
        return { ok: true, message: data.message };
    }
}
export var windowType;
(function (windowType) {
    windowType[windowType["Popup"] = 0] = "Popup";
    windowType[windowType["Redirect"] = 1] = "Redirect";
    windowType[windowType["Hidden"] = 2] = "Hidden";
})(windowType || (windowType = {}));
;
;
//# sourceMappingURL=heimdall.js.map