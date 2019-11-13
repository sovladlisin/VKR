$(document).ready(function () {
    assignSlideToItems($('.item-class'));
    var main_slave = null;
    var main_master = null;



    $('#addLink').click(function (event) {
        event.preventDefault();
        var master_pk = $('#master').find('.item-class').attr('data-pk');
        var master_model = $('#master').find('.item-class').attr('data-model');

        var slave_pk = $('#slave').find('.item-class').attr('data-pk');
        var slave_model = $('#slave').find('.item-class').attr('data-model');

        var relation_pk = $('#relation-select').find(":selected").val();

        var data = {
            master_pk: master_pk,
            master_model_name: master_model,
            slave_pk: slave_pk,
            slave_model_name: slave_model,
            relation_pk: relation_pk,
        };

        $.ajax({
            type: "POST",
            url: "/annotation_tool/addLink",
            data: data,
            async: false,
            success: function () {
                alert('Связь создана!');
                console.log('Success!');
            },
            error: function (jqXhr, textStatus, errorThrown) {
                console.log('Связь НЕ создана!');
            }
        });

    });

    $('.line-choice').click(function (event) {
        event.preventDefault();
        var pk = $(this).attr('data-pk');
        var role = $(this).attr('data-role');
        var model = 'Line';
        var data = {
            pk: pk,
            model_name: model
        };

        $.ajax({
            type: "GET",
            url: "/annotation_tool/showcase_test",
            async: false,
            data: data,
            success: function (result) {
                if (result.template.length > 10) {
                    if (role === "master") {
                        $("#master").empty();
                        $("#master").append(result.template)
                        assignSlideToItems($('.item-class'));
                    }
                    if (role === "slave") {
                        $("#slave").empty();
                        $("#slave").append(result.template)
                        assignSlideToItems($('.item-class'));
                    }
                }
            }, dataType: "json",
            error: function (response, error) {
                alert(error);
            }
        });


    });

});
function assignSlideToItems(nodes) {
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

