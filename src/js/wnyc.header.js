/* global $:false */

(function(){
  "use strict";

  var $menu = $("#header-menu");

  $("#header-toggle").on("click",function(){
    $(this).toggleClass("open");
    $menu.toggleClass("open");
    $menu.find("li.open").removeClass("open");
    return false;
  });

  $menu.find("li.drawer").on("click",function(){
      $(this).toggleClass("open");
  });

  //Check for unsupported browsers here
  if (false) {
    $("#old-browser-warning").show();
  }

})();

/*
SVG support:
function supportsSVG() {

  var bool = false;

  try {
    bool = (!!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect);
  } catch(e) { }

  return bool;
}

d3 support:
function supportsD3() {
  return (typeof d3 !== "undefined");
}

audio support
function supportsAudio() {
  
  var bool = false;

  try {
    var elem = document.createElement("audio");
    bool = !!elem.canPlayType;
  } catch(e) { }

  return bool;
}
*/