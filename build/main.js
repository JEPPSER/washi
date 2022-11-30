class BoundValueList {
    values = [];

    constructor(values = null) {
        this.values = [];
        if (values) {
            for (let value of values) {
                this.values.push(new BoundValue(value));
            }
        }
    }

    add(value) {
        this.values.push(new BoundValue(value));
        washiRender(blocks);
    }

    deleteAt(index) {
        this.values[index].delete();
    }

    set(values) {
        for (let value of this.values) {
            value.state = "delete";
        }
        for (let value of values) {
            this.values.push(new BoundValue(value));
        }
        washiRender(blocks);
    }
}

class BoundValue {
    constructor(content, id = null, state = "none") {
        this.content = content;
        this.state = state;
        this.id = id;
        if (!this.id) {
            this.id = this.makeid(7);
        }
    }

    delete() {
        this.state = "delete";
        washiRender(blocks);
    }

    set(content) {
        this.content = content;
        washiRender(blocks);
    }

    makeid(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
}

// Bound values
let boundValues = {
    "numbers": new BoundValueList([1, 2]),
    "items": new BoundValueList([{text:"hey"}, {text:"whats"}, {text:"up?"}]),
    "yolo": new BoundValueList([{hej:"yo"},{hej:"mannen"},{hej:"läget"}]),
    "screenSize": new BoundValue(window.innerWidth)
};

addEventListener("resize", (event) => {
    boundValues["screenSize"].set(event.target.innerWidth);
});

setInterval(() => {
    let content = boundValues["yolo"].values[0].content.hej + "o";
    boundValues["yolo"].values[0].set({hej: content});
}, 1000);

let kqapnbz = 
{ html: `<h1>BIIIG</h1>
`, id: 'kqapnbz', condition: 'screenSize > 1000', blocks: [
] };
let pltogie = 
{ html: `<h1>small</h1>
`, id: 'pltogie', condition: 'screenSize < 1000', blocks: [
] };
let srrvddg = 
{ html: `<div>
<div id="pdggsai"></div>
<p>{{ item.text }}</p>
</div>
`, id: 'srrvddg', valueKey: 'item', list: boundValues['items'], blocks: [
{ html: `<h2>Item!!!</h2>
`, id: 'pdggsai', valueKey: 'num', list: boundValues['numbers'], blocks: [
] }] };
let ymuusyc = 
{ html: `<h3>{{ yo.hej }}</h3>
<div id="dltylqe"></div>
`, id: 'ymuusyc', valueKey: 'yo', list: boundValues['yolo'], blocks: [
{ html: `{{ yo.hej }}
`, id: 'dltylqe', condition: 'yo.hej.length % 2 == 0', blocks: [
] }] };
let blocks = [ kqapnbz, pltogie, srrvddg, ymuusyc,  ];

washiInit();

function washiInit() {
    let body = document.querySelector("body");
    body.innerHTML = washiReplaceValues(body.innerHTML);
    let children = body.querySelectorAll("span");
    for (let child of children) {
        for (const [key, value] of Object.entries(boundValues)) {
            child.id = child.id.replace(key, value.id);
        }
    }

    washiCreateValueElements(blocks);
    washiRender(blocks);
}

function washiReplaceValues(html) {
    const regex = /{{\s*\S*\s*}}/g;
    const found = html.match(regex);
    if (found) {
        for (let value of found) {
            let val = value.replace("{{", "").replace("}}", "").trim();
            html = html.replace(value, '<span id="' + val + '"></span>');
        }
    }
    return html;
}

function washiCreateValueElements(blocks) {
    for (let block of blocks) {
        block.html = washiReplaceValues(block.html);
        if (block.blocks) {
            washiCreateValueElements(block.blocks); 
        }
    }
}

function washiRenderValues(blocks, parent) {
    parent = parent ? parent : document;

    // Blocks
    for (let block of blocks) {
        let element = parent.querySelector("#" + block.id);

        // Loops
        if (block.list) {
            for (let value of block.list.values) {
                let valueElem = element.querySelector("#" + value.id);
                if (valueElem) {
                    let children = valueElem.querySelectorAll("span");
                    for (let child of children) {
                        child.id = child.id.replace(block.valueKey, value.id);
                    }
                }

                if (block.blocks) {
                    washiRenderValues(block.blocks, valueElem);
                }
            }
        }
    }
}

function washiInnerRender(blocks, parent, values) {
    parent = parent ? parent : document;

    // Blocks
    for (let block of blocks) {
        let element = parent.querySelector("#" + block.id);

        // Loops
        if (block.list) {
            let i = 0;
            for (let value of block.list.values) {
                let newValues = [...values];
                newValues.push({ key: block.valueKey, value: value.content });
                let valueElem = element.querySelector("#" + value.id);
                if (!valueElem) {
                    valueElem = washiCreateElementFromHTML(block.html);
                    valueElem.id = value.id;
                    let children = valueElem.querySelectorAll("span");
                    for (let child of children) {
                        child.id = child.id.replace(block.valueKey, value.id);
                    }
                    element.appendChild(valueElem);
                } else if (value.state == 'delete') {
                    element.removeChild(valueElem);
                }

                if (block.blocks) {
                    washiInnerRender(block.blocks, valueElem, newValues);
                }
                i++;
            }
        }

        // Ifs
        else if (block.condition) {
            let show = false;
            try {
                let valuesStr = "";
                for (let value of values) {
                    valuesStr += "let " + value.key + " = " + JSON.stringify(value.value) + "\n";
                }
                let code = valuesStr + block.condition;
                show = eval(code);
            } catch (e) {
                console.log(e);
                continue;
            }
        
            if (!show && element.style.display != "none") {
                element.style = "display: none";
            } else if (show && element.style.display == "none") {
                element.style = "display: initial";
            }

            if (!element.innerHTML) {
                element.innerHTML = block.html;
            }

            if (block.blocks) {
                washiInnerRender(block.blocks, element, values);
            }
        }
    }
}

function washiRender(blocks) {
    let values = [];
    for (const [key, value] of Object.entries(boundValues)) {
        if (value.constructor.name == "BoundValue") {
            values.push({ key: key, value: value.content });
        } else if (value.constructor.name == "BoundValueList") {
            values.push({ key: key, value: value.values });
        }
    }

    washiInnerRender(blocks, null, values);
    washiRenderValues(blocks, null);

    // Update values.
    for (const [key, value] of Object.entries(boundValues)) {
        if (value.constructor.name == "BoundValue") {
            washiUpdateSpans(value);
        } else if (value.constructor.name == "BoundValueList") {
            for (let boundValue of value.values) {
                washiUpdateSpans(boundValue);
            }
            boundValues[key].values = value.values.filter(v => v.state != "delete");
        }
    }

    // Remove deleted values.
    for (const [key, value] of Object.entries(boundValues)) {
        if (value.constructor.name == "BoundValue") {
            value.state = "none";
        } else if (value.constructor.name == "BoundValueList") {
            value.values = value.values.filter(v => v.state != "delete");
            for (let boundValue of value.values) {
                boundValue.state = "none";
            }
        }
    }
}

function washiUpdateSpans(value) {
    let spans = document.querySelectorAll("span");
    for (let elem of spans) {
        if (elem.id.startsWith(value.id)) {
            let innerValue = washiGetValue(value.content, elem.id);
            if (elem.innerHTML != innerValue) {
                elem.innerHTML = innerValue;
            }
        }
    }
}

function washiGetValue(object, key) {
    let value = object;
    let parts = key.split(".");
    if (parts.length > 1) {
        for (let i = 1; i < parts.length; i++) {
            value = value[parts[i]];
        }
    }
    return value;
}

function washiCreateElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div;
}