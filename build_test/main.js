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

// NOTE(Jesper): Must be provided by user.
let boundValues = {
    "numbers": new BoundValueList([1, 2]),
    "items": new BoundValueList([{text:"hey"}, {text:"whats"}, {text:"up?"}]),
    "yolo": new BoundValueList([{hej:"yo"},{hej:"mannen"},{hej:"läget"}])
};

setInterval(() => {
    var content = boundValues["yolo"].values[0].content;
    content.hej += "o";
    //boundValues["yolo"].values[0].update(content);
    //boundValues["items"].add({text: new Date().getTime()});
    //boundValues["numbers"].add(new Date().getTime());
    //boundValues["items"].add({text: new Date().getTime()});
    /*let list = [];
    for (let i = 0; i < 3; i++) {
        list.push({text: new Date().getTime() + i});
    }
    boundValues["items"].set(list);*/
    boundValues["items"].values[1].set({ text: new Date().getTime() });
}, 1000);

let fzxxzbs = {
    html: `<div><div id="ukxmijo"></div><p>{{ item.text }}</p></div>`, id: 'fzxxzbs', valueKey: 'item', list: boundValues['items'],
    blocks: [
        { html: `<h2>Item!!!</h2>{{ item.text }}`, id: 'ukxmijo', valueKey: 'num', list: boundValues['numbers'] }
    ]
};
let ccimidi = {
    html: `<h3>{{ yo.hej }}</h3><div id="aeufgtu"></div>`, id: 'ccimidi', valueKey: 'yo', list: boundValues['yolo'],
    blocks: [
        { id: 'aeufgtu', condition: /*'yo.hej.length % 2 == 0'*/'true', html: '{{ yo.hej }}' }
    ]
};
let blocks = [ fzxxzbs, ccimidi ];

washiInit();

function washiInit() {
    washiCreateValueElements(blocks);
    washiRender(blocks);
}

function washiCreateValueElements(blocks) {
    const regex = /{{\s*\S*\s*}}/g;
    for (let block of blocks) {
        const found = block.html.match(regex);
        if (found) {
            for (let value of found) {
                let val = value.replace("{{", "").replace("}}", "").trim();
                block.html = block.html.replace(value, '<span id="' + val + '"></span>');
            }
        }
        if (block.blocks) {
            washiCreateValueElements(block.blocks); 
        }
    }
}

function washiRenderIfs(blocks, parent) {
    parent = parent ? parent : document;

    // Blocks
    for (let block of blocks) {
        let element = parent.querySelector("#" + block.id);

        if (block.condition) {

        }

        // Loops
        if (block.list) {
            /*for (let value of block.list.values) {
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
            }*/
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

function washiInnerRender(blocks, parent) {
    parent = parent ? parent : document;

    // Blocks
    for (let block of blocks) {
        let element = parent.querySelector("#" + block.id);

        // Loops
        if (block.list) {
            for (let value of block.list.values) {
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
                    washiInnerRender(block.blocks, valueElem);
                }
            }
        }

        // Ifs
        else if (block.condition) {
            let show = false;
            try {
                show = eval(block.condition);
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
                washiInnerRender(block.blocks, valueElem);
            }
        }
    }
}

function washiRender(blocks) {
    washiInnerRender(blocks, null);
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