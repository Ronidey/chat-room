var UIController = (function () {
  var DOMElms = {
    nameModal: $id("nameModal"),
    nameModalForm: $id("nameModalForm"),
    nameModalInput: $cls("name-modal_input")[0],
    joinBtns: $cls("group-join-btn")
  };

  return {
    getDOMElms: function () {
      return DOMElms;
    },

    showNameModal: function (e) {
      // Create Overlay
      var overlay = document.createElement("div");
      overlay.className = "overlay";
      document.body.appendChild(overlay);

      $addClass(DOMElms.nameModal, "is-visible");
      DOMElms.nameModalInput.focus();
    },

    hideNameModal: function () {
      $removeClass(DOMElms.nameModal, "is-visible");
      $remove(document.body.lastElementChild); //overlay is the last element
    }
  };
})();

var controller = (function (UICtrl) {
  var DOMElms = UICtrl.getDOMElms();
  var setEventListeners = function () {
    for (var i = 0; i < DOMElms.joinBtns.length; i++) {
      DOMElms.joinBtns[i].addEventListener("click", joinGroupHandler);
    }

    document.addEventListener("click", function (e) {
      if (e.target.className === "overlay") {
        UICtrl.hideNameModal();
      }
    });
  };

  function joinGroupHandler(e) {
    var groupToJoin = e.target.getAttribute("data-target-group");
    DOMElms.nameModalForm.room.value = groupToJoin;
    UICtrl.showNameModal(e);
  }

  return {
    init: function () {
      setEventListeners();
    }
  };
})(UIController);

window.onload = function () {
  controller.init();
};
