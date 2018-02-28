import '../../scss/style.scss';
import jQuery from 'jquery';
import {gWindowWidth} from '../modules/gWidth';
import {addGoogleMap} from '../modules/map';
// import {hello} from './sub';

const $ = jQuery;
window.jQuery = jQuery;

require('sticky-kit/dist/sticky-kit.js');

// (function($) {

window.bst = {};
var gWwidth = gWindowWidth();

var ua = navigator.userAgent.toLowerCase();

jQuery.extend(jQuery.easing, {
  def: 'easeOutQuad',
  easeOutQuart: function (x, t, b, c, d) {
    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
  },
  easeOutExpo: function (e, f, a, h, g) {
    return (f === g) ? a + h : h * (-Math.pow(2, -10 * f / g) + 1) + a;
  },
  quart: function (x, t, b, c, d) {
    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
  }
});

var isSlider = $('#slider').length;
var resizeTimer = false;

// var slidePhotoH = 645;
// var slidePhotoW = 1580;
// var slidePhotoRatio = slidePhotoH / slidePhotoW;
// var sliderHeight;

// win8.1 ie11 mousewheel scroll bug
if (navigator.userAgent.match(/Trident\/7\./)) {
  $('body').on('mousewheel', function () {
    event.preventDefault();
    var wheelDelta = event.wheelDelta;
    var currentScrollPosition = window.pageYOffset;
    window.scrollTo(0, currentScrollPosition - wheelDelta);
  });
}

// 最初に実行する関数
$(window).on({
  load: function () {
    spNavReverse();

    gWwidth = gWindowWidth();

    sizing(true);

    gstHeader();

    if (isSlider) autoSlide(true);

    if ($('#company-map').length) {
      // $.googlemap({selector: 'company-map', latlngX: 35.659623, latlngY: 139.724641});
      addGoogleMap({selector: 'company-map', latlngX: 35.659623, latlngY: 139.724641});
    }

    historyEvenFunc();
  },
  resize: function () {
    gWwidth = gWindowWidth();

    sizing();

    gstHeader();

    autoSlide(false);
    if (resizeTimer !== false) {
      clearTimeout(resizeTimer);
    }
    resizeTimer = setTimeout(function () {
      if (isSlider) autoSlide(true);
    }, 500);
  },
  scroll: function () {
    gstHeader();
  }
});

// #リンク
$('a[href^="#"]').click(function (e) {
  e.preventDefault();
});

// sizing
function sizing (bool) {
  var $sliderArea = $('.slider-bg, .slider-logo');
  var topH = $(window).height() - (parseInt($('#slider').css('paddingTop')) + parseInt($('#slider').css('paddingBottom')));
  var maxH = parseInt($('.slider-logo h1').css('maxHeight'));

  if (topH < maxH) {
    $sliderArea.css({'height': maxH});
  } else {
    $sliderArea.css({'height': topH});
  }

  if (bool) {
    $sliderArea.addClass('open');
  }

  $('#top-wrap').css({'marginTop': $(window).height()});
};

$(window).bind('ready load', function () {
  if ($('#top-wrap').length) {
    // console.log("des");
    // window.scrollTo(0, 0);
    $('html,body').stop().animate({scrollTop: 0}, 0);
  }
});

function gstHeader () {
  var scr = $(window).scrollTop();
  // var winH = $(window).height() / 4;
  // var alpPos = winH * 3;

  // var gstPos = $(window).height() - (parseInt($("#slider").css("paddingTop")) + 20);
  // var gstH = (gWwidth > 600) ? 100 : 50;

  var gstPos = $(window).height() - (parseInt($('#slider').css('paddingTop')));

  $('#scr-box').css({'top': gstPos});

  if (scr > gstPos - 20) {
    $('#hvc-wrap.top > header').addClass('scr');

    // if(scr > gstPos + gstH) {
    if (scr >= gstPos) {
      $('#hvc-wrap.top > header').addClass('gst anim');
    } else {
      $('#hvc-wrap.top > header').removeClass('gst');

      // $('#hvc-wrap.top > header').removeClass("gst").on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function() {
      // $(this).removeClass("anim");
      // });
    }
  } else {
    $('#hvc-wrap.top > header').removeClass('scr anim');
  }

  if (scr > $(window).height() + 50) {
    $('body').addClass('sf-bg');
  } else {
    $('body').removeClass('sf-bg');
  }
}

var menuOpenFlg = false;

$('#nav-btn a').click(function () {
  var $btn = $(this).parent();
  if (!menuOpenFlg) {
    menuOpenFlg = true;
    // $btn.addClass("open");
    // $("#bst-wrap, #top-wrap, #footer").addClass('menu-body-mask');
    // $('#nav-menu').css({'display': 'flex'});

    $('#nav-menu').addClass('open').delay(0).queue(function () {
      $('#nav-menu').addClass('alp').dequeue().on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function () {
        $('#bst-wrap, #top-wrap, #footer').addClass('menu-body-mask');
      });

      $btn.addClass('open');
    });
  } else {
    menuOpenFlg = false;
    $btn.removeClass('open');
    $('#bst-wrap, #top-wrap, #footer').removeClass('menu-body-mask');

    $('#nav-menu').removeClass('alp').delay(200).queue(function () {
      $('#nav-menu').removeClass('open').dequeue();
    });
  }
});

var spNavFlag = false;
var spNavReverse = function () {
  if (gWwidth <= 800) {
    spNavFlag = true;
  }

  $(window).bind({
    resize: function () {
      // console.log("aaa");

      if (gWwidth > 800) {
        if (spNavFlag) {
          menuOpenFlg = false;

          $('#nav-btn').removeClass('open');
          $('#bst-wrap').removeClass('menu-body-mask');
          $('#bst-wrap').removeAttr('style');
          $('#nav-menu').removeAttr('style');

          spNavFlag = false;
        }
      } else {
        if (!spNavFlag) {
          spNavFlag = true;
        }
      }
    }
  });
};

$('#slider .arw a').click(function () {
  var scrSpeed = (gWwidth > 800) ? 800 : 600;

  $('html,body').stop().animate({ scrollTop: $(window).height() }, scrSpeed, 'quart', function () {
    $('#hvc-wrap.top > header').addClass('gst anim');
  });
  // return false;
});

/* 自動でスライドさせます
----------------------------------------------- */
/* bg fade loop */
var $setElm = $('#slider-scale');
var sliderUl;
var sliderLi;
var sliderLiFirst;
var fadeSpeed = 1200;
// var lrFadeSpeed = 1000;
var switchDelay = 8000;

$setElm.each(function () {
  var targetObj = $(this);
  sliderUl = targetObj.find('ul');
  sliderLi = targetObj.find('li');
  sliderLiFirst = targetObj.find('li:first');
  sliderLi.css({display: 'block', opacity: '0', zIndex: '10'});
  sliderLiFirst.css({zIndex: '20', opacity: '1'});
});

var slideTimer = null;
var sliderLength = $setElm.find('li').length;

function autoSlide (bool) {
  if (sliderLength > 1) {
    if (bool) {
      if (slideTimer !== null) return;

      $setElm.each(function () {
        slideTimer = setInterval(function () {
          sliderUl.find('li:first-child').stop().animate({opacity: '0'}, fadeSpeed).next('li').css({zIndex: '20'}).stop().animate({opacity: '1'}, fadeSpeed).end().appendTo(sliderUl).css({zIndex: '10'});
          // var clName = $('#slider-scale ul').find('li').eq(0).attr('class');
          // $("#slider-nombre").find('li').removeClass('active').end().find('a.' + clName.split(' ')[1]).parent().addClass('active');
        }, switchDelay);
      });
    } else {
      clearInterval(slideTimer);
      slideTimer = null;
    }
  } else {
    // $('#slider-left-arw, #slider-right-arw, #slider-nombre').remove();
  }
}

/* ie8 で投稿imgの height:auto が出来ない用
----------------------------------------------- */

if (ua.indexOf('msie') !== -1) {
  $('#post-inner .article-content img').each(function () {
    var imgw = $(this).attr('width');
    if (imgw > 701) $(this).css({width: 100 + '%', height: 'auto'});
  });
}

/* 投稿imgの キャプション付きの場合
----------------------------------------------- */

$('.wp-caption').each(function () {
  var divW = $(this).css('width');
  $(this).removeAttr('style').css({'max-width': divW, 'height': 'auto'});
});

/* sticky
----------------------------------------------- */
$(window).bind('load resize', function () {
  if ($('#post-inner.blog').length || $('#post-inner.news').length) stickLine();
});

var isStick = false;
var $stickElm;

function stickLine () {
  $stickElm = $('.side-bar');

  if ($(window).width() > 1024) {
    if (!isStick) {
      $stickElm.stick_in_parent({offset_top: 100}).on('sticky_kit:recalc');
      isStick = true;
    }
  } else {
    isStick = false;
    $stickElm.trigger('sticky_kit:detach');
  }
};

// history の縞しま
function historyEvenFunc () {
  var $tr = $('.page-table-history').find('tr');
  for (var i = 0; i < $tr.length; i++) {
    if (i % 2 === 0) $tr.eq(i + 1).addClass('even');
  }
};

/* trust form check-radio
--------------------------------------- */
$('#prof-area-wrap').find('input').each(function () {
  if ($(this).attr('type') === 'radio') {
    $(this).parent().addClass('radio');
  } else if ($(this).attr('type') === 'checkbox') {
    $(this).parent().addClass('checkbox');
  }
});

$('#prof-area-wrap').find('input[type="radio"]').on('click', function () {
  $(this).closest('ul').find('li').each(function () {
    $(this).find('label').removeClass('check');
  });

  if ($(this).prop('checked')) $(this).parent().addClass('check');
});

$('#prof-area-wrap').find('input[type="checkbox"]').on('change', function () {
  if ($(this).is(':checked')) {
    $(this).parent().addClass('check');
  } else {
    $(this).parent().removeClass('check');
  }
});

$('.doui-btn').on('click', function (e) {
  e.preventDefault();
  $('.hbspt-kiyaku-wrap').addClass('is-none');
  $('.hbspt-form-wrap').removeClass('is-none').css('display', 'none').fadeIn(400, function () {
    // contentHeight();
  });
  // contentHeight();
});

var ContactForm = function () {
  if ($('#contact-wrap.contact-form').length < 1) return;

  this.$textFeild = $('input[type=text], textarea');
  this.$selectBox = $('select');
  this.initialize();
};

ContactForm.prototype = {
  initialize: function () {
    this.$textFeild.on('keyup blur', this.textCheck);
    this.$selectBox.on('change', this.selectCheck);
    this.checkAll();
  },
  // テキスト、テキストエリアが空かどうかチェックしてスタイルを当てる
  textCheck: function () {
    if ($(this).val() !== '') {
      $(this).css('background-color', '#fff');
    } else {
      $(this).css('background-color', '#000');
    }
    return this;
  },
  // セレクトボックスが空かどうかチェックしてスタイルを当てる
  selectCheck: function () {
    if ($('option', this).index($('option:selected', this)) > 0) {
      $(this).parent().addClass('selected');
    } else {
      $(this).parent().removeClass('selected');
    }
    return this;
  },
  // ページ読み込み時にtextCheck、selectCheck、openSpecialtyを実行するための関数
  checkAll: function () {
    this.$textFeild.trigger('blur');
    this.$selectBox.trigger('change');
    return this;
  }
};

// new ContactForm();

/**
* Share Button for home page
*/

var snsButton = {
  handleClick: function (e, self) {
    e.preventDefault();
    this.self = self;
    this.share();
  },
  share: function () {
    this.permalink = $(this.self).attr('href');
    this.title = $(this.self).data('title');
    switch ($(this.self).text()) {
      case 'F':
        this.facebook();
        break;
      case 'T':
        this.twitter();
        break;
      case 'P':
        this.pocket();
        break;
      case 'G':
        this.google();
        break;
      case 'H':
        this.hatebu();
        break;
      case 'L':
        this.linkedin();
        break;
    }
  },
  facebook: function () {
    window.open('http://www.facebook.com/sharer/sharer.php?u=' + this.permalink + '&t=' + this.title, 'facebook_share', 'width=500, height=321, resizable=no');
  },
  twitter: function () {
    window.open('https://twitter.com/share?&amp;url=' + this.permalink + '&amp;text=' + this.title, 'test', 'width=500, height=392, resizable=no');
  },
  pocket: function () {
    window.open('http://getpocket.com/save?url=' + this.permalink + '&title=' + this.title, 'ShareonPocket', 'width=500, height=392, resizable=no');
  },
  google: function () {
    window.open('https://plus.google.com/share?url=' + this.permalink + '&title=' + this.title, 'ShareonGoogle', 'width=500, height=392, resizable=no');
  },
  hatebu: function () {
    window.open('http://b.hatena.ne.jp/add?mode=confirm&amp;is_bm=1&amp;url=' + this.permalink + '&title=' + this.title, 'Hatena', 'width=500, height=392, resizable=yes');
  },
  linkedin: function () {
    window.open('http://www.linkedin.com/shareArticle?mini=true&url=' + this.permalink + '&;title=' + this.title, 'ShareonLinkedIn', 'width=500, height=392, resizable=no');
  }
};
$(document).on('click', '.top-sns-btns a', function (e) { snsButton.handleClick(e, this); });

// bst.gWindowWidth = gWindowWidth;

// })(jQuery);
