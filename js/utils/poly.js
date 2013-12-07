(function(window, document, ionic) {
  'use strict';

  // From the man himself, Mr. Paul Irish.
  // The requestAnimationFrame polyfill
  window.rAF = (function(){
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            function( callback ){
              window.setTimeout(callback, 1000 / 60);
            };
  })();

  // Ionic CSS polyfills
  ionic.CSS = {};
  
  (function() {
    var d = document.createElement('div');
    var keys = ['webkitTransform', 'transform', '-webkit-transform', 'webkit-transform',
                '-moz-transform', 'moz-transform', 'MozTransform', 'mozTransform'];

    for(var i = 0; i < keys.length; i++) {
      if(d.style[keys[i]] !== undefined) {
        ionic.CSS.TRANSFORM = keys[i];
        break;
      }
    }
  })();

  // polyfill use to simulate native "tap"
  function inputTapPolyfill(ele, e) {
    if(ele.type === "radio" || ele.type === "checkbox") {
      ele.checked = !ele.checked;
    } else if(ele.type === "submit" || ele.type === "button") {
      ionic.trigger('click', {
        target: ele
      });
    } else {
      ele.focus();
    }
    e.stopPropagation();
    e.preventDefault();
    return false;
  }

  function tapPolyfill(e) {
    console.log('TAP POLY');
    // if the source event wasn't from a touch event then don't use this polyfill
    if(!e.gesture || e.gesture.pointerType !== "touch" || !e.gesture.srcEvent) return;

    // An internal Ionic indicator for angular directives that contain
    // elements that normally need poly behavior, but are already processed
    // (like the radio directive that has a radio button in it, but handles
    // the tap stuff itself). This is in contrast to preventDefault which will
    // mess up other operations like change events and such
    if(e.alreadyHandled) {
      console.log('POLY HANDLED');
      return;
    }

    e = e.gesture.srcEvent; // evaluate the actual source event, not the created event by gestures.js

    var ele = e.target;

    console.log('TARGET', ele);

    while(ele) {
      // Skip ones that have the poly skip
      if(ele.getAttribute('skip-tap-poly')) { 
        ele = ele.parentElement;
        continue;
      }

      if( ele.tagName === "INPUT" || ele.tagName === "TEXTAREA" || ele.tagName === "SELECT" ) {
        console.log('INPUT POLY');
        return inputTapPolyfill(ele, e);
      } else if( ele.tagName === "LABEL" ) {
        console.log('LABEL POLY');
        if(ele.control) {
          return inputTapPolyfill(ele.control, e);
        }
      } else if( ele.tagName === "A" || ele.tagName === "BUTTON" ) {
        if(ele.getAttribute('href')) {
          console.log('HREF POLY', ele);
          ionic.trigger('click', {
            target: ele
          });
        } else {
          console.log('BUTTON POLY', ele);
          ionic.trigger('tap', {
            target: ele
          });
        }
        e.stopPropagation();
        e.preventDefault();
        return false;
      }
      ele = ele.parentElement;
    }

    console.log('NEITHER POLY');
    // they didn't tap one of the above elements
    // if the currently active element is an input, and they tapped outside
    // of the current input, then unset its focus (blur) so the keyboard goes away
    var activeElement = document.activeElement;
    if(activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA" || activeElement.tagName === "SELECT")) {
      activeElement.blur();
      e.stopPropagation();
      e.preventDefault();
      return false;
    }
  }

  // global tap event listener polyfill for HTML elements that were "tapped" by the user
  ionic.on("tap", tapPolyfill, window);

})(this, document, ionic);
