let lastSiteUrl = "";

function upload() {
    const owner = document.getElementById("owner").value;
    const password = document.getElementById("password").value;
    const file = document.getElementById("file").files[0];

    if (!owner || !password || !file) {
        return alert("Owner, password and file required");
    }

    const form = new FormData();
    form.append("owner", owner);
    form.append("password", password);
    form.append("file", file);

    fetch("http://waterbase1fileupload-2.onrender.com/upload", {
        method: "POST",
        body: form
    })
    .then(res => res.json())
    .then(data => {
        lastSiteUrl = `http://waterbase1fileupload-2.onrender.com/frontend/site.html?name=${data.siteName}`;

        document.getElementById("result").innerText =
            `Site created: ${lastSiteUrl}`;

        document.getElementById("getBtn").style.display = "inline-block";
    });
}

function openSite() {
    window.open(lastSiteUrl, "_blank");
}
