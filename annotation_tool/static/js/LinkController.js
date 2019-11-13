class LinkController {

    constructor(links, pk, window_container, template) {
        this.links = links;
        this.pk = pk;
        this.WC = new WindowController(window_container);
        this.template = template;
    }


    // downloadLinkedItems
    // Function - get 2d array from view "getLineDependencies" containing all connections between lines in current block
    // Starts only once during preload of the page
    downloadLinkedItems() {
        var self = this;
        var data = {
            pk: this.pk,
        };
        $.ajax({
            type: "GET",
            url: "/annotation_tool/getLineDependencies",
            async: false,
            data: data,
            success: function (response) {
                self.links = response.links;
            },

            error: function (response, error) {
                alert(error);
            }
        });

    }


    // getLineLinkedItems
    // Function - get array of masters and slaves of line on page
    // item = div "id" of line on page
    getLineLinkedItems(item) {
        let pk = parseInt($(item).attr('data-pk'));
        let masters = [];
        let slaves = [];
        var result = [];
        this.links.forEach(function (el) {
            if (el.first_item__object_id === pk) {
                slaves.push([$("#" + el.second_item__object_id), el.relation__name]);
            }
            if (el.second_item__object_id === pk)
                masters.push([$("#" + el.first_item__object_id), el.relation__name])
        });
        result[0] = masters;
        result[1] = slaves;
        return result
    }






    ajaxTemplate(data, url) {
        var self = this;
        var res = null;
        $.ajax({
            type: "GET",
            url: url,
            async: false,
            data: data,
            success: function (result) {
                if (result.template.length > 10) {
                    self.template = result.template;
                }
            }, dataType: "json",
            error: function (response, error) {
                alert(error);
            }
        });
    }

    assignClickToItems(nodes) {
        var self = this;
        $(nodes).click(function (event) {
            event.preventDefault();
            var pk = $(this).attr("data-pk");
            var class_name = $(this).attr("data-model");
            if ($("#window" + pk + class_name).length) {
                console.log("Window is opened")
            }
            else {
                var data = {
                    pk: pk,
                    model_name: class_name
                };
                console.log("Assigning");
                self.ajaxTemplate(data, "/annotation_tool/info");
                self.WC.createWindow(self.template, class_name, pk);
                self.template = null;

                // self.generateItemsFromIds(document.getElementById("item-info"+pk+class_name));
                var windows = document.querySelector("#window" + pk + class_name);
                self.assignClickToItems(windows.querySelectorAll("[data-callable='1']"));
                self.assignSlideToItems(windows.querySelectorAll(".item-class"));
            }
        });
        $('.createLink').click(function (event) {
            event.preventDefault()

            var block_pk = self.pk;
            var master_pk = $(this).attr('data-master-pk');
            var master_model_name = $(this).attr('data-master-model-name');
            var slave_pk = $(this).attr('data-slave-pk');
            var slave_model_name = $(this).attr('data-slave-model-name');
            var relation_pk = $(this).attr('data-relation-pk')
            var data = {
                block_pk: block_pk,
                master_pk: master_pk,
                master_model_name: master_model_name,
                slave_pk: slave_pk,
                slave_model_name: slave_model_name,
                relation_pk: relation_pk,
            };
            $.ajax({
                type: "POST",
                url: "/annotation_tool/createLink",
                data: data,
                async: false,
                success: function (data) {
                    var w = window.open('Создание связи между объектами');
                    w.document.open();
                    w.document.write(data);
                    w.document.close();
                }
            });
        });


        $(".close-window").click(function (event) {
            event.preventDefault();
            $(this).closest('.window').remove();
        });
    }

    generateItemsFromIds(nodes) {
        var self = this;
        var elements = $(nodes).children('.item');
        elements.each(function (i) {
            var pk = $(this).attr('data-pk');
            var model = $(this).attr('data-model');
            $(this).attr('data-callable', '0');
            var data = {
                pk: pk,
                model_name: model
            };
            self.ajaxTemplate(data, "/annotation_tool/showcase");
            $(this).append(self.template);
            self.template = null;
        })
    }

    assignSlideToItems(nodes) {
        $(nodes).click(function () {
            if ($(this).next().is(':visible')) {
                $(this).find('p').css("background-color", "white");
                $(this).find('p').css("color", "rgb(36,51,60)");
                $(this).next().slideUp();
            }
            else {
                $(this).next().slideDown();
                $(this).find('p').css("background-color", "rgb(36,51,60)");
                $(this).find('p').css("color", "white");
            }
        });
    }
}
