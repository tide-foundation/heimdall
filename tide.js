
var cvk = "blank";
function signin(event) {
  console.log('Button Clicked');
  cvk = "not blank";
  var l = document.getElementById("username").value
  myF(l); // vendor function!
}

fetch('tide.html')
  .then(response => response.text())
  .then(html => {
    const div = document.createElement("div");
    div.innerHTML = html;
    div.id = "tide-div"
    document.body.appendChild(div);

    const btn = document.querySelector('.signinbtn');
    btn.addEventListener('click', signin);
  });
// do SRI checks


