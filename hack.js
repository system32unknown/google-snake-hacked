var item_type = document.getElementById("item_type");
var item_amount = document.getElementById("item_amount");

var min_time = document.getElementById("min_time");

function spawn() {
    for (var c = gridClass, d = item_amount.value, e = 0; e < d; e++) {
        ue(c, Yd(item_type.value), ne(c.g));
    }
}

function changeTime() {
    minutes = parseInt(min_time.value) * 10000;
}