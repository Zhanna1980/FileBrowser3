
var FileSystem = (function () {
    "use strict";

    function FileSystem() {
        this.lastAddedId = -1;
        this.root = new Folder(++this.lastAddedId, "root");
    }

    FileSystem.prototype.addFolder = function (name, parentId) {

    };

    FileSystem.prototype.addFile = function (name, parentId, content) {

    };

    FileSystem.prototype.renameItem = function (id, newName) {

    };

    FileSystem.prototype.deleteItem = function (id) {

    };

    FileSystem.prototype.getItem = function () {

    };

    FileSystem.prototype.getPath = function (id) {

    };


    // "private" functions:

    /**
     * Checks that the item is a folder
     * @param item - object in fsSystem
     * @return Boolean - true if the element is a folder and false if it is a file
     * */
    var isFolder = function (item) {
        return item.getType() === Item.TYPE.FOLDER;
    };

    /**
     * Converts fsSystem to flat array.
     * @param item - item of fsSystem. First time the function is called with root item
     * @param parent - parent item. First time the function is called with null
     * @return Array - objects of fsSystem in flat array
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
     * Converts the object from flat array to item.
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

    // /**
    //  * Converts flat array to fsStorage object
    //  * @param arr - fsStorage as array (saved format)
    //  * */
    // function fromSaveFormat(arr) {
    //     fsStorage = [];
    //     fsStorage.push(objFromSaveFormat(arr[0]));// "root" always goes first in the array
    //     lastAddedId = 0;
    //     for (var i = 1; i < arr.length; i++) {
    //         //parent is always before child in the array
    //         findElementById(arr[i].parent).children.push(objFromSaveFormat(arr[i]));
    //         if (arr[i].id > lastAddedId) {
    //             lastAddedId = arr[i].id;
    //         }
    //     }
    // }
    //
    // /**
    //  * Converts data to a save format and saves it in the localStorage.
    //  * */
    // function saveData() {
    //     try {
    //         const fsStorageAsArray = toSaveFormat(fsStorage[0], null);
    //         localStorage.setItem("saveArray", JSON.stringify(fsStorageAsArray));
    //     } catch(err) {
    //         alert("Error occurred while saving the data");
    //     }
    // }


// constructor()
// addFolder(name, parentId)
// addFile(name, parentId, content)
// renameItem(id, newName)
// deleteItem(id)
// getItem(path | id | undefined -> root)
// getPath(id)

    return FileSystem;
})();