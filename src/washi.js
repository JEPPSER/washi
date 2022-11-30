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
                element.innerHTML = "";
            } else if (show && element.style.display == "none") {
                element.style = "display: initial";
                if (!element.innerHTML) {
                    element.innerHTML = block.html;
                }
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
    div.style = "display: inherit";
    return div;
}