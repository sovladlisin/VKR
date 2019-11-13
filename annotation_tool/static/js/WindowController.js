class WindowController{

    constructor(container){
        this.container = container;
    }


    // createWindow
    // Function - appending div node 'window' with content inside 'item-info'
    // html - windows content
    // class_name - element (which is displayed) pk
    // pk - element (which is displayed) pk
    createWindow(html,class_name,pk){
        var self = this;
        var id = pk+class_name;
        let window_html = "<div class=\"window\"id=\"window"+id+"\">\n" +
            "    <div class=\"window-header\"id=\"window"+id+"-header\"><p>"+class_name+" - "+pk+"</p>" +
             "<div class=\"close-window\"id=\"close-window"+id+"\"><p>x</p></div></div>\n" +
            "    <div class=\"item-info\"id=\"item-info"+id+"\"></div>\n" +
            "</div>";
       $("#window-container").append(window_html);
       $("#item-info"+id).append(html);
       dragElement(document.getElementById("window"+id));

    }
}

function dragElement(elmnt) {
      var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
      if (document.getElementById(elmnt.id + "-header")) {
        // if present, the header is where you move the DIV from:
        document.getElementById(elmnt.id + "-header").onmousedown = dragMouseDown;
      } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown;
      }

      function dragMouseDown(e) {
          $("[id^='window']").css("z-index","1");
          $(elmnt).css("z-index","99");

        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
      }

      function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
      }

      function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
      }
    }