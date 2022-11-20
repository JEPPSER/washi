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
    "items": [
        new BoundValue("hej"),
        new BoundValue("då")
    ]
};