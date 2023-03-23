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

fetch('https://raw.githubusercontent.com/tide-foundation/Tide-h4x2-2/main/H4x2-Node/H4x2-Node/wwwroot/index.html')
  .then(response => response.text())
  .then(html => {
    // modify html to modify on-vendor = true element
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(html, 'text/html');
    htmlDoc.getElementById("on-vendor").innerText = "true"; // modify element
    htmlDoc.getElementById("container-enclave-id").style = "background-color: transparent;" // remove background image
    htmlDoc.getElementById("div-secretcode").remove();
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


