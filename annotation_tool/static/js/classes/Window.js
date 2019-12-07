class Window {
    constructor(id, title, body) {
        this.id = id;
        this.title = title;
        this.body = body;
        this.$node = null;
    }

    draw($container) {
        $($container).append(this.body);
        this.$node = $($container).find('.window[data-new="True"]');
        $(this.$node).attr("data-new", 'False');
        $(this.$node).attr('id', this.id);
        $(this.$node).find('.window-header:first').find('p:first').text(this.title);
        $(this.$node).draggable({
            handle: ".window-header",
            start: function (event, ui) {
                $('.window').css('z-index', '999');
                $(ui.helper).css('z-index', '1000');
            }
        });
    }

    hide() {
        this.width = $(this.$node).width();
        this.height = $(this.$node).height();
        $(this.$node).animate({
            opacity: 0,
            height: "toggle",
            width: 'toggle',
        }, 500, function () {
        });
    }

    show() {
        var self = this;
        $(this.$node).css('display', 'block');
        $(this.$node).animate({
            opacity: 1,
            height: self.height,
            width: self.width,
        }, 500, function () {
        });
    }

    close() {
        $(this.$node).remove();
    }
}