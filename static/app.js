// UI functions
function settings_switch() {
  var p = document.getElementById('settings');
  if (p.className == '') {
    p.className = 'active';
  } else {
    p.className = '';
  }
}
$(document).ready(function() {
  $('#settings_mainsize').on("change mousemove", function() {
    var v = $(this).val() * 66 + 300;
    $('#pics').css("max-width", v + 'px');
    $.cookie('mainsize', v);
  });
  $('#settings_display input').on('change', function() {
    if ($('input[name=settings_display]:checked', '#settings_display').val() == 'list') {
      $('#pics').removeClass('grid');
      $.cookie('grid', '0');
    } else {
      $('#pics').addClass('grid')
      $.cookie('grid', '1');
    }
  });
});
// vim:et:ts=2:sts=2:sw=2
