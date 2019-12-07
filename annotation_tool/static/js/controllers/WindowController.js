class WindowController {
    constructor($container, $hidden_container) {
        this.$container = $container;
        this.$hidden_container = $hidden_container;

        this.opened_windows = {};
        this.hidden_windows = {};
    }

    getWindowByInnerNode($node) {
        return this.opened_windows[$($node).closest('.window').attr('id')];
    }

    getWindowById(id) {
        if (this.opened_windows[id] != undefined) {
            return this.opened_windows[id]
        }
        if (this.hidden_windows[id] != undefined) {
            return this.hidden_windows[id]
        }
        return null;
    }

    // Arg - window class object
    hideWindow(window) {
        window.hide();
        this.hidden_windows[window.id] = window;
        this.opened_windows[window.id] = undefined;

        var hidden_window = $('<div class="hidden-window" id="' + window.id + '"><p>' + window.title + '</p></div>');
        $(this.$hidden_container).append(hidden_window);
    }

    // Arg - window class object
    showWindow(window) {
        if (window != undefined) {
            window.show();
            this.hidden_windows[window.id] = undefined;
            this.opened_windows[window.id] = window;
            $('#' + window.id + '.hidden-window').remove();
        }
    }

    // Arg - window class object
    closeWindow(window) {
        if (window != undefined) {
            if (this.opened_windows[window.id] != undefined) {
                window.close();
                this.opened_windows[window.id] = undefined;
            }
            if (this.hidden_windows[window.id] != undefined) {
                window.close();
                $('#' + window.id + '.hidden-window').remove();
                this.hidden_windows[window.id] = undefined;
            }
        }
    }

    hideAllWindows() {
        var self = this;
        for (var id in this.opened_windows) {
            self.hideWindow(self.opened_windows[id])
        }
    }
    closeAllWindows() {
        var self = this;
        for (var id in this.opened_windows) {
            self.closeWindow(self.opened_windows[id])
        }
        for (var id in this.hidden_windows) {
            self.closeWindow(self.hidden_windows[id])
        }
    }

    createWindow(id, title, body) {
        if (this.getWindowById(id) === null) {
            var new_window = new Window(id, title, body);
            this.opened_windows[id] = new_window;
            new_window.draw(this.$container);
            return new_window
        }
        console.log('Window is already opened');
    }
}