import { canvasWidth, canvasHeight, encryptImage, verifyLogIn, processImage, getTime } from "/utils.js"

export const imgInput = document.getElementById('imgfileinput')
export const uploadCanvas = document.getElementById('imgfileoutput')

imgInput.addEventListener("change", () => {
    uploadCanvas.width = canvasWidth
    uploadCanvas.height = canvasHeight
    const ctx = uploadCanvas.getContext('2d');
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);         // clear the canvas
    const imgInstance = processImage(imgInput.files[0])     // convert img file to an Image instance
    imgInstance.onload = function () {
        let width = imgInstance.naturalWidth;
        let height = imgInstance.naturalHeight
        const [newX, newY, newWidth, newHeight] = getNewSizeAndPlacement(width, height);
        ctx.drawImage(imgInstance, newX, newY, newWidth, newHeight);
    }
})

function getNewSizeAndPlacement(width, height) {
    var ratio;
    if (width == height) {
        ratio = 1
    }
    else if (width < height) {
        ratio = canvasHeight / height

    } else {
        ratio = canvasWidth / width
    }
    const newHeight = height * ratio
    const newWidth = width * ratio
    const newX = parseInt((canvasWidth - newWidth) / 2)
    const newY = parseInt((canvasHeight - newHeight) / 2)
    return [newX, newY, newWidth, newHeight]
}

export async function upload() {
    
    const [uid, publicKey, jwt] = verifyLogIn()

    var ctx = uploadCanvas.getContext('2d');
    var imgData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    const [encryptedImgString, encryptedImgKeyString] = await encryptImage(imgData, uid);

    // get description
    const descriptionInput = document.getElementById('descriptioninput')
    const description = descriptionInput.value;

    // send the image and description to the server
    const form = new FormData();
    form.append("seed", encryptedImgKeyString)
    form.append("description", description)
    form.append("encryptedImg", encryptedImgString)
    form.append("jwt", jwt)
    const resp = await fetch(window.location.origin + `/user/addImage?albumId=${uid}`, {
        method: 'POST',
        body: form
    });
    if (!resp.ok) {
        alert("Something went wrong with uploading the image.")
    }
    else {
    }
    
}
