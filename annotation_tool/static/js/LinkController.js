class LinkController {

    constructor(links, pk, window_container, template) {
        this.links = links;
        this.pk = pk;
        this.WC = new WindowController(window_container);
        this.template = template;
        this.saved_item = {};
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
                self.generateRandomIds(windows.querySelectorAll(".item"));
                self.assignSlideToItems(windows.querySelectorAll(".item"));
                self.assignClickToItems(windows.querySelectorAll("[data-callable='1']"));
            }
        });


        $(".close-window").click(function (event) {
            event.preventDefault();
            $(this).closest('.window').remove();
        });

        $(".item-restore").click(function (event) {
            event.preventDefault();
            if (Object.keys(self.saved_item).length) {
                console.log('restoring');
                var window = $(this).closest('.window');
                var dep_name = self.saved_item['dep-name'];
                var dep_role = self.saved_item['dep-role'];
                var placeholder = $(window).find(".placeholder[data-dep-name$='" + dep_name + "'][data-dep-role$='" + dep_role + "']")
                $(placeholder).append(self.saved_item['item']);
                self.assignSlideToItems([self.saved_item['item']]);
                self.saved_item = {};
                $(this).css('opacity', '0');
            }
        });
    }


    generateRandomIds(nodes) {
        $(nodes).each(function (i) {
            $(this).attr('id', guidGenerator())
        })
    }

    assignSlideToItems(nodes) {
        var self = this;
        $(nodes).each(function (i) {
            var data = '<div class="item-info">';
            data += $(this).find('.item-info').html();
            data += '</div>'
            $(this).tipso({
                background: "white",
                width: 450,
                color: "black",
                position: 'top',
                useTitle: false,
                tooltipHover: true,
                content: function () {
                    return data;
                }
                ,
                onShow: function () {
                    self.assignClickToItems($("[data-callable='1']"));
                }
            });
            var delete_buttons = $(this).find('.item-delete');
            $(delete_buttons).click(function (event) {
                event.preventDefault();
                if ($(this).closest('.item').attr('id') === undefined) {
                    console.log('Element is removed')
                }
                else {
                    console.log('deleting');
                    var nodeCopy = $(this).closest('.item');
                    var window = $(this).closest('.window');
                    nodeCopy.id = guidGenerator();
                    self.saved_item['item'] = nodeCopy;
                    self.saved_item['dep-name'] = $(this).closest('.placeholder').attr('data-dep-name');
                    self.saved_item['dep-role'] = $(this).closest('.placeholder').attr('data-dep-role');
                    $(window).find('.item-restore').css('opacity', '1');
                    $(this).closest('.item').remove();
                    console.log(self.saved_item)
                }

            });
            // $(this).tipso('show');
        })


    }
}
