fetch('https://raw.githubusercontent.com/tide-foundation/Tide-h4x2-2/main/H4x2-Node/H4x2-Node/wwwroot/index.html')
  .then(response => response.text())
  .then(html => {
    // modify html to modify on-vendor = true element
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(html, 'text/html');
    htmlDoc.getElementById("on-vendor").innerText = "true"; // modify element
    htmlDoc.getElementById("container-enclave-id").style = "background-color: transparent;" // remove background image
    htmlDoc.getElementsByClassName("links").map(el => el.href = "https://raw.githubusercontent.com/tide-foundation/Tide-h4x2-2/main/H4x2-Node/H4x2-Node/wwwroot/" + el.href);
    htmlDoc.getElementsByClassName("s_links").map(el => el.src = "https://raw.githubusercontent.com/tide-foundation/Tide-h4x2-2/main/H4x2-Node/H4x2-Node/wwwroot/" + el.src); // added full URL to fetch
    const htmlToAdd = new XMLSerializer().serializeToString(htmlDoc);

    // add enclave to site
    const frame = document.createElement("iframe");
    frame.srcdoc = htmlToAdd;
    document.body.appendChild(frame);
  });
// do SRI checks


