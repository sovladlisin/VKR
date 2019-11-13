$(document).ready(function() {

    pk = $("#pk").text();

    text =  $('#content').text();
    newText = textConvertation(text);
    $('#content').empty();
    $('#content').append(newText);

    rk = new RecordController(null, pk);
    rk.downloadRecords();
    console.log(rk.records);

    var records = [];
    var selected_record = new Record();
    var selected_element = new Element();
    selected_record.first_element =  new Element();;
    selected_record.second_element =  new Element();;


    mode = 1;
    first_link = null;
    second_link = null;
    first_link_type = null;
    second_link_type = null;
    connection_link = null;

    $('#content').mouseup(function() {
         var sel;


    // Check for existence of window.getSelection() and that it has a
    // modify() method. IE 9 has both selection APIs but no modify() method.
        if (window.getSelection && (sel = window.getSelection()).modify) {
            sel = window.getSelection();
            if (!sel.isCollapsed) {

                // Detect if selection is backwards
                var range = document.createRange();
                range.setStart(sel.anchorNode, sel.anchorOffset);
                range.setEnd(sel.focusNode, sel.focusOffset);
                var backwards = range.collapsed;
                range.detach();

                // modify() works on the focus of the selection
                var endNode = sel.focusNode, endOffset = sel.focusOffset;
                sel.collapse(sel.anchorNode, sel.anchorOffset);

                var direction = [];
                if (backwards) {
                    direction = ['backward', 'forward'];
                } else {
                    direction = ['forward', 'backward'];
                }

                sel.modify("move", direction[0], "character");
                sel.modify("move", direction[1], "word");
                sel.extend(endNode, endOffset);
                sel.modify("extend", direction[1], "character");
                sel.modify("extend", direction[0], "word");
            }
        } else if ( (sel = document.selection) && sel.type != "Control") {
            var textRange = sel.createRange();
            if (textRange.text) {
                textRange.expand("word");
                // Move the end back to not include the word's trailing space(s),
                // if necessary
                while (/\s$/.test(textRange.text)) {
                    textRange.moveEnd("character", -1);
                }
                textRange.select();
            }
        }

        nodes = getSelectedNodes();
        spans = [];
        nodes.forEach(function(element){
            if (typeof element === 'undefined') alert('xyi');
            else
                if (element.nodeName === 'SPAN')
                spans.push(element)
        });
        selected_element.nodes = spans;

        if (mode == 1){
            $('#first-link').empty();
            $('#first-link').append(selected_element.getPhrase());
            $( "#options-first" ).slideDown( "slow", function() {});
            $("#confirm-first").css("display","block");
        }
        if (mode == 2){
            $('#second-link').empty();
            $('#second-link').append(selected_element.getPhrase());
            $( "#options-second" ).slideDown( "slow", function() {});
            $("#confirm-second").css("display","block");
        }
    });

    function colorSpans() {
        selected_element.nodes.forEach(function(element){
            $("#"+element.id).css("text-decoration","underline");
        });
    }

    function getSelectedText() {
        if (window.getSelection) {
            return window.getSelection().toString();
        } else if (document.selection) {
            return document.selection.createRange().text;
        }
        return '';
    }

    $("#confirm-first").click(function() {
        mode = 2;
        $( "#options-first" ).slideUp( "slow", function() {});
        $("#confirm-first").css("display","none");
        selected_record.first_element.nodes = selected_element.nodes;
        selected_record.first_element.color = selected_element.color;
        colorSpans();
    });

    $("#confirm-second").click(function() {
        $( "#options-second" ).slideUp( "slow", function() {});
        $("#confirm-second").css("display","none");

        $( "#options-connection" ).slideDown( "slow", function() {});
        $("#confirm-connection").css("display","block");
        selected_record.second_element.nodes = selected_element.nodes;
        selected_record.second_element.color = selected_element.color;
    });

    $("#confirm-connection").click(function() {
        $( "#options-connection" ).slideUp( "slow", function() {});
        $("#confirm-connection").css("display","none");
        mode = 1;
        selected_record.color = 'red';

        rk.uploadRecord(selected_record);
        selected_record.clear();
        $('#first-link').empty();
        $('#first-link').append("Выберите фразу");
        $('#second-link').empty();
        $('#second-link').append("Выберите фразу");
        rk.downloadRecords();

    });

    $(".first-link-choice").click(function() {
        $(".first-link-choice").find('p').css("background-color","rgb(36,51,60)");
        $(".first-link-choice").find('p').css("color","rgb(255,255,255)");

        $(this).find('p').css("background-color","rgb(255,255,255)");
        $(this).find('p').css("color","rgb(36,51,60)");

        selected_record.first_element.type = $(this).find('p').text()
    });

    $(".second-link-choice").click(function() {
        $(".second-link-choice").find('p').css("background-color","rgb(36,51,60)");
        $(".second-link-choice").find('p').css("color","rgb(255,255,255)");

        $(this).find('p').css("background-color","rgb(255,255,255)");
        $(this).find('p').css("color","rgb(36,51,60)");

        selected_record.second_element.type = $(this).find('p').text()
    });

    $(".connection-link-choice").click(function() {
        $(".connection-link-choice").find('p').css("background-color","rgb(36,51,60)");
        $(".connection-link-choice").find('p').css("color","rgb(255,255,255)");

        $(this).find('p').css("background-color","rgb(255,255,255)");
        $(this).find('p').css("color","rgb(36,51,60)");

         selected_record.connection = $(this).find('p').text()


    });

    $( ".openbtn" ).click(function() {
        document.getElementById("mySidenav").style.width = "300px";
    });
     $( ".closebtn" ).click(function() {
        document.getElementById("mySidenav").style.width = "0";
    });

    $( "span" ).hover(
      function() {
         applyHighlight($(this).attr('id'));
      }, function() {
          $("span").css("background-color","white");
          $("span").css("color","black");
          $("span").css("cursor","cell");
         document.getElementById("sideinfo").style.width = "0px";
      }
    );

    function applyHighlight(node){
        rk.records.forEach(function (record) {
            temp1 = record.first_element.getPosition().split(' ');
            temp2 = record.second_element.getPosition().split(' ');
            check = temp1.concat(temp2);

            if(check.includes(node)){
                var color = record.color;
                record.first_element.nodes.forEach(function (el) {
                    $("#"+el.id).css("cursor","help");
                    $("#"+el.id).css("background-color",color);
                    $("#"+el.id).css("color","white");
                });
                record.second_element.nodes.forEach(function (el) {
                    $("#"+el.id).css("cursor","help");
                    $("#"+el.id).css("background-color","rgb(36,51,60)");
                    $("#"+el.id).css("color","white");
                });

                 $('#type1').text("Класс: "+record.first_element.type);
                 $('#phrase1').text(record.first_element.getPhrase());
                 $('#connection').text("Связь: "+record.connection);
                 $('#type2').text("Класс: "+record.second_element.type);
                 $('#phrase2').text(record.second_element.getPhrase());

                document.getElementById("sideinfo").style.width = "400px";
            }
        })
    }

    // from https://developer.mozilla.org/en-US/docs/Web/API/Selection
    function getSelectedNodes() {
        var selection = window.getSelection();
        if (selection.isCollapsed) {
            return [];
        };

        var node1 = selection.anchorNode;
        var node2 = selection.focusNode;
        var selectionAncestor = get_common_ancestor(node1, node2);
        if (selectionAncestor == null) {
            return [];
        }
        return getNodesBetween(selectionAncestor, node1, node2);
    }

    // from http://stackoverflow.com/questions/3960843/how-to-find-the-nearest-common-ancestors-of-two-or-more-nodes
    function get_common_ancestor(a, b) {

        $parentsa = $(a).parents();
        $parentsb = $(b).parents();

        var found = null;
        $parentsa.each(function() {
            var thisa = this;

            $parentsb.each(function() {
                if (thisa == this) {
                    found = this;
                    return false;
                }
            });

            if (found) return false;
        });

        return found;
    }

    // from http://stackoverflow.com/questions/2234979/how-to-check-in-javascript-if-one-element-is-a-child-of-another
    function isDescendant(parent, child) {

        var node = child;
        while (node != null) {
            if (node == parent) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    }

    function getNodesBetween(rootNode, node1, node2) {
        var resultNodes = [];
        var isBetweenNodes = false;
        for (var i = 0; i < rootNode.childNodes.length; i+= 1) {
            if (isDescendant(rootNode.childNodes[i], node1) || isDescendant(rootNode.childNodes[i], node2)) {
                if (resultNodes.length == 0) {
                    isBetweenNodes = true;
                } else {
                    isBetweenNodes = false;
                }
                resultNodes.push(rootNode.childNodes[i]);
            } else if (resultNodes.length == 0) {
            } else if (isBetweenNodes) {
                resultNodes.push(rootNode.childNodes[i]);
            } else {
                return resultNodes;
            }
        };
        if (resultNodes.length == 0) {
            return [rootNode];
        } else if (isDescendant(resultNodes[resultNodes.length - 1], node1) || isDescendant(resultNodes[resultNodes.length - 1], node2)) {
            return resultNodes;
        } else {
            // same child node for both should never happen
            return [resultNodes[0]];
        }
    }
});