let loop1 = {
    html: "<p>{{item}}</p>",
    id: "#container",
    items: [
        "hej",
        "vad",
        "gör",
        "du"
    ]
};

let loops = [ loop1 ];

render();

function render() {
    for (let loop of loops) {
        let container = document.querySelector(loop.id);
        container.innerHTML = "";
        for (let item of loop.items) {
            let html = loop.html.replace("{{item}}", item);
            container.innerHTML += html;
        }
    }
}