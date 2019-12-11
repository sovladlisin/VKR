class WC {

    constructor(container, hidden_container, info_window_url, search_window_url, search_url, tree_url, create_window_url, fields_url, create_any_url) {
        this.container = container;
        this.hidden_container = hidden_container;
        console.log('creating', container);
        this.info_window_url = info_window_url;
        this.search_window_url = search_window_url;
        this.search_url = search_url;
        this.tree_url = tree_url;
        this.create_window_url = create_window_url;
        this.fields_url = fields_url;
        this.create_any_url = create_any_url
        this.windows = {};
        this.hidden_windows = {};
        this.assign();

        this.search_counter = 0;
        this.is_tree_exists = false;
        this.is_create_exists = false;


    }

    assign() {
        var self = this;
        $("body").on("click", "#confirm-search", function () {
            console.log('searchWindow');
            var window = self.findWindow(this);
            window.search();
        });
        $("body").on("click", "#confirm-select", function () {
            console.log('confirm-select');
            var window = self.findWindow(this);
            window.confirmSelect();
        });
        $("body").on("click", "#save-object", function () {
            console.log('save-select');
            var window = self.findWindow(this);
            window.saveSelect();
        });
        $("body").on("click", "#create-object", function () {
            console.log('creatingObject');
            self.createWindow(null, null, self.create_window_url);
        });
        $("body").on("click", "#open-tree", function () {
            console.log('treeWindow');
            self.createWindow(null, null, self.tree_url);
        });
        $("body").on("click", "#open-search", function () {
            console.log('searchWindow');
            self.createWindow(null, null, self.search_window_url);
        });
        $("body").on("click", "#hide-all-windows", function () {
            console.log('hidingAll');
            self.hideAllWindows();
        });
        $("body").on("click", "#close-all-windows", function () {
            console.log('hidingAll');
            self.closeAllWindows();
        });
        $("body").on("click", ".hide-window", function () {
            console.log('hiding');
            var window = self.findWindow(this);
            self.hideWindow(window.id);
        });
        $("body").on("click", ".hidden-window", function () {
            console.log('showing');
            self.showWindow($(this).attr('id'));
        });
        $("body").on("click", ".add-dep", function () {
            console.log('addingDEP');
            var name = $(this).prev().val();
            var role = $(this).data('placeholder-role');
            var window_pk = $(this).data('window-pk');
            var window = self.windows[window_pk];
            window.addPlaceholder(name, role);
        });
        $("body").on("mousedown", ".window-header", function () {
            $('.window').css("z-index", "1");
            $(this).closest('.window').css("z-index", "99");
        });
        $("body").on("click", ".item-delete", function () {
            console.log('deleting');
            var item = $(this).parent();
            var window = self.findWindow(item);
            window.deleteItem(item);
        });
        $("body").on("click", ".item-restore", function () {
            console.log('restoring');
            var window = self.findWindow(this);
            window.restoreItem();
        });
        $("body").on("click", ".item-open", function () {
            console.log('opening');
            var item = $(this).parent();
            var id = $(item).attr('data-pk') + $(item).attr('data-model');
            if (self.hidden_windows['window' + id] === undefined) {
                self.createWindow($(item).attr('data-pk'), $(item).attr('data-model'), self.info_window_url);
            }
            else {
                self.showWindow('window' + id);
            }
        })
        $("body").on("mouseenter", ".item", function () {
            var info = $(this).find('.item-info').clone();
            if ($(info).length > 0) {
                var side_info = $('#side-item-info');
                $(side_info).empty();
                document.getElementById("side-item-info").style.width = "350px";
                $(side_info).css('opacity', '1');
                $(info).appendTo($(side_info));
            }
        })
        $("body").on("mouseleave", ".item", function () {
            var side_info = $('#side-item-info');
            $(side_info).empty();
            $(side_info).css('opacity', '0');
            document.getElementById("side-item-info").style.width = "0px";
        })

        $("body").on("click", ".close-window", function () {
            console.log('closing');
            var window = self.findWindow(this);
            self.closeWindow(window.id);
        });
        $("body").on("click", ".save-window", function () {
            console.log('saving');
            var window = self.findWindow(this);
            window.save();
        });
        $('.item').draggable({
            cursor: 'move',
            helper: "clone",
            appendTo: "body",
            zIndex: 1000,
            connectToSortable: ".placeholder",
            revert: "true",
            start: function (event, ui) {
                $(ui.helper).find('div').animate({
                    opacity: "0"
                }, 200, function () {
                    // Animation complete.
                });
            },
            stop: function (event, ui) {
                $(ui.helper).find('div').animate({
                    opacity: "1"
                }, 200, function () {
                    // Animation complete.
                });
            }
        });
    }

    findWindow(node) {
        var win_id = $(node).closest('.window').attr('id');
        return this.windows[win_id];
    }
    hideWindow(id) {
        if (this.windows[id] != undefined) {
            var window = this.windows[id];
            window.hide();
            this.hidden_windows[id] = window;
            this.windows[id] = undefined;
            $(this.hidden_container).append('<div class="hidden-window" id="' + id + '"><p>' + window.title + '</p></div>');
        }
    }
    showWindow(id) {
        var window = this.hidden_windows[id];
        this.hidden_windows[id] = undefined;
        this.windows[id] = window;
        var hidden_helper = $(this.hidden_container).find('#' + id);
        $(hidden_helper).remove();
        window.show();
    }
    closeWindow(id) {
        if (this.windows[id] != undefined) {
            this.hideWindow(id);
        }
        if (this.hidden_windows[id] != undefined) {
            if (id === 'classTree') { this.is_tree_exists = false }
            if (id === 'createObject') { this.is_create_exists = false }
            $(this.hidden_windows[id].node).remove();
            this.hidden_windows[id] = undefined;
            $(this.hidden_container).find('#' + id).remove();
        }
    }
    hideAllWindows() {
        for (var key in this.windows) {
            this.hideWindow(key);
        }
    }
    closeAllWindows() {
        for (var key in this.windows) {
            this.hideWindow(key);
            this.closeWindow(key);
        }
        this.windows = {};
        this.hidden_windows = {};
    }


    // if isInfo false -> pk=phrase, model=model
    createWindow(pk, model, url) {
        var self = this;
        if (url === self.info_window_url) {
            var check = this.windows["window" + pk + model];
            if (check === undefined) {

                var data = {
                    pk: pk,
                    model_name: model
                };
                var template = self.ajax(url, data);
                let new_window = new Window(pk + model, template, 'window' + pk + model, self, 'True');
                console.log('sending to', self.container);
                new_window.draw(self.container);
                $(new_window.node).data('pk', pk);
                $(new_window.node).data('model', model);
                self.windows["window" + pk + model] = new_window;
            }
            else {
                console.log('Window is opened');
            }
        }
        if (url === self.search_window_url) {
            var data = {};
            self.search_counter++;
            var template = self.ajax(url, data);
            let new_window = new Window('Окно поиска ' + self.search_counter, template, 'search' + self.search_counter, self, 'False');
            new_window.draw(self.container);
            $(new_window.node).data('search', 'True');
            self.windows["search" + self.search_counter] = new_window;
        }
        if (url === self.tree_url) {
            if (self.is_tree_exists != true) {
                var data = {};
                self.is_tree_exists = true;
                var template = self.ajax(url, data);
                let new_window = new Window('Дерево классов', template, 'classTree', self, 'False');
                new_window.draw(self.container);
                $(new_window.node).data('classTree', 'True');
                self.windows["classTree"] = new_window;
            }
        }
        if (url === self.create_window_url) {
            if (self.is_create_exists != true) {
                var data = {};
                self.is_create_exists = true;
                var template = self.ajax(url, data);
                let new_window = new Window('Создание', template, 'createObject', self, 'False');
                new_window.draw(self.container);
                $(new_window.node).data('createObject', 'True');
                self.windows["createObject"] = new_window;
            }
        }
    }

    ajax(url, data) {
        var template = null;
        $.ajax({
            type: "GET",
            url: url,
            async: false,
            data: data,
            success: function (result) {
                if (result.template.length > 10) {
                    template = result.template;
                    console.log(template);
                }
            }, dataType: "json",
            error: function (response, error) {
                console.log('BLYAT');
                alert(error);
            }
        });
        return template;
    }
}
