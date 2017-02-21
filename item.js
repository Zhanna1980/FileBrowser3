/**
 * Created by zhannalibman on 21/02/2017.
 */
var Item = (function () {
    "use strict";

    Item.TYPE = {FOLDER: 0, FILE: 1};

    function Item(id, name, type) {
        this.id = id;
        this.name = name;
        this.type = type;
    }

    Item.prototype.rename = function (newName) {
        this.name = newName;
    };

    Item.prototype.getName = function () {
        return this.name;
    };

    Item.prototype.getId = function () {
        return this.id;
    };

    Item.prototype.getType = function () {
        return this.type;
    };

    return Item;
})();
