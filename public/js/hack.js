var item_type = document.getElementById("item_type");
var item_amount = document.getElementById("item_amount");

var min_time = document.getElementById("min_time");

function spawn() {
    var tile = tileSpawner_;
    for (var e = 0; e < item_amount.value; e++) {
        spawnItem_(tile, createItem_(item_type.value), find2x2Block_(tile.gridManager));
    }
}

function changeTime() {
    minutes = parseInt(min_time.value) * 10000;
}