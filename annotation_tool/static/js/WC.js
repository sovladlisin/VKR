class WC {

    constructor(container, url) {
        this.container = container;
        console.log('creating', container);
        this.url = url;
        this.windows = {};
        this.assign();


    }

    assign() {
        var self = this;
        $("body").on("click", ".add-dep", function () {
            console.log('addingDEP');
            var name = $(this).prev().val();
            var role = $(this).data('placeholder-role');
            var window_pk = $(this).data('window-pk');
            var window = self.windows[window_pk];
            window.addPlaceholder(name, role);
        });
        $("body").on("mousedown", ".window-header", function () {
            console.log('deleting');
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
            self.createWindow($(item).attr('data-pk'), $(item).attr('data-model'));
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
            window.close();
        });
        $("body").on("click", ".save-window", function () {
            console.log('saving');
            var window = self.findWindow(this);
            window.save();
        });
        $('.item').draggable({
            cursor: 'move',
            helper: "clone"
        });
    }

    findWindow(node) {
        var win_id = $(node).closest('.window').attr('id');
        return this.windows[win_id];
    }

    createWindow(pk, model) {
        var check = this.windows["window" + pk + model];
        if (check === undefined) {
            var self = this;
            var container = this.container;
            var data = {
                pk: pk,
                model_name: model
            };
            $.ajax({
                type: "GET",
                url: self.url,
                async: false,
                data: data,
                success: function (result) {
                    if (result.template.length > 10) {

                        let new_window = new Window(result.template, 'window' + pk + model, self);
                        console.log('sending to', container);
                        new_window.draw(container);
                        self.windows["window" + pk + model] = new_window;
                    }
                }, dataType: "json",
                error: function (response, error) {
                    alert(error);
                }
            });

        }
        else {
            console.log('Window is opened');
        }
    }

    assignCallableToCreateWindow(nodes) {
        var self = this;
        $(nodes).click(function (event) {
            event.preventDefault();
            self.createWindow($(this).attr('data-pk'), $(this).attr('data-model'));
        })

    };


    closeWindow(window) {
        this.windows[window.id] = undefined;
        var current_window = document.getElementById(window.id);
        console.log('deleting window', window);
        $(current_window).remove()

    }




}
