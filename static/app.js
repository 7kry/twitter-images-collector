// UI functions
function settings_switch() {
  var p = document.getElementById('settings');
  if (p.className == '') {
    p.className = 'active';
  } else {
    p.className = '';
  }
}
function fetch(maxid) {
  if (typeof(maxid) === null){
    maxid = $.cookie('latestid');
  }
  $.ajax('/list.json?maxid=' + maxid).done(function(data) {
    data['imgs'].forEach(function(ent) {
      if ($('#pics > a[data-imgid=' + ent['id'] + ']').length > 0) {
        return;
      }
      var a = $('<a>')
        .attr({
            'href': ent['href'],
            'target': '_blank',
            'data-imgid': ent['id']
          })
        .append($('<img>').attr({
            'src': ent['src'],
            'alt': ent['alt']
          }));
      if ($('#pics > a').length < 1 || ent['id'] > $('#pics > a:nth-child(1)').attr('data-imgid')) {
        a.prependTo('#pics');
      } else {
        a.appendTo('#pics');
      }
    });
  });
}
$(document).ready(function() {
  $('#settings_mainsize').on("change mousemove", function() {
    var v = $(this).val() * 66 + 300;
    $('#pics').css("max-width", v + 'px');
    $.cookie('mainsize', $(this).val());
  });
  (function() {
    var v = $.cookie('mainsize');
    if (typeof(v) != 'undefined') {
      $('#pics').css("max-width", (v * 66 + 300) + 'px');
      $('#settings_mainsize').val(v);
    }
    v = $.cookie('grid');
    if (v === '1') {
      $('#pics').addClass('grid');
      $('#settings_display-list').prop('checked', false);
      $('#settings_display-grid').prop('checked', true);
    } else {
      $('#pics').removeClass('grid');
      $('#settings_display-list').prop('checked', true);
      $('#settings_display-grid').prop('checked', false);
    }
  })();
  $('#settings_display input').on('change', function() {
    if ($('input[name=settings_display]:checked', '#settings_display').val() === 'list') {
      $('#pics').removeClass('grid');
      $.cookie('grid', '0');
    } else {
      $('#pics').addClass('grid')
      $.cookie('grid', '1');
    }
  });
  fetch(null);
});
// vim:et:ts=2:sts=2:sw=2
