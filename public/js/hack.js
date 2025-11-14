var item_type = document.getElementById("item_type");
var item_amount = document.getElementById("item_amount");

var min_time = document.getElementById("min_time");

function spawn() {
    var c = gridClass;
    for (var d = item_amount.value, e = 0; e < d; e++) {
        spawnItem(c, createItem(item_type.value), find2x2Block(c.g));
    }
}

function changeTime() {
    minutes = parseInt(min_time.value) * 10000;
}