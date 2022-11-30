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