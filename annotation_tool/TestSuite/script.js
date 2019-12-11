$(document).ready(function () {
    $('.TestSuccess').click(function () {
        $(this).next().toggle();
    })
    $('.TestError').click(function () {
        $(this).next().toggle();
    })
});