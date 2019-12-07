class WindowWorkflow {

    constructor(WindowController, info_window_url, search_window_url, tree_window_url,
        search_url, save_window_data_url) {
        this.WC = WindowController;
        this.info_window_url = info_window_url;
        this.search_window_url = search_window_url;
        this.tree_window_url = tree_window_url;
        this.search_url = search_url;
        this.save_window_data_url = save_window_data_url;

        this.assignHandlers();
        this.saved_items = {};
    }


    assignHandlers() {
        itemHandlers(this);
        windowHandlers(this);
        buttonHandlers(this);
    }

    search($node) {
        var search_window = this.WC.getWindowByInnerNode($node);
        var phrase = $(search_window.$node).find('input:first').val();

        var data = { phrase: phrase, };
        var template_result = this.ajax(this.search_url, data);
        $(search_window.$node).find('.placeholder').empty().append(template_result.template);

        this.makeItemsDraggable($(search_window.$node).find('.item'));
    }

    addPlaceholder($node) {
        var name = $($node).prev().val();
        var role = $($node).data('placeholder-role');
        var window = this.WC.getWindowById($($node).data('window-pk'));
        var dep_container = $(window.$node).find(".title[data-role='" + role + "']:first").next();

        var html = '';
        html += '<div class="item-dep"> <p>' + name + ':</p>'
        html += '<div class ="placeholder"  data-dep-name="' + name + '" data-dep-role="' + role + '">'
        $(dep_container).append(html);

        var placeholder = $(window.$node).find(".placeholder[data-dep-name='" + name + "'][data-dep-role='" + role + "']");
        this.makePlaceholdersDroppable(placeholder);
    }

    addTipsoToTitles(window) {
        var titles = $(window.$node).find('.title');
        $(titles).each(function () {
            var title = this;
            $(this).tipso({
                background: '#232d41',
                speed: 1,
                width: "350px",
                animationIn: 'fadeInDown',
                animationOut: 'fadeOutUp',
                position: 'top',
                useTitle: false,
                tooltipHover: true,
                content: function () {
                    return '<div class="dep-input"><input type="text" size="40"><div class="add-dep" data-placeholder-role="' + $(title).data('role') + '" data-window-pk="' + window.id + '"><p><i class="fas fa-plus"></i></p></div></div>';
                }
            });
        })
    }

    buildWindowFromUrl(url, title, pk = null, model = null) {
        if (url === this.info_window_url) {
            var id = 'window' + model + pk;
            if (this.WC.getWindowById(id) === null) {
                var data = {
                    pk: pk,
                    model_name: model
                };
                var body = this.ajax(url, data);
                var new_window = this.sendWindowToWC(id, title, body.template);
                $(new_window.$node).data('pk', pk);
                $(new_window.$node).data('model', model);
                this.addTipsoToTitles(new_window);
                var form_id = guidGenerator();
                $(new_window.$node).find('form:first').attr('id', form_id);
                $(new_window.$node).find('button.save-window:first').attr('type', 'submit');
                $(new_window.$node).find('button.save-window:first').attr('form', form_id);
                return new_window
            }
            return null
        }
        if (url === this.search_window_url) {
            var id = guidGenerator();
            var data = {};
            var body = this.ajax(url, data);
            var new_window = this.sendWindowToWC(id, title, body.template);
            return new_window
        }
        if (url === this.tree_window_url) {
            var id = guidGenerator();
            var data = {};
            var body = this.ajax(url, data);
            var new_window = this.sendWindowToWC(id, title, body.template);
            return new_window
        }
        return null;
    }

    sendWindowToWC(id, title, body) {
        var new_window = this.WC.createWindow(id, title, body);
        this.makeItemsDraggable($(new_window.$node).find('.item'));
        this.makePlaceholdersDroppable($(new_window.$node).find('.placeholder'));
        $(new_window.$node).append('<div class="window-notification"><p><i class="far fa-check-circle"></i></p></div>')
        return new_window
    }

    ajax(url, data, type = "GET") {
        var answer = null;
        $.ajax({
            type: type,
            url: url,
            async: false,
            data: data,
            success: function (result) {
                answer = result;
            }, dataType: "json",
            error: function (response, error) {
                console.log(response, error);
            }
        });
        return answer;
    }

    makeItemsDraggable($nodes) {
        $($nodes).draggable({
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
        $($nodes).each(function (i) {
            $(this).attr('id', guidGenerator());
        });
    }

    makePlaceholdersDroppable($nodes) {
        var self = this;
        $($nodes).sortable({
            helper: "clone",
            revert: true,
            update: function (event, ui) {
                var item = ui.item;
                $(item).attr('style', '');
                $(item).find('div').attr('style', '');
                self.registerItem(this, item);
            }
        });
        //     $(nodes).sortable({ revert: true });
        $($nodes).disableSelection();
    }

    deleteItem($node) {
        var $item = $($node).parent();
        var window = this.WC.getWindowByInnerNode($item);

        var saved_item = {};
        saved_item['item'] = $item;
        saved_item['dep-name'] = $($item).closest('.placeholder').data('dep-name');
        saved_item['dep-role'] = $($item).closest('.placeholder').data('dep-role');

        this.saved_items[window.id] = saved_item;

        $(window.$node).find('.item-restore').css('opacity', '1');
        $($item).remove();
    }

    restoreItem($node) {
        var window = this.WC.getWindowByInnerNode($node);
        var dep_name = this.saved_items[window.id]['dep-name'];
        var dep_role = this.saved_items[window.id]['dep-role'];
        var $placeholder = $(window.$node).find(".placeholder[data-dep-name='" + dep_name + "'][data-dep-role='" + dep_role + "']");
        $($placeholder).append(this.saved_items[window.id]['item']);
        this.registerItem($placeholder, this.saved_items[window.id]['item']);
        this.saved_items[window.id] = {};
        $(window.$node).find('.item-restore').css('opacity', '0');
    }

    registerItem($placeholder, $item) {
        var item_pk = $($item).data('pk');
        var item_model = $($item).data('model');
        var window = this.WC.getWindowByInnerNode($placeholder);

        if ($(window.$node).data('model') === item_model &
            $(window.$node).data('pk') === item_pk) {
            $($item).remove();
        }
        else if ($($placeholder).find("div[data-pk='" + item_pk + "'][data-model='" + item_model + "']").length > 1) {
            $($item).remove();
        }
        else { this.makeItemsDraggable([$item]) }
    }

    showItemInfo($node) {
        var $info = $($node).find('.item-info').clone();
        if ($($info).length > 0) {
            var side_info = $('#side-item-info');
            document.getElementById("side-item-info").style.width = "350px";
            $(side_info).css('opacity', '1');
            $(side_info).empty().append($info);
        }
    }

    hideItemInfo($node) {
        var $side_info = $('#side-item-info');
        $($side_info).empty();
        $($side_info).css('opacity', '0');
        document.getElementById("side-item-info").style.width = "0px";
    }

    saveWindow($node) {
        var window = this.WC.getWindowByInnerNode($node);
        var self = this;
        var slaves = {};
        var masters = {};
        var model = $(window.$node).data('model');
        var pk = $(window.$node).data('pk');
        var placeholders = $(window.$node).find('.placeholder');

        $(placeholders).each(function () {
            var dep_name = $(this).data('dep-name');
            var dep_role = $(this).data('dep-role');

            var result = [];
            var items = $(this).find('.item');
            $(items).each(function () {
                var model = $(this).data('model');
                var pk = $(this).data('pk');
                result.push([model, pk]);
            })
            if (dep_role === 'slaves') { slaves[dep_name] = result; }
            if (dep_role === 'masters') { masters[dep_name] = result; }
        })
        var data = {
            slaves: JSON.stringify(slaves),
            masters: JSON.stringify(masters),
            model: model,
            pk: pk,
        };

        var result = this.ajax(this.save_window_data_url, data, 'POST');
        console.log(result);
        var $notification = $(window.$node).find('.window-notification:first');
        $($notification).css('display', 'block');
        setTimeout(function () {
            $($notification).css('display', 'none');
        }, 2000);
        $($notification).animate({
            opacity: 1,
        }, 1000, function () {
        });
        $($notification).animate({
            opacity: 0,
        }, 1000, function () {
        });
    }
}

function guidGenerator() {
    var S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}