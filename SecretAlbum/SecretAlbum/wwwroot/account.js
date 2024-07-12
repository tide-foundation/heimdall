import { Heimdall, TidePromise } from 'https://cdn.jsdelivr.net/gh/tide-foundation/heimdall@main/src/heimdall.js';
import { canvasWidth, canvasHeight, decryptImage, verifyLogIn, getTime, prepareAlbumCanvas, encryptedDefaultImage } from "/utils.js"

export async function showMyAlbum() {
    const [uid, publicKey, jwt] = verifyLogIn()

    // request my images from server
    const respGetImages = await fetch(window.location.origin + `/user/getimages?uid=${uid}`);
    const respGetImagesText = await respGetImages.text();
    if (respGetImagesText == "--FAILED--") {
        alert("failed.")
        return
    }
    const respGetImagesJson = JSON.parse(respGetImagesText);

    // set up the table, clear it, and populate it.
    var table = document.getElementById("myalbumtbl");
    table.style = "border-collapse:collapse; table-layout:fixed; word-wrap:break-word;"
    var tbody = table.getElementsByTagName("tbody")[0];
    while (table.rows.length > 1) table.rows[1].remove();

    let pixelArrays;
    if (respGetImagesJson.length > 0) {
        const pixArrays = await decryptImage(uid, respGetImagesJson.map(r => r.encryptedData), respGetImagesJson.map(r => r.seed));
        pixelArrays = pixArrays.map(p => new Uint8ClampedArray(p));
    }

    for (var i = 0; i < respGetImagesJson.length; i++) {
        prepareRow(tbody, i, respGetImagesJson[i], pixelArrays[i])
    }
}

async function prepareRow(tbody, i, image, pixelArray) {
    const [uid, publicKey, jwt] = verifyLogIn()

    let imageStatus = "private";
    if (image.pubKey != "0") {
        imageStatus = "public"
    }

    var [imageCell, actionCell] = prepareCells(image.description, imageStatus, tbody);

    // prepare canvas to draw the image on
    var rowCanvas = prepareAlbumCanvas(imageCell, i, canvasWidth, canvasHeight)
    var ctx = rowCanvas.getContext('2d');
    ctx.clearRect(0, 0, rowCanvas.width, rowCanvas.height);

    // decrypt the image and draw it

    var imgData = new ImageData(pixelArray, rowCanvas.width, rowCanvas.height)
    ctx.putImageData(imgData, 0, 0)
    

    // make action buttons
    //createMakePublicButton("Make Public", image.id, actionCell);
    createDeleteButton("Delete", image.id, actionCell);
    
}

function prepareCells(description, imageStatus, tbody) {
    const row = document.createElement("tr");
    const imageCell = document.createElement("td");
    const descriptionCell = document.createElement("td");
    descriptionCell.style = "vertical-align: top; white-space: pre-wrap; word-wrap:break-word;"
    descriptionCell.textContent = "\r\nSTATUS: " + imageStatus + "\r\n\r\nDESCRIPTION: " + description;
    const actionCell = document.createElement("td");
    actionCell.style = "vertical-align: top;"

    row.appendChild(imageCell)
    row.appendChild(descriptionCell)
    row.appendChild(actionCell)
    tbody.appendChild(row);

    return [imageCell, actionCell]
}

function createMakePublicButton(text, imageId, actionCell) {
    const actionBtn = document.createElement("button");
    actionBtn.textContent = text
    actionBtn.style = 'float: right; margin: 4px'
    actionBtn.addEventListener('click', function () {
        requestMakePublic(imageId);
    })
    actionCell.appendChild(actionBtn)
    actionCell.appendChild(document.createElement("br"))
}

async function requestMakePublic(imageId) {
    const [uid, publicKey, jwt] = verifyLogIn()

    if (!confirm("Are you sure you want to make this image public? This action cannot be reversed.")) {
        return
    }
    // request my images from server
    const form = new FormData();

    form.append("imageId", imageId)
    form.append("pubKey", publicKey)
    form.append("jwt", jwt)
    const resp = await fetch(window.location.origin + `/user/makepublic?albumId=${uid}`, {
        method: 'POST',
        body: form
    });
    if (!resp.ok) alert("Something went wrong with uploading the image");

    //showMyAlbum()
    window.location.replace(window.location.origin + `/main.html#account`);
    
}

function createShareWithButton(text, imageId, actionCell, seed) {
    const actionBtn = document.createElement("button");
    actionBtn.textContent = text
    actionBtn.style = 'float: right; margin: 4px'
    actionBtn.addEventListener('click', async function () {
        const list = await getUserAliases()
        const selectedUser = prompt(
            "Enter the UID of the user you wish to share the image with:\n" + userListToString(list),
            "example: dd30729027d07e04455408fcac66fa612b34838b74c726076ffeb10e1058cc01"
        );
        if (!selectedUser) return;
        requestShareWith(imageId, selectedUser, seed);
    })
    actionCell.appendChild(actionBtn)
    actionCell.appendChild(document.createElement("br"))
}

async function getUserAliases() {
    // query available user aliases from the server 
    const resp = await fetch(window.location.origin + `/user/getalbums`, {
        method: 'GET',
    });
    if (!resp.ok) alert("Something went wrong with uploading the image");

    const respText = await resp.text();
    const respJson = JSON.parse(respText)
    const list = respJson.map(({ userAlias, albumId }) => [userAlias, albumId]);
    return list;
}

function userListToString(list) {
    var returnString = ""
    for (const user of list) {
        returnString += "\n" + user[0] + " - " + user[1]
    }
    return returnString
}

function createDeleteButton(text, imageId, actionCell) {
    const actionBtn = document.createElement("button");
    actionBtn.textContent = text
    actionBtn.style = 'float: right; margin: 4px'
    actionBtn.addEventListener('click', function () {
        requestDelete(imageId);
    })
    actionCell.appendChild(actionBtn)
    actionCell.appendChild(document.createElement("br"))
}

async function requestDelete(imageId) {
    
    if (!confirm("Are you sure you want to delete this image?")) {
        return
    }
    const form = new FormData();
    const [uid, publicKey, jwt] = verifyLogIn()

    form.append("imageId", imageId)
    form.append("jwt", jwt)
    const resp = await fetch(window.location.origin + `/user/deleteImage?albumId=${uid}`, {
        method: 'POST',
        body: form
    });
    if (!resp.ok) alert("Something went wrong with deleting the image");

    showMyAlbum()
    window.location.replace(window.location.origin + `/main.html#account`);
    
}
