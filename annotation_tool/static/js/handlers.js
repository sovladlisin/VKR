function itemHandlers(WW) {
    $("body").on("click", ".item-open", function () {
        var $item = $(this).parent();
        if (WW.buildWindowFromUrl(WW.info_window_url, $($item).find('p:first').text(), $($item).data('pk'), $($item).data('model')) === null) {
            WW.WC.showWindow(WW.WC.getWindowById('window' + $($item).data('model') + $($item).data('pk')))
        }
    });
    $("body").on("click", ".item-delete", function () {
        WW.deleteItem(this);
    });
    $("body").on("click", ".item-restore", function () {
        WW.restoreItem(this);
    });
    $("body").on("mouseenter", ".item", function () {
        WW.showItemInfo(this);
    })
    $("body").on("mouseleave", ".item", function () {
        WW.hideItemInfo(this);
    })
}
function windowHandlers(WW) {
    $("body").on("click", ".hidden-window", function () {
        WW.WC.showWindow(WW.WC.hidden_windows[$(this).attr('id')]);
    });
    $("body").on("click", ".hide-window", function () {
        WW.WC.hideWindow(WW.WC.getWindowByInnerNode(this));
    });
    $("body").on("click", "#hide-all-windows", function () {
        WW.WC.hideAllWindows();
    });
    $("body").on("click", "#close-all-windows", function () {
        WW.WC.closeAllWindows();
    });
    $("body").on("click", "#confirm-search", function () {
        WW.search(this);
    });
    $("body").on("click", ".add-dep", function () {
        WW.addPlaceholder(this);
    });
    $("body").on("click", ".close-window", function () {
        WW.WC.closeWindow(WW.WC.getWindowByInnerNode(this));
    });
    $("body").on("click", ".save-window", function () {
        WW.saveWindow(this);
    });
    $('body').on('submit', ".save-entity-form", function () {
    });
    $('body').on('click', "#example_tree div", function () {
        WW.tree(this);
    });

}
function buttonHandlers(WW) {
    $("body").on("click", "#open-tree", function () {
        WW.buildWindowFromUrl(WW.tree_window_url, 'Иерархия классов');
    });
    $("body").on("click", "#open-search", function () {
        WW.buildWindowFromUrl(WW.search_window_url);
    });
}