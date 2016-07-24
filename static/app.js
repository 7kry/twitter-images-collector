function fetch(maxid) {
  if (typeof(maxid) === null){
    maxid = $.cookie('latestid');
  }
  $.ajax('/list.json?maxid=' + maxid).done(function(data) {
    data['imgs'].forEach(function(ent) {
      if ($('#pics > a[data-imgid=' + ent['id'] + ']').length > 0) {
        return;
      }
      if (typeof($.cookie('latestid')) === 'undefined' || ent['id'] > $.cookie('latestid')) {
        $.cookie('latestid', ent['id']);
      }
      var li = $('<li>')
        .attr({
          'data-imgid': ent['id'],
          'style': 'width: calc(' + 100 / $('#settings_picsrow').val() + '% - 20px)'
        }).append(
          $('<a>')
          .attr({
              'href': ent['href'],
              'target': '_blank',
            })
          .append($('<img>').attr({
              'src': ent['src'],
              'alt': ent['alt']
            })));
      if ($('#pics > li').length < 1 || ent['id'] > $('#pics > li:nth-child(1)').attr('data-imgid')) {
        li.prependTo('#pics');
      } else {
        li.appendTo('#pics');
      }
    });
  });
}
function settings_switch() { // Settings button
  var p = document.getElementById('settings');
  if (p.className == '') {
    p.className = 'active';
  } else {
    p.className = '';
  }
}
$(document).ready(function() {
  $('#settings_mainsize').on("change mousemove", function() { // Page size setting function
    var v = $(this).val() * 66 + 300;
    $('#pics').css("max-width", v + 'px');
    $.cookie('mainsize', $(this).val());
  });
  $('#settings_picsrow').on('change', function() {
    $('#pics li').css('width', 'calc(' + 100 / $(this).val() + '% - 20px)');
    $.cookie('picsrow', $(this).val());
  });
  // Instant invoke function to restore previously used settings through cookies
  (function() {
    var v = $.cookie('mainsize');
    if (typeof(v) != 'undefined') {
      // Restore page size setting
      $('#pics').css("max-width", (v * 66 + 300) + 'px');
      $('#settings_mainsize').val(v);
    }
    v = $.cookie('picsrow');
    if (typeof(v) != 'undefined') {
      // Restore images per row setting
      $('#pics li').css('width', 'calc(' + 100 / v + '% - 20px)');
      $('#settings_picsrow').val(v);
    }
  })();
  $('#hook').hook({
    'refresh': false,
    'callback': function() {
      fetch(parseInt($('#pics > li:nth-child(1)').attr('data-imgid')) + 100);
    }});
  $(window).bottom();
  $(window).bind('bottom', function() {
    fetch(parseInt($('#pics > li:nth-last-child(1)').attr('data-imgid')) - 1);
  });
  fetch(null);
});
