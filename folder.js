var Folder = (function () {
    "use strict";

Folder.prototype = Object.create(Item.prototype);

function Folder(id, name) {
    Item.call(this, id, name, Item.TYPE.FOLDER);
    this.children = [];
}

Folder.prototype.deleteChild = function (id) {
    var index = this.findChildIndexById(this.children, id);
    if (index != -1) {
        this.children.splice(index, 1);
    }
};

Folder.prototype.addChild = function (item) {
    if (item instanceof Item) {
        this.children.push(item);
    } else {
        throw new Error ("Invalid parameter type");
    }
};

Folder.prototype.findChild = function(id) {
    var index = this.findChildIndexById(this.children, id);
    if (index == -1) {
        return null;
    }
    return this.children[index];
};

Folder.prototype.getChildren = function() {
    return this.children;
};


// "private" functions:

var findChildIndexById = function (children, id) {
    for (var i = 0; i < this.children; i++) {
        if (this.children[i].id == id) {
            return i;
        }
    }
    return -1;
};

// constructor(id, name)
// deleteChild(id)
// rename(newName)
// addChild(Folder | File)
// findChild(id)
// getChildren()
// getId()
// getType()
    return Folder;
})();