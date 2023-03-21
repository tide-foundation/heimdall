fetch('https://raw.githubusercontent.com/tide-foundation/Tide-h4x2-2/main/H4x2-Node/H4x2-Node/wwwroot/index.html')
  .then(response => response.text())
  .then(html => {
    // modify html to modify on-vendor = true element
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(html, 'text/html');
    htmlDoc.getElementById("on-vendor").innerText = "true"; // modify element
    htmlDoc.getElementById("container-enclave-id").style = "background-color: transparent;" // remove background image
    var l_elements = htmlDoc.getElementsByClassName("links");
    for (var i = 0; i < l_elements.length; i++) {
      l_elements[i].href = "https://tide-foundation.github.io/Tide-h4x2-2/H4x2-Node/H4x2-Node/wwwroot/" + new URL(l_elements[i].href).pathname; // change url paths
    }
    var s_elements = htmlDoc.getElementsByClassName("s_links");
    for (var i = 0; i < s_elements.length; i++) {
      s_elements[i].src = "https://tide-foundation.github.io/Tide-h4x2-2/H4x2-Node/H4x2-Node/wwwroot/" + new URL(s_elements[i].src).pathname;
    }
    const htmlToAdd = new XMLSerializer().serializeToString(htmlDoc);

    // add enclave to site
    const frame = document.createElement("iframe");
    frame.srcdoc = htmlToAdd;
    frame.style.backgroundColor = "transparent";
    frame.style.align = "centre";
    frame.style.width = "500px";
    frame.style.height = "800px";
    document.body.appendChild(frame);
  });
// do SRI checks


