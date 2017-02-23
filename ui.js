var UI = (function ($) {
    "use strict";

    function UI (fileSystem, history) {
        var self = this;
        this.fileSystem = fileSystem;
        this.navigationHistory = history;

        // initializes ui on page load
        $(document).ready(function () {
            self.navigationHistory.addToHistory(self.fileSystem.getItem().getId());
            updateUI();
            setupInitialEventHandlers();
        });


        /**
         * Creates folder tree display in the explorer panel,
         * displays folder or file in content panel and writes the path
         * according to current item in navigation history
         * */
        var updateUI = function () {
            showFolderOrFileContentById(self.navigationHistory.getCurrent(), true);
            var treeState = getExplorerState();
            showFoldersTree(treeState);
        };

        /**
         * Sets some general event listeners.
         * */
        var setupInitialEventHandlers = function () {
            $('.layout').contextmenu(function () {
                return false;
            });
            $(window).click(hideContextMenu);
            $("#content").contextmenu(function (event) {
                showContextMenu(event);
                return false;
            });
            $("#path").on('keydown', function (event) {
                //if enter was pressed
                if (event.keyCode == 13) {
                    var path = $(this).val();
                    var element = self.fileSystem.getItem(path);
                    if (element != null) {
                        showFolderOrFileContentById(element.id);
                    } else {
                        alert ("Path not found.");
                    }
                }
            });
            $("#btnBack").click(back);
            $("#btnForward").click(forward);
        };

        /**
         * Navigates back in the history.
         * */
        var back = function () {
            if (!self.navigationHistory.hasBack()) {
                return;
            }
            if (!showFolderOrFileContentById(self.navigationHistory.goBack(), true)) {
                alert("Folder/file you want to open doesn't exist." +
                    " The previous folder/file (if it exists) will be opened.");
                self.navigationHistory.deleteCurrentItemId(true/*goesBack*/);
                back();
            }
        };

        /**
         * Navigates forward in the history.
         * */
        var forward = function () {
            if (!self.navigationHistory.hasForward()) {
                return;
            }
            if (!showFolderOrFileContentById(self.navigationHistory.goForward(), true)) {
                alert("Folder/file you want to open doesn't exist." +
                    " The next folder/file (if it exists) will be opened.");
                self.navigationHistory.deleteCurrentItemId(false/*goesBack*/);
                forward();
            }
        };

        /**
         * Displays folder tree in the explorer.
         * @param collapsedElements - the object that represents the previous state of the tree.
         * */
        var showFoldersTree = function (collapsedElements) {
            var rootDomElement = $("#fs");
            rootDomElement.empty();
            showFoldersTreeRecursive(self.fileSystem.getItem(), rootDomElement, collapsedElements)
        };

        /**
         * Actual implementation (recursive) of showFoldersTree
         * @param item - item in the fileSystem.
         * @param parentInDom - html item to which a new entry will be appended.
         * @param collapsedElements - the object that represents the previous state of the tree.
         * */
        var showFoldersTreeRecursive = function (item, parentInDOM, collapsedElements) {
            if (item.getType() === Item.TYPE.FOLDER) {
                var isCollapsed = collapsedElements == undefined || collapsedElements.hasOwnProperty(item.id);
                var ul = createFoldersListElement(item, parentInDOM, isCollapsed).find("ul");
                var children = item.getChildren();
                for (var i = 0; i < children.length; i++) {
                    showFoldersTreeRecursive(children[i], ul, collapsedElements);
                }
            }
        };

        /**Creates single explorer tree object and attaches it to a parent object.
         * @param item - item in fileSystem.
         * @param parentInDOM - parent object to which the newly created object is attached
         * @param isCollapsed - the state of newly created object item.
         * @return the newly created object.
         * */
        var createFoldersListElement = function (item, parentInDOM, isCollapsed) {
            var elementInDom = $("<li><div class='image'/>" + " " +
                "<a href='#' data-id=" + item.getId() + ">" + item.getName() + "</a></li>");
            elementInDom.appendTo(parentInDOM);
            elementInDom.addClass("folder");
            if (isCollapsed && item.hasSubfolders()) {
                elementInDom.addClass("collapsed");
            }
            var ul = $('<ul></ul>');
            ul.appendTo(elementInDom);
            elementInDom.find("div").click(onFolderIconClick);
            elementInDom.find("a").click(onFolderNameClick);
            elementInDom.contextmenu(function (event) {
                showContextMenu(event);
                return false;
            });
            return elementInDom;
        };

        /**
         * Handles the click on the name of the folder in the explorer.
         * */
        var onFolderNameClick = function () {
            var clickedLink = $(this);
            if (clickedLink.closest("li").hasClass("collapsed")) {
                clickedLink.siblings('div').click();
            }
            const elementId = $(this).attr("data-id");
            showFolderOrFileContentById(elementId);
        };

        /**
         * Handles the click on the folder icon in the explorer
         * */
        var onFolderIconClick = function () {
            const folderId = parseInt($(this).siblings('a').attr("data-id"));
            if (self.fileSystem.getItem(folderId).hasSubfolders()) {
                $(this).parent().toggleClass("collapsed");
            }
        };

        /**
         * Display contents of folder in content panel
         * @param folderItem - folder to show in content panel
         * */
        var displayFolderContent = function (folderItem) {
            var contentDiv = clearAndReturnContentDiv();
            var folderContent = folderItem.getChildren();
            for (var i = 0; i < folderContent.length; i++) {
                var contentItem = $("<div data-id='" + folderContent[i].id + "'><div>" + folderContent[i].getName() + "</div></div>");
                contentItem.addClass("contentItem");
                contentItem.contextmenu(function (event) {
                    showContextMenu(event);
                    return false;
                });
                if (folderContent[i].getType() === Item.TYPE.FOLDER) {
                    contentItem.attr("data-type", "folder");
                    $("<img src='_images/folder.png'/>").prependTo(contentItem);
                } else {
                    contentItem.attr("data-type", "file");
                    $("<img src='_images/file.png'/>").prependTo(contentItem);
                }
                contentDiv.append(contentItem);
                contentItem.click(onContentItemClick);
            }
        };

        /**
         * Handles click on item in content panel
         * */
        var onContentItemClick = function () {
            var elementId = $(this).attr("data-id");
            showFolderOrFileContentById(elementId);
        };

        /**
         * Displays file content in content panel
         * @param fileItem - file object from file system
         * */
        var openFile = function (fileItem) {
            var displayFileTemplate = `<div class="fileDisplay">
                                    <textarea class="editFile" value="" autofocus/>
                                    <div class="editFileButtonsLayer">
                                        <button class="cancel">Cancel</button>
                                        <button class="save">Save</button>
                                    </div>
                                </div>`;
            var displayFile = $(displayFileTemplate);
            var contentDiv = clearAndReturnContentDiv();
            contentDiv.append(displayFile);
            var displayFileTextArea = displayFile.find(".editFile");
            displayFile.find(".cancel")
                .attr("data-id", fileItem.getId())
                .click(closeDisplayFile);
            displayFile.find(".save")
                .attr("data-id", fileItem.getId())
                .click(function () {
                    saveChangesInFile.call(this);
                    closeDisplayFile.call(this);
                });
            var content = fileItem.getContent();
            if (content != undefined && content != null) {
                displayFileTextArea.text(content);
            }
        };

        /**
         * Handles save button click in file editing. Saves changes to file content.
         */
        var saveChangesInFile = function () {
            var fileId = parseInt($(this).attr("data-id"));
            var editedText = $("textarea.editFile").val();
            var file = self.fileSystem.getItem(fileId);
            file.setContent(editedText);
        };

        /**
         * Handles cancel button click in file editing. Discards changes to file content.
         */
        var closeDisplayFile = function () {
            var previousId = self.navigationHistory.getPrevious();
            if (previousId != undefined) {
                showFolderOrFileContentById(previousId);
            }
        };

        /**
         * Helper function that clears content panel and returns it's div item
         * @return {*|HTMLElement}
         */
        var clearAndReturnContentDiv = function () {
            var contentDiv = $("#content");
            contentDiv.empty();
            return contentDiv;
        };

        /**
         * Shows context menu according to event
         * @param event - mouse click event
         */
        var showContextMenu = function (event) {
            var menuData = getMenuDataForTarget($(event.currentTarget));
            var menu = $(".menu");
            menu.empty();
            for (var i = 0; i < menuData.menuEntries.length; i++) {
                menu.append(menuData.menuEntries[i]);
            }
            menu.css('left', event.pageX + 'px');
            menu.css('top', event.pageY + 'px');
            menu.attr("data-id", menuData.id).show();
        };

        /**
         * Sets items of the context menu according to its target.
         * @param target - the item on which was the right click.
         * @return object with menu entries and the id of the item in the file system
         * to which the changes will be applied.
         * */
        var getMenuDataForTarget = function (target) {
            var newFolder = $("<div class='menuItem'>New folder</div>").click(createNewFolder);
            var newFile = $("<div class='menuItem'>New file</div>").click(createNewFile);
            var deleteFileOrFolder = $("<div class='menuItem'>Delete</div>").click(deleteElement);
            var rename = $("<div class='menuItem'>Rename</div>").click(renameElement);
            var menuEntries = [];
            var id;
            if (target.is("li")) {
                id = target.children('a').attr('data-id');
                menuEntries = [newFolder, rename];
                if (id > 0) {
                    menuEntries.push(deleteFileOrFolder);
                }
            } else if (target.is("#content")) {
                // no right click in content when file is opened
                if ($(".fileDisplay").length !== 0) {
                    return;
                }
                id = self.navigationHistory.getCurrent();
                menuEntries = [newFolder, newFile];
            } else if (target.is(".contentItem")) {
                id = target.attr('data-id');
                var type = $(target).attr("data-type");
                if (type == "folder") {
                    menuEntries = [newFolder, newFile];
                }
                menuEntries.push(deleteFileOrFolder);
                menuEntries.push(rename);
            }

            return {
                menuEntries: menuEntries,
                id: id
            }
        };

        /**
         * Hides context menu
         */
        var hideContextMenu = function () {
            $('.menu').hide();
        };

        /**
         * Handles rename item context menu entry
         */
        var renameElement = function () {
            var id = parseInt($(this).parent().attr("data-id"));
            var item = self.fileSystem.getItem(id);
            var editedItemName = prompt("Please enter the  new name", item.getName());
            if (editedItemName == undefined) {
                return;
            }
            try {
                self.fileSystem.renameItem(id, editedItemName);
            } catch (err) {
                alert(err.message);
            }
            updateUI();
        };

        /**
         * Handles delete item context menu entry
         */
        var deleteElement = function () {
            var id = parseInt($(this).parent().attr("data-id"));
            if (id == 0) {
                alert("Root can not be deleted.");
                return;
            }
            var userConfirmed = confirm("Are you sure?");
            if (userConfirmed) {
                self.fileSystem.deleteItem(id);
                if (id == self.navigationHistory.getCurrent()) {
                    self.navigationHistory.goBack();
                }
                updateUI();
            }
        };

        /**
         * Handles create new file context menu entry
         */
        var createNewFile = function () {
            var id = parseInt($(this).parent().attr("data-id"));
            self.fileSystem.addFile("", id, "");
            updateUI();
        };

        /**
         * Handles create new folder context menu entry
         */
        var createNewFolder = function () {
            var id = parseInt($(this).parent().attr("data-id"));
            self.fileSystem.addFolder("", id);
            updateUI();
        };

        /**
         * Returns object that represents current expand/collapse state of explorer tree
         */
        var getExplorerState = function () {
            var treeEntries = $("li.folder");
            if(treeEntries.length == 0){
                return undefined;
            }
            var collapsed = $(".collapsed");
            var ids = {};
            collapsed.each(function () {
                var id = $(this).children('a').attr("data-id");
                ids[id] = true;
            });
            return ids;
        };

        /**
         * Updates current path in UI
         * @param itemId - Number
         */
        var displayPath = function (itemId) {
            var path = self.fileSystem.getPath(itemId);
            var inputPath = $("#path");
            inputPath.val(path);
        };

        /**
         * Shows item in content panel, optionally adds it to history and updates path
         * @param itemId - item id
         * @param skipHistory - if true, does not add item to history.
         * @return boolean - returns true on success, false otherwise.
         */
        function showFolderOrFileContentById(itemId, skipHistory) {
            var itemIdAsNumber = parseInt(itemId);
            if (!skipHistory && self.navigationHistory.getCurrent() == itemId) {
                return true;
            }
            var item = self.fileSystem.getItem(itemIdAsNumber);
            if (item == null) {
                return false;
            }
            if (item.getType() === Item.TYPE.FOLDER) {
                displayFolderContent(item);
            } else {
                openFile(item);
            }
            if (!skipHistory) {
                self.navigationHistory.addToHistory(itemIdAsNumber);
            }
            displayPath(itemIdAsNumber);
            return true;
        }


    }



// constructor(fileSystem, history)

    return UI;
})(jQuery);