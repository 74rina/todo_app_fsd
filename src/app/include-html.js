(function () {
  var includeSelector = "[data-include]";

  function loadHtml(path) {
    return fetch(path).then(function (response) {
      if (!response.ok) {
        throw new Error(response.status + " " + response.statusText);
      }

      return response.text();
    });
  }

  function replaceInclude(target) {
    var path = target.dataset.include;

    return loadHtml(path)
      .then(function (html) {
        if (target.tagName.toLowerCase() === "template") {
          target.innerHTML = html.trim();
          target.removeAttribute("data-include");
          return;
        }

        var template = document.createElement("template");
        template.innerHTML = html.trim();
        target.replaceWith(template.content.cloneNode(true));
      })
      .catch(function (error) {
        target.removeAttribute("data-include");
        target.textContent = "HTMLの読み込みに失敗しました: " + path;
        target.setAttribute("data-include-error", "");
        console.error("[include-html] " + path, error);
      });
  }

  function includeHtml() {
    var targets = Array.prototype.slice.call(document.querySelectorAll(includeSelector));

    if (targets.length === 0) {
      document.dispatchEvent(new CustomEvent("html-includes:ready"));
      return Promise.resolve();
    }

    return Promise.all(targets.map(replaceInclude)).then(includeHtml);
  }

  window.includeHtml = includeHtml;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", includeHtml);
  } else {
    includeHtml();
  }
})();
