//used in index.html

fetch("recent-policy.html")
    .then(res => res.text())
    .then(html => {
    document.getElementById("recent-policy").innerHTML = html;
    });