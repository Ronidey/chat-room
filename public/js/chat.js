var socket = io();

// ================ Provides Helpful fuctions ===============
var appController = (function () {
  var _queryParser = function (query) {
    var queryData = {};

    query = query.slice(1); // remove ?
    var queryArr = query.split("&"); // getting prop=value pair in array

    for (var i = 0; i < queryArr.length; i++) {
      var querySplit = queryArr[i].split("=");
      var prop = querySplit[0];
      var value = querySplit[1];

      queryData[prop] = value;
    }
    return queryData;
  };

  return {
    queryParser: function (query) {
      return _queryParser(query);
    }
  };
})();

// ====================== UI CONTROLLER ======================
var UIController = (function () {
  var DOMElms = {
    msgCotainer: $id("messageContainer"),
    msgBox: $id("msgBox"),
    alertBox: $id("alertBox"),
    sendMsgForm: $id("sendMsgForm"),
    sendMsgInp: $id("sendMsgInp"),
    sendMSgBtn: $id("sendMsgBtn"),
    sidebar: $id("chatRoomSidebar"),
    btnDots: $id("btnDots"),
    chatRoomActive: $id("chatRoomActive"),
    activePeopleMenu: $id("activePeopleMenu")
  };

  // TEMPLATES
  var _alertTemplate = function (msg) {
    return "<p>" + msg + "</p>";
  };

  var _msgTemplate = function (username, message) {
    return (
      "<div><p><span class='sender'>" +
      username +
      ": </span>" +
      message +
      "</span></p></div>"
    );
  };

  var _activeMenuTemplate = function (users) {
    var html = "";

    for (var i = 0, len = users.length; i < len; i++) {
      html += "<li class='sidebar_menu_item'>" + users[i].username + "</li>";
    }
    return html;
  };

  var _autoScroll = function () {
    var newMsg = DOMElms.msgBox.lastElementChild;
    var newMsgMargin = parseInt(window.getComputedStyle(newMsg).marginBottom);
    var newMsgTotalHeight = newMsg.offsetHeight + newMsgMargin;

    var msgContOffHeight = DOMElms.msgCotainer.offsetHeight;
    var msgContScrollTop = DOMElms.msgCotainer.scrollTop;
    var msgContTotalHeight = DOMElms.msgCotainer.scrollHeight;
    var scrollOffset = msgContOffHeight + msgContScrollTop;

    if (msgContTotalHeight - newMsgTotalHeight <= scrollOffset + 50) {
      DOMElms.msgCotainer.scrollTop = msgContTotalHeight;
    }
  };

  // Public API's
  return {
    getDOMElms: function () {
      return DOMElms;
    },

    toggleSidebar: function () {
      var el = DOMElms.sidebar,
        cls = "is-visible";

      if (el.classList) el.classList.toggle(cls);
      else {
        if ($hasClass(el, cls)) $removeClass(el, cls);
        else $addClass(el, cls);
      }
    },

    showAlert: function (msg) {
      var html = _alertTemplate(msg);

      DOMElms.alertBox.insertAdjacentHTML("afterBegin", html);

      // Remove alert after 3000ms
      setTimeout(function () {
        $remove(DOMElms.alertBox.lastElementChild);
      }, 2000);
    },
    chatRoomSetup: function (name) {
      $id("roomName").innerHTML = name + " Group";
    },
    printMessage: function (msg) {
      var html = _msgTemplate(msg.username, msg.message);

      DOMElms.msgBox.insertAdjacentHTML("beforeend", html);
      _autoScroll();
    },

    showActivePeople: function (users) {
      var html = _activeMenuTemplate(users);

      DOMElms.chatRoomActive.textContent = users.length + " active people";
      DOMElms.activePeopleMenu.innerHTML = html;
    },
    userTyping: function (msg) {
      DOMElms.chatRoomActive.textContent = msg;
    }
  };
})();

// =============================== Main Controller =========================================
var controller = (function (socket, appCtrl, UICtrl) {
  var DOMElms = UIController.getDOMElms();

  // Setting Events On The Client Side
  const setEventListeners = function () {
    DOMElms.btnDots.addEventListener("click", UICtrl.toggleSidebar);
    // Typing event
    DOMElms.sendMsgInp.addEventListener("input", sendTypingState);
    // Send Message
    DOMElms.sendMsgForm.addEventListener("submit", sendFormData);
  };

  // Handing Events Emitted By The Server
  socket.on("alert", UICtrl.showAlert);
  socket.on("message", UIController.printMessage);
  socket.on("roomData", UICtrl.showActivePeople);
  socket.on("userTyping", UICtrl.userTyping);

  function sendTypingState(e) {
    socket.emit("typing", function (err) {
      if (err) reloadBrowser();
    });

    this.removeEventListener("input", sendTypingState);
  }

  function sendFormData(e) {
    e.preventDefault();
    var message = DOMElms.sendMsgInp.value;

    DOMElms.sendMSgBtn.setAttribute("disabled", "disabled");

    socket.emit("sendMessage", message, function (error) {
      if (error) {
        reloadBrowser();
      } else {
        DOMElms.sendMsgInp.value = "";
        DOMElms.sendMsgInp.focus();
        DOMElms.sendMSgBtn.removeAttribute("disabled");

        // Once the msg delivered setting the input event again
        DOMElms.sendMsgInp.addEventListener("input", sendTypingState);
      }
    });
  }

  // Reloads browser, only invoke this function if server
  // somehow loses its memory data (users data)
  function reloadBrowser() {
    alert("Something went wrong :( We have to reload this page");
    location.reload();
  }

  // Public API's
  return {
    init: function () {
      var queryData = appCtrl.queryParser(location.search);

      UICtrl.chatRoomSetup(queryData.room);
      socket.emit("join", queryData, function (error) {
        alert(error);
        location.href = "/";
      });

      setEventListeners();
    }
  };
})(socket, appController, UIController);

window.onload = function () {
  controller.init();
};
