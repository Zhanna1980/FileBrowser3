
var FileSystem = (function () {
    "use strict";

    function FileSystem() {
        try {
            const fsStorageAsArray = JSON.parse(localStorage.getItem("saveArray"));
            fromSaveFormat.call(this, fsStorageAsArray);
        } catch (err) {
            this.lastAddedId = -1;
            this.root = new Folder(++this.lastAddedId, "root");
        }
    }

    /**
     * Adds new folder to a parent item.
     * @param name - a name of a new folder.
     * @param parentId - the id of the parent item.
     * */
    FileSystem.prototype.addFolder = function (name, parentId) {
        createFileOrFolder.call(this, name, parentId, Item.TYPE.FOLDER);
    };

    /**
     * Adds new file to a parent item.
     * @param name - a name of a new file.
     * @param parentId - the id of the parent item.
     * */
    FileSystem.prototype.addFile = function (name, parentId, content) {
        createFileOrFolder.call(this, name, parentId, Item.TYPE.FILE, content);
    };

    /**
     * Renames item.
     * @param id - the id of the item to be renamed.
     * @param newName - String, the new item name.
     * */
    FileSystem.prototype.renameItem = function (id, newName) {
        if (newName == undefined || newName.length == 0 || newName.indexOf("/") != -1) {
            throw new Error("Invalid item name.")
        } else if (id == 0) {
            this.root.rename(newName);
        } else {
            var parent = findParentByItemId.call(this, id);
            parent.renameChild(newName, id);
        }
        saveData.call(this);
    };

    /**
     * Deletes item from fileSystem.
     * @param id - the id of the item that will be deleted.
     * */
    FileSystem.prototype.deleteItem = function (id) {
        var parent = findParentByItemId.call(this, id);
        if (parent == null) {
            return;
        }
        parent.deleteChild(id);
        saveData.call(this);
    };

    /**
     * Returns item according to the given parameter. if param is undefined the function returns root item.
     * @param param - path (as a string) or id (as a number)
     * @return item object or null if not found.
     * */
    FileSystem.prototype.getItem = function (param) {
        if (param == undefined) {
            return this.root;
        }
        if (typeof param == "number") {
            return findItemById.call(this, param, this.root);
        }
        if (typeof param == "string") {
            return findItemByPath.call(this, param, this.root);
        }
        return null;
    };

    /**
     * Gets path by item id
     * @param id - the id of the item.
     * @return String that represents the path.
     * */
    FileSystem.prototype.getPath = function (id) {
        var path = generatePathByItem.call(this, this.getItem(id));
        // removes starting '/'
        return path.substr(1);
    };

    // Internal functions:

    /**
     * Checks that the item is a folder
     * @param item - object in fsSystem
     * @return Boolean - true if the item is a folder and false if it is a file
     * */
    var isFolder = function (item) {
        return item.getType() === Item.TYPE.FOLDER;
    };

    /**
     * Finds item by its id
     * @param itemId - the id of the item
     * @return item object with given id
     * */
    var findItemById = function (itemId) {
        return findItemRecursive(itemId, this.root, null).item;
    };

    /**
     * Finds parent item by id of the child item
     * @param itemId - the id of the child item.
     * @return parent object.
     * */
    var findParentByItemId = function (itemId) {
        return findItemRecursive(itemId, this.root, null).parent;
    };

    /**
     * Searches recursively for an item in file system.
     * @param id - integer which is stored in item.id
     * @param item - object from which the function starts search
     * @param parent - parent object of item
     * @return object with item with given id and with parent item.
     * */
    var findItemRecursive = function (id, item, parent) {
        if (item.getId() == id) {
            return {item: item, parent: parent};
        }
        if (isFolder(item)) {
            var  children = item.getChildren();
            for (var i = 0; i < children.length; i++) {
                var result = findItemRecursive(id, children[i], item);
                if (result.item !== null) {
                    return result;
                }
            }
        }
        return {item: null, parent: null};
    };

    /**
     * Find item by given path.
     * @param path - String that represents an address in file system.
     * @return item or null if it was not found (invalid or wrong path).
     * */
    var findItemByPath = function (path) {
        var trimmedPath = path.trim();
        var elementsInPath = trimmedPath.split("/");
        if (elementsInPath[elementsInPath.length - 1] == "") {
            elementsInPath.pop();
        }
        var currentElement = null;
        if (elementsInPath.length > 0 && elementsInPath[0] == "root") {
            currentElement = this.root;
        } else {
            return null;
        }
        for (var i = 1; i < elementsInPath.length; i++) {
            currentElement = currentElement.findChildByName(elementsInPath[i]);
            if (currentElement == null) {
                return null;
            }
        }
        return currentElement;
    };

    /**
     * Generates path by item. Implementation detail of generatePathByElementId. Do not call directly.
     * @param item - object in the fsStorage.
     * @return String that represents the path (starting with '/').
     * */
    var generatePathByItem = function (item) {
        if (item == null) {
            return "";
        }
        var parent = findParentByItemId.call(this, item.getId(), this.root);
        return generatePathByItem.call(this, parent) + "/" + item.name;
    };

    /**
     * Find unique name for file/folder inside the parent item.
     * @param itemName - supposed item name.
     * @param parent - parent item.
     * @return unique name with index if needed.
     * */
    var getUniqueName = function (itemName, parent) {
        var counter = 0;
        var elementNameExists = true;
        while (elementNameExists) {
            var possibleName = counter > 0 ? (itemName + "(" + counter + ")") : itemName;
            if (parent.findChildByName(possibleName) == null) {
                return possibleName;
            }
            counter++;
        }
    };

    /**
     * Creates new file or folder.
     * @param name - the name of a new item.
     * @param parentId - the id of the parent folder to which a new item will be appended.
     * @param type - type of the new item.
     * @param content - content if the new item is a file.
     * */
    var createFileOrFolder = function (name, parentId, type, content) {
        var parent = this.getItem(parentId);
        var newItemName;
        var newItem;
        if (name !== undefined && name.length !== 0) {
            if (parent.findChildByName(name) !== null) {
                throw new Error ("Element with such name already exists.");
            }
            newItemName = name;
        } else {
            var possibleName = type === Item.TYPE.FOLDER ? "new folder" : "new file.txt";
            newItemName = getUniqueName(possibleName, parent);
        }
        if (type === Item.TYPE.FOLDER) {
            newItem = new Folder(++this.lastAddedId, newItemName);
        } else {
            newItem = new File(++this.lastAddedId, newItemName, content);
        }
        parent.getChildren().push(newItem);
        saveData.call(this);
    };

    /**
     * Converts recursively the file system to a flat array.
     * @param item - item of file system. First time the function is called with root item
     * @param parent - parent item. First time the function is called with null
     * @return Array - objects of file system in the flat array
     * */
    var toSaveFormat = function (item, parent) {
        var saveArray = [itemToSaveFormat(item, parent)];
        if (isFolder(item)) {
            var children = item.getChildren();
            for (var i = 0; i < children.length; i++) {
                var arr = toSaveFormat(children[i], item);
                saveArray = saveArray.concat(arr);
            }
        }
        return saveArray;
    };

    /**
     * Converts the item to object for array
     * @param item - object at the runtime format
     * @param parent - parent item of the given object
     * @return object at the save format
     * */
    var itemToSaveFormat = function (item, parent) {
        const parentId = parent === null ? null : parent.getId();
        var element = {id: item.getId(), parent: parentId, name: item.getName(), type: item.getType()};
        if (!isFolder(item)) {
            element.content = item.getContent();
        }
        return element;
    };


    /**
     * Converts the object from the flat array to item.
     * @param objectInArray - object from saved array
     * @return item at the runtime format
     * */
    var itemFromSaveFormat = function (objectInArray) {
        const type = objectInArray.type;
        if (type === Item.TYPE.FOLDER) {
            return new Folder(objectInArray.id, objectInArray.name);
        } else {
            return new File(objectInArray.id, objectInArray.name, objectInArray.content);
        }
    };

    /**
     * Converts flat array to fsStorage object
     * @param arr - fsStorage as array (saved format)
     * */
    var fromSaveFormat = function (arr) {
        //"root" always goes first in the array
        this.root = itemFromSaveFormat(arr[0]);
        this.lastAddedId = 0;
        for (var i = 1; i < arr.length; i++) {
            //parent is always before child in the array
            this.getItem(arr[i].parent).addChild(itemFromSaveFormat(arr[i]));
            if (arr[i].getId() > this.lastAddedId) {
                this.lastAddedId = arr[i].getId();
            }
        }
    };

    /**
     * Saves the data at the save format in the localStorage.
     * */
    var saveData = function () {
        try {
            const fsStorageAsArray = toSaveFormat(this.root, null);
            localStorage.setItem("saveArray", JSON.stringify(fsStorageAsArray));
        } catch(err) {
            alert("Error occurred while saving the data");
        }
    };




// constructor()
// addFolder(name, parentId)
// addFile(name, parentId, content)
// renameItem(id, newName)
// deleteItem(id)
// getItem(path | id | undefined -> root)
// getPath(id)

    return FileSystem;
})();