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