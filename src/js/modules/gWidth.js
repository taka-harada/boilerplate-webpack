import $ from 'jquery';
// ウィンドウ幅
export function gWindowWidth () {
  var num = window.innerWidth ? window.innerWidth : $(window).width();
  if (navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1) num = $(window).width();
  return num;
}
