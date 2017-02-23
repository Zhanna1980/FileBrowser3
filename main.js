(function () {
    'use strict';

    var fs = new FileSystem();
    var navigationHistory = new History();
    var ui = new UI(fs, navigationHistory);

})();