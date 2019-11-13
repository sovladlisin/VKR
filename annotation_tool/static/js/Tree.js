jQuery(window).on("load", function(){

	let selectedClass;

	$('#open-nav').click(function (e) {
		// $('#example_tree').css("visibility","visible");
		$('#nav-block')[0].style.height = "350px";
	});

	$('#example_tree').find('DIV').hover(
		function() {
			if( $(this).parent().children('UL').length > 0){
				$(this).css("color","red");
				$(this).css("cursor","pointer");
			}
			}, function() {
			$(this).css("color","black");
		}
		);
	$('#example_tree').find('DIV').click(function(e){
		if( $(this).parent().children('UL').length > 0){
			$(this).parent().children('UL').toggle();
		}
		$('#example_tree').find('DIV').find('p').css("background-color","rgb(255,255,255)");
        $('#example_tree').find('DIV').find('p').css("color","black");
        $('#example_tree').find('DIV').find('a').css("background-color","rgb(255,255,255)");
        $('#example_tree').find('DIV').find('a').css("color","black");
        $('#example_tree').find('DIV').css("background-color","rgb(255,255,255)");

		$(this).find('p').css("background-color","rgb(36,51,60)");
        $(this).find('p').css("color","rgb(255,255,255)");
        $(this).find('a').css("background-color","rgb(36,51,60)");
        $(this).find('a').css("color","rgb(255,255,255)");
       	$(this).css("background-color","rgb(36,51,60)");

		selectedClass = $(this).find('p').text();
		console.log(selectedClass);

		$("#side-class-info")[0].style.width = "350px";
	});
});