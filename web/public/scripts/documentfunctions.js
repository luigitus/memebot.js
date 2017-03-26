$(document).on('click', 'tr.header', function(){
  $(this).nextUntil('tr.header').slideToggle(100);
});
