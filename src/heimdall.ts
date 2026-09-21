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
export interface HeimdallConstructor{
    vendorId: string;
    homeOrkOrigin: string,
    voucherURL: string,
    signed_client_origin: string;
    isRunningLocal?: boolean
}
/** How often a guarded wait checks whether the enclave window has gone away. */
const CLOSE_POLL_INTERVAL_MS = 250;

/**
 * Deadline for a wait that is gated on a HUMAN reading a request and deciding.
 * Not derived from a measurement: the only distribution we have is from
 * automation clicking instantly, which says nothing about how long a person
 * takes. This is a backstop against a wedged window, not a response-time
 * budget; the close-poll is what normally ends these waits.
 */
export const APPROVAL_WAIT_TIMEOUT_MS = 300_000;

/**
 * Deadline for a MACHINE-gated enclave operation (sign, encrypt, decrypt and
 * their draft/commit variants). Measured end-to-end approval round trips on a
 * 20-node network ran to 18.5s worst case, so this is a little over three times
 * the slowest thing we have actually seen.
 */
export const REQUEST_WAIT_TIMEOUT_MS = 60_000;

/**
 * Deadline for a popup reporting that it has loaded. The hidden-iframe path next
 * door already bounds the same wait at 4s; a popup is a real window load over the
 * network, so it gets more room.
 */
const PAGE_LOAD_TIMEOUT_MS = 15_000;

/** Why a guarded wait gave up. Consumers match on `code`. */
export const HeimdallWaitCode = {
    /** The enclave window was closed before it answered. */
    Closed: "enclave.closed",
    /** The deadline passed with the window still open. */
    Timeout: "enclave.timeout",
} as const;

/**
 * Raised by a guarded wait. Carries a `code` so a caller can tell an operator
 * closing the window apart from a window that stopped responding: those are
 * different messages to a user and different things to do next.
 */
export class HeimdallWaitError extends Error {
    public readonly code: string;
    constructor(code: string, message: string) {
        super(message);
        this.name = "HeimdallWaitError";
        this.code = code;
    }
}

/** Opt-in guards for a request/response wait. Omitted entirely = wait forever. */
export interface WaitGuard {
    /** Reject when the enclave window is closed before it answers. */
    detectClose?: boolean;
    /** Reject when this many ms pass with no answer. */
    timeoutMs?: number;
}

export abstract class Heimdall<T> implements EnclaveFlow<T> {
    name: string;
    _windowType: windowType;
    enclaveOrigin: string;
    voucherURL: string;
    signed_client_origin: string;
    vendorId: string;
    isRunningLocal: boolean;
    
    private enclaveWindow: WindowProxy | undefined;

    constructor(init: HeimdallConstructor){
        this.enclaveOrigin = init.homeOrkOrigin; 
        this.voucherURL = init.voucherURL;
        this.signed_client_origin = init.signed_client_origin;
        this.vendorId = init.vendorId;

        this.isRunningLocal = init.isRunningLocal != null ? init.isRunningLocal : false;
    }

    enclaveClosed(){
        if(!this.enclaveWindow) return true;
        return this.enclaveWindow.closed;
    }

    getOrkUrl(): URL {
        throw new Error("Method not implemented.");
    }

    public async open(): Promise<boolean> {
        switch(this._windowType){
            case windowType.Popup:
                return this.openPopUp();
            case windowType.Redirect:
                throw new Error("Method not implemented.");
            case windowType.Hidden:
                return this.openHiddenIframe();
        }
    }
    public send(data: any): void {
        switch(this._windowType){
            case windowType.Popup:
                this.sendPostWindowMessage(data);
                break;
            case windowType.Redirect:
                throw new Error("Method not implemented.");
            case windowType.Hidden:
                this.sendPostWindowMessage(data);
                break;
        }
    }
    /**
     * Like `recieve`, but for a request/response exchange that must not hang.
     * Rejects with a {@link HeimdallWaitError} when the enclave window is closed
     * or the deadline passes. Use `recieve` for a long-lived subscription.
     */
    public async recieveOrFail(type: string, guard: WaitGuard, silent: boolean = false): Promise<any> {
        switch(this._windowType){
            case windowType.Popup:
                return this.waitForWindowPostMessage(type, silent, guard);
            case windowType.Redirect:
                throw new Error("Method not implemented.");
            case windowType.Hidden:
                return this.waitForWindowPostMessage(type, silent, guard);
        }
    }
    public async recieve(type: string, silent: boolean = false): Promise<any> {
        switch(this._windowType){
            case windowType.Popup:
                return this.waitForWindowPostMessage(type, silent);
            case windowType.Redirect:
                throw new Error("Method not implemented.");
            case windowType.Hidden:
                return this.waitForWindowPostMessage(type, silent);
        }
    }
    public close() {
        switch(this._windowType){
            case windowType.Popup:
                this.closePopupEnclave();
                break;
            case windowType.Redirect:
                throw new Error("Method not implemented.");
            case windowType.Hidden:
                this.closeHiddenIframe();
                break;
            default:
                throw "Unknown window type";
        }
    }

    onerror(data: any): void {
        throw new Error("Method not implemented.");
    }

    private async openPopUp(): Promise<boolean> {
        const left_pos = (window.length / 2) - 400;
        const w = window.open(this.getOrkUrl(), "_blank", `width=800,height=800,left=${left_pos}`);
        if(!w) return false;
        this.enclaveWindow = w;
        try {
            // Wait for the page to load before we send sensitive data. Bounded, and
            // reported as a FAILED OPEN rather than thrown: `open()` returns a
            // boolean and checkEnclaveOpen already knows how to fall back and how
            // to tell the user when it runs out of options. Rejecting here would
            // surface as an unhandled rejection at that `.then(success => ...)`.
            await this.waitForWindowPostMessage("pageLoaded", false, {
                detectClose: true,
                timeoutMs: PAGE_LOAD_TIMEOUT_MS,
            });
        } catch (e) {
            console.error("[HEIMDALL] The enclave popup never reported that it loaded: "
                + (e instanceof Error ? e.message : String(e)));
            return false;
        }
        return true;
    }

    private async closeHiddenIframe(){
        window.document
            .querySelectorAll<HTMLIFrameElement>('iframe#heimdall')
            .forEach(iframe => iframe.remove());
    }

    private async openHiddenIframe() {
        try{
            // Remove any existing iframes with heimdall id
            this.closeHiddenIframe();

            // 1. Create the iframe
            const iframe = document.createElement('iframe');

             // Create iframe error listener
            const iframeErrorListener = new Promise<boolean>((res) => {
                iframe.onerror = () => res(false);
                iframe.addEventListener("error", () => {
                    res(false); // failed to load
                });
            });

            iframe.src = this.getOrkUrl().toString();          
            iframe.style.display = 'none';          // hide it visually
            iframe.id = "heimdall"; // in case multiple frames get popped up - we only want one
            iframe.setAttribute('aria-hidden', 'true'); // accessibility hint

            if(this.isRunningLocal) iframe.allow = "local-network-access";

            // 2. Add it to the document
            document.body.appendChild(iframe);

            // 3. Keep a reference to its window for postMessage
            this.enclaveWindow = iframe.contentWindow;
            if (!this.enclaveWindow) return false;

            // Create an iframe success listener. The wait carries the SAME 4s bound
            // as the race below so its listener is cleaned up when the race gives
            // up; previously the race returned false and this listener stayed
            // attached for the life of the page. The `.catch` matters: an async
            // executor that throws produces an unhandled rejection, which is why
            // this is written with `.then/.catch` rather than `await`.
            const pageLoaded = new Promise<boolean>((res) => {
                this.waitForWindowPostMessage("pageLoaded", false, { timeoutMs: 4000 })
                    .then(() => res(true))   // page loaded
                    .catch(() => res(false)); // never loaded; the race reports the same
            });

            const timeout = new Promise<boolean>((resolve) => {
                setTimeout(() => resolve(false), 4000); // 4-second timeout
            });

            const loadedResult = await Promise.race([iframeErrorListener, pageLoaded, timeout]);

            return loadedResult;
        }catch{
            return false;
        }
    }

    private closePopupEnclave() {
        this.enclaveWindow?.close();
    }

    /**
     * Wait for one message of `responseTypeToAwait` from the enclave window.
     *
     * WITHOUT `guard` this behaves exactly as it always has: it waits forever and
     * can only ever resolve. That is deliberate. Several callers are long-lived
     * SUBSCRIPTIONS ("hidden enclave", "session check") that re-arm themselves and
     * legitimately wait for an event that may be minutes away or never come, and a
     * deadline on those would silently stop the enclave renewing itself.
     *
     * WITH `guard` it can also reject, which is what request/response callers want:
     * an operator who closes the enclave window should get an error, not a promise
     * that never settles. See `recieveOrFail`.
     *
     * The listener is now removed on EVERY exit path. It used to be removed only on
     * success, so every wait that never completed left its handler attached and the
     * next message was handled once per abandoned wait.
     */
    private async waitForWindowPostMessage(
        responseTypeToAwait: string,
        silent: boolean = false,
        guard?: WaitGuard,
    ) {
        return new Promise((resolve, reject) => {
            let settled = false;
            let closePoll: ReturnType<typeof setInterval> | undefined;
            let deadline: ReturnType<typeof setTimeout> | undefined;

            const settle = (finish: () => void) => {
                if (settled) return;
                settled = true;
                window.removeEventListener("message", handler);
                if (closePoll !== undefined) clearInterval(closePoll);
                if (deadline !== undefined) clearTimeout(deadline);
                finish();
            };

            const handler = (event) => {
                const response = this.processEvent(event.data, event.origin, responseTypeToAwait, silent);
                if (response.ok) {
                    settle(() => resolve(response.message));
                } else {
                    if(response.print) console.error("[HEIMDALL] Recieved enclave error: " + response.error);
                }
            };
            window.addEventListener("message", handler, false);

            if (guard?.detectClose) {
                // The window going away is the common case: an operator closing the
                // approval popup, or an iframe being torn down. Nothing else notices
                // it, because a closed window simply stops sending messages.
                closePoll = setInterval(() => {
                    if (this.enclaveWindow?.closed) {
                        settle(() => reject(new HeimdallWaitError(
                            HeimdallWaitCode.Closed,
                            // "popup" is load-bearing: consumers classify a cancel by it.
                            `[HEIMDALL] The enclave popup was closed before it responded `
                            + `(waiting for '${responseTypeToAwait}')`,
                        )));
                    }
                }, CLOSE_POLL_INTERVAL_MS);
            }

            if (guard?.timeoutMs !== undefined && guard.timeoutMs > 0) {
                const ms = guard.timeoutMs;
                deadline = setTimeout(() => {
                    settle(() => reject(new HeimdallWaitError(
                        HeimdallWaitCode.Timeout,
                        // Deliberately avoids the words "popup" and "cancel" so this is
                        // not mistaken for an operator cancelling.
                        `[HEIMDALL] The enclave window did not respond within `
                        + `${Math.round(ms / 1000)}s (waiting for '${responseTypeToAwait}')`,
                    )));
                }, ms);
            }
        });
    }

    private sendPostWindowMessage(message: any) {
        this.enclaveWindow?.postMessage(message, this.enclaveOrigin);
    }

    private processEvent(data: any, origin: string, expectedType: string, silent: boolean){
        if (origin !== new URL(this.enclaveOrigin).origin) {
            // Something's not right... The message has come from an unknown domain... 
            // Say so. A message that LOOKS like one of ours but arrives from another
            // origin is the signature of a stale enclaveOrigin (the home ORK moved,
            // or a newORKUrl update never landed), and it used to be dropped in
            // complete silence, which made it undiagnosable from the outside.
            // Only messages carrying a `type` are reported, so unrelated window
            // traffic (dev-server HMR, extensions, devtools) stays quiet, and the
            // existing `silent` flag is respected so concurrent waiters do not each
            // log the same message.
            if (!silent && typeof data?.type === "string") {
                console.warn("[HEIMDALL] Ignored message type{" + data.type + "} from origin{"
                    + origin + "} while expecting origin{" + new URL(this.enclaveOrigin).origin + "}");
            }
            return {ok: false, print: false, error: "WRONG WINDOW SENT MESSAGE"};
        }

        switch (data.type) {
            case "newORKUrl":
                this.enclaveOrigin = new URL(data.url).origin;
                break;
            case "error":
                this.onerror(data);
                return {ok: false, print: false, error: "handled error"}
        }

        if(expectedType !== data.type) {
            if(!silent) console.log("[HEIMDALL] Received type{" + data.type + "} but waiting for type{" + expectedType + "}");
            return {ok: false, print: false, error: "handled error"}
        }else{
            if(!silent) console.log("[HEIMDALL] Correctly received type{" + data.type + "}");
            return {ok: true, message: data.message}
        }
    }
}
export enum windowType{
    Popup,
    Redirect,
    Hidden
};
export interface HiddenInit{
    backgroundUrl: string;

    logoUrl: string;

    doken: string;
    /**
     * @returns A refresh doken for Heimdall
     */
    dokenRefreshCallback: () => Promise<string> | undefined;
    /**
     * @returns A function that re authenticates the current user from the client. (Used to update their session key on Identity System). Returns a new doken too.
     */
    requireReloginCallback: () => Promise<string>;
}
interface EnclaveFlow<T>{
    name: string;
    _windowType: windowType;

    open(): Promise<boolean>;
    send(data: any): void;
    recieve(type: string): Promise<any>;
    close(): void;

    onerror(data: any): void;

    getOrkUrl(): URL;
};