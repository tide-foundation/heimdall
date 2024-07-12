import { Heimdall } from 'https://cdn.jsdelivr.net/gh/tide-foundation/heimdall@main/src/heimdall.js'
export const heimdall = new Heimdall({
    vendorPublic: "nq1736ii4EQSaqPpshp7TxFWPyScZPomskGSR/Plqcs=",
    vendorLocationSignature: "bTjK/zDby+jdUnNs48whlQui89SODITo2gTFxnKktOX7fg6ivNr5WT58E2faV31IhhtxwihPLHzkX+bu6Uu2BA==",
    homeORKUrl: "https://orkeylessh1.azurewebsites.net",
    enclaveRequest: {
        refreshToken: true, // I want a TideJWT returned
        customModel: undefined // I do not want to provide a customModel
    }
});

export const idList = ["photoKey"];