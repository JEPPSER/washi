class BoundValue {
    constructor(content, id, state = "add") {
        this.content = content;
        this.state = state;
        this.id = id;
    }

    delete() {
        this.state = "delete";
    }

    update(content) {
        this.content = content;
        this.state = "update";
    }
}

// Bound values
let boundValues = {
    "questionList": [
        new BoundValue("hej", "loop1_1"),
        new BoundValue("vad", "loop1_2"),
        new BoundValue("gör", "loop1_3"),
        new BoundValue("du?", "loop1_4")
    ],
    "answerList": [
        new BoundValue({ text: "inget" }, "loop2_1"),
        new BoundValue({ text: "själv" }, "loop2_2"),
        new BoundValue({ text: "då?" }, "loop2_3"),
    ],
    "time": new BoundValue(new Date().getTime(), "time")
};

// Loops
let loop1 = {
    html: '<div id="if2"><p><span id="question"></span></p></div>',
    id: "loop1",
    valueKey: "question",
    values: boundValues["questionList"]
};
let loop2 = {
    html: '<li><span id="time"></span><span id="answer.text"></span></li>',
    id: "loop2",
    valueKey: "answer",
    values: boundValues["answerList"]
};
let loops = [
    loop1,
    loop2
];

// Ifs
let if1 = {
    id: "if1",
    condition: "boundValues['time'].content % 2 == 0"
}
let if2 = {
    id: "if2",
    condition: "boundValues['time'].content % 2 == 1"
}
let ifs = [
    if1,
    if2
]

render();

setInterval(() => {
    boundValues["time"].update(new Date().getTime());
    /*if (boundValues["answerList"].length > 0) {
        boundValues["answerList"][0].state = "delete";
    }*/
   
    render();
}, 1000);

function render() {

    // Loops
    for (let loop of loops) {
        let element = document.querySelector("#" + loop.id);

        // Add
        for (let value of loop.values.filter(v => v.state == 'add')) {
            var valueElem = element.querySelector("#" + value.id);
            if (!valueElem) {
                valueElem = createElementFromHTML(loop.html);
                valueElem.id = value.id;
                let children = valueElem.querySelectorAll("span");
                for (let child of children) {
                    child.id = child.id.replace(loop.valueKey, value.id);
                }
                element.appendChild(valueElem);
            }
            value.state = 'update';
        }

        // Remove
        for (let value of loop.values.filter(v => v.state == 'delete')) {
            var valueElem = element.querySelector("#" + value.id);
            if (valueElem) {
                element.removeChild(valueElem);
            }
        }
    }

    // Values
    for (const [key, value] of Object.entries(boundValues)) {
        if (!Array.isArray(value)) {
            if (value.state == "update" || value.state == "add") {
                updateSpans(value);
            }
        } else {
            for (let boundValue of value) {
                if (boundValue.state == "update") {
                    updateSpans(boundValue);
                }
            }
            boundValues[key] = value.filter(v => v.state != "delete");
        }
    }

    // If
    for (let item of ifs) {
        let elem = document.getElementById(item.id);
        let show = eval(item.condition);

        if (!show && elem.style.display != "none") {
            elem.style = "display: none";
        } else if (show && elem.style.display == "none") {
            elem.style = "display: initial";
        }
    }
}

function updateSpans(value) {
    let spans = document.querySelectorAll("span");
    for (let elem of spans) {
        if (elem.id.startsWith(value.id)) {
            elem.innerHTML = getValue(value.content, elem.id); 
        }
    }
    value.state = 'none'; 
}

function getValue(object, key) {
    let value = object;
    let parts = key.split(".");
    if (parts.length > 1) {
        for (let i = 1; i < parts.length; i++) {
            value = value[parts[i]];
        }
    }
    return value;
}

function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div;
}