(() => {
  // <stdin>
  var tabSpace = document.querySelector('[data-area="tabber"]');
  var buttons = document.querySelectorAll("button[data-tab]");
  window.addEventListener("load", () => {
    buttons.forEach((b) => b.addEventListener("click", () => switchTo(b)));
  });
  function switchTo(button) {
    for (const tab of tabSpace.children) {
      tab.classList.remove("active");
    }
    const activeTab = tabSpace.querySelector("." + button.dataset["tab"]);
    activeTab.classList.add("active");
    for (const b of buttons) {
      b.ariaSelected = "false";
      if (b == button) {
        b.ariaSelected = "true";
      }
    }
  }
})();
