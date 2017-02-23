var Folder = (function () {
    "use strict";

    Folder.prototype = Object.create(Item.prototype);

    function Folder(id, name) {
        Item.call(this, id, name, Item.TYPE.FOLDER);
        this.children = [];
    }

    /**
     * Deletes the child with given id.
     * @param id - the id of the child item.
     * */
    Folder.prototype.deleteChild = function (id) {
        var index = findChildIndexById.call(this, this.children, id);
        if (index != -1) {
            this.children.splice(index, 1);
        }
    };

    /**
     * Pushes a new item to the array of subitems.
     * */
    Folder.prototype.addChild = function (item) {
        if (item instanceof Item) {
            this.children.push(item);
            this.children = sortContent(this.getChildren());
        } else {
            throw new Error("Invalid parameter type");
        }
    };

    /**
     * Returns child with the specified id.
     * @param id - the id of the child.
     * @return child item with given id or null if not found.
     * */
    Folder.prototype.findChild = function (id) {
        var index = findChildIndexById.call(this, this.children, id);
        if (index == -1) {
            return null;
        }
        return this.children[index];
    };

    /**
     * Renames child item with given id.
     * @param newName - a new name.
     * @param childId - the id of the child item to be renamed.
     * */
    Folder.prototype.renameChild = function (newName, childId) {
        if (this.findChildByName(newName) == null) {
            this.findChild(childId).rename(newName);
            this.children = sortContent(this.getChildren());
        } else {
            throw new Error("Element with such name already exists.");
        }
    };

    /**
     * Searches for a child item with a given name.
     * @param childName - String, the name of the item that is searched for .
     * @return childItem or null if folder doesn't contain child item with the given name.
     **/
    Folder.prototype.findChildByName = function (childName) {
        for (var i = 0; i < this.children.length; i++) {
            if (this.children[i].name === childName) {
                return this.children[i];
            }
        }
        return null;
    };

    /**Returns the array of children.
     * @return Array of subitems.
     * */
    Folder.prototype.getChildren = function () {
        return this.children;
    };

    /**
     * Checks if given folder has subfolders.
     * @return Boolean: true if it has subfolders and false if it has not.
     * */
    Folder.prototype.hasSubfolders = function () {
        var children = this.getChildren();
        for (var i = 0; i < children.length; i++) {
            if (children[i].getType() === Item.TYPE.FOLDER) {
                return true;
            }
        }
        return false;
    };


    // Internal functions:

    /**
     * Returns the index of the child item in the array of subitems
     * @param children - the Array of subitems in the folder.
     * @param id - child item id
     * @return index of the item in the children array or -1 if not found.
     * */
    var findChildIndexById = function (children, id) {
        for (var i = 0; i < this.children.length; i++) {
            if (this.children[i].id == id) {
                return i;
            }
        }
        return -1;
    };

    /**
     * Sorts by folder/file and alphabetically.
     * @param folderContent - array of objects which are stored in given folder
     * @return Array, sorted by folder/file and alphabetically.
     * */
    var sortContent = function (folderContent) {
        var sortedFolderContent = folderContent.sort(function (a, b) {
            //if both file or folder
            if (a.getType() == b.getType()) {
                return (a.getName()).localeCompare(b.getName());
            }

            return a.getType() === Item.TYPE.FOLDER ? -1 : 1;
        });
        return sortedFolderContent;
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