var File = (function () {
    "use strict";

File.prototype = Object.create(Item.prototype);

function File (id, name, content) {
    Item.call(this, id, name, Item.TYPE.FILE);
    this.content = content;
}

File.prototype.setContent = function (content) {
    this.content = content;
};

File.prototype.getContent = function () {
    return this.content;
};



// constructor(id, name, content)
// rename(newName)
// setContent(content)
// getContent()
// getId()
// getType()

    return File;
})();