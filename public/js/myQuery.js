var $id = function (sel) {
  return document.getElementById(sel);
};

var $cls = function (sel) {
  return document.getElementsByClassName(sel);
};

var $query = function (sel) {
  var elms = document.querySelectorAll(sel);

  if (elms.length > 1) {
    return elms;
  } else {
    return elms[0];
  }
};

var $addClass = function (el, cls) {
  if (el.classList) {
    el.classList.add(cls);
  } else {
    var current = el.className;
    var found = false;
    var all = current.split(" ");

    for (var i = 0; i < all.length && !found; i++) {
      found = all[i] === cls;

      if (!found) {
        if (current === "") el.className = cls;
        else el.className += " " + cls;
      }
    }
  }
};

var $hasClass = function (el, cls) {
  if (el.classList) {
    return el.classList.contains(cls);
  } else {
    return new RegExp("(^| )" + cls + "( |$)", "gi").test(el.className);
  }
};

var $removeClass = function (el, cls) {
  if (el.classList) {
    el.classList.remove(cls);
  } else {
    el.className = el.className.replace(
      new RegExp("(^|\\b)" + cls.split(" ").join("|") + "(\\b|$)", "gi"),
      " "
    );
  }
};

var $remove = function (el) {
  el.parentNode.removeChild(el);
};
