class WindowController {

  constructor(container) {
    this.container = container;
  }


  // createWindow
  // Function - appending div node 'window' with content inside 'item-info'
  // html - windows content
  // class_name - element (which is displayed) pk
  // pk - element (which is displayed) pk
  createWindow(html, class_name, pk) {
    var self = this;
    var id = pk + class_name;
    let window_html = "<div class=\"window\"id=\"window" + id + "\">\n" +
      "    <div class=\"window-header\"id=\"window" + id + "-header\"><p>" + class_name + " - " + pk + "</p>" +
      "<div class=\"close-window\"id=\"close-window" + id + "\"><p>x</p></div>\n" +
      "<div class=\"item-restore\"id=\"item-restore" + id + "\"><p>↫</p></div>\n" +
      "<div class=\"save-window\"id=\"save-window" + id + "\"><p>☍</p></div></div>\n" +
      "    <div class=\"item-info\"id=\"item-info" + id + "\"></div>\n" +
      "</div>";
    $("#window-container").append(window_html);
    $("#item-info" + id).append(html);
    dragElement(document.getElementById("window" + id));

  }
}

