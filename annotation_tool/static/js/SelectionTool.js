$(document).ready(function() {
    let tooltips = [];
    let LC = new LinkController([],$("#block").attr("data-pk"), new WindowController(document.getElementById("#window-container")),null);
    LC.assignClickToItems($( "[data-callable='1']" ));
    LC.downloadLinkedItems();

    $(".id").hover(
        function() {
            highlightElements([[$(this), 0]], "rgb(36,51,60)","white",false);
            let links = LC.getLineLinkedItems(this);
            if (links[0].length>0 || links[1].length>0){
                highlightElements(links[0],"rgb(255,103,102)","white",true,"Родитель");
                highlightElements(links[1],"rgb(32,150,124)","white",true, "Потомок");
            }


        }, function() {
            highlightElements([[$(".id")],0], "white","rgb(36,51,60)",false);
            $(".id").tipso('hide');
            $(".id").tipso('destroy');
        }
    );


    function highlightElements(elements,color, text_color, apply_tooltip, type) {
        elements.forEach(function (node, i, masters) {
            if (apply_tooltip){
                $(node[0]).tipso({
                    background: color,
                    speed : 1,
                    width: "150px",
                    animationIn: 'fadeInLeft',
                    animationOut: 'fadeOutLeft',
                    position: 'left',
                    useTitle: false,
                    content: node[1]
                });
                $(node[0]).tipso('show');
            }

            $(node[0]).find('p').css("background-color", color);
                $(node[0]).find('p').css("color", text_color);
                $(node[0]).next().find('p').css("background-color", color);
                $(node[0]).next().find('p').css("color", text_color);
                $(node[0]).next().next().find('p').css("background-color", color);
                $(node[0]).next().next().find('p').css("color", text_color);
            })
    }




});


