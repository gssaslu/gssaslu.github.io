/**
 * Officer bios open in a side drawer instead of expanding in place.
 *
 * Progressive enhancement. The markup is <details>/<summary>, which already
 * works with no JavaScript — the bio just expands inline. When this script
 * runs it takes over the click, and the bio slides in from the right instead.
 *
 * Only one bio can ever be open, because there is exactly one drawer and it
 * is opened with showModal(). That also gives us, for free:
 *   - focus trapped inside the drawer while it is open
 *   - Escape to close
 *   - focus returned to the card that was clicked
 */
(function () {
  "use strict";

  var drawer = document.getElementById("bio-drawer");
  if (!drawer || typeof drawer.showModal !== "function") return;

  var cards = document.querySelectorAll("details.person");
  if (!cards.length) return;

  var body = drawer.querySelector(".bio-drawer__body");
  var media = drawer.querySelector(".bio-drawer__media");
  var closeBtn = drawer.querySelector(".bio-drawer__close");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Tells the stylesheet the inline panels are no longer the mechanism.
  document.documentElement.classList.add("has-bio-drawer");

  function fill(card) {
    var photo = card.querySelector(".person__photo");
    var name = card.querySelector(".person__name");
    var role = card.querySelector(".person__role");
    var program = card.querySelector(".person__program");
    var panel = card.querySelector(".person__panel");
    var hasPhoto = photo && !photo.classList.contains("person__photo--empty");

    // --- Hero: the photo fills the top of the drawer with the name over it.
    media.innerHTML = "";
    media.className = "bio-drawer__media" + (hasPhoto ? "" : " bio-drawer__media--empty");

    if (photo) {
      var clone = photo.cloneNode(true);
      clone.className = "bio-drawer__photo" + (hasPhoto ? "" : " bio-drawer__photo--empty");
      clone.removeAttribute("loading");
      clone.removeAttribute("width");
      clone.removeAttribute("height");
      media.appendChild(clone);
    }

    var heading = document.createElement("div");
    heading.className = "bio-drawer__heading";
    if (role) {
      var r = document.createElement("p");
      r.className = "bio-drawer__role";
      r.textContent = role.textContent.trim();
      heading.appendChild(r);
    }
    if (name) {
      var h = document.createElement("h2");
      h.className = "bio-drawer__name";
      h.id = "bio-drawer-title";
      h.textContent = name.textContent.trim();
      heading.appendChild(h);
    }
    media.appendChild(heading);

    // --- Body: everything that reads as prose.
    body.innerHTML = "";
    if (program) {
      var p = document.createElement("p");
      p.className = "bio-drawer__program";
      p.textContent = program.textContent.trim();
      body.appendChild(p);
    }
    if (panel) {
      var content = document.createElement("div");
      content.className = "bio-drawer__content";
      content.innerHTML = panel.innerHTML;
      body.appendChild(content);
    }

    var aboutPrefix = drawer.getAttribute("data-about-prefix") || "";
    drawer.setAttribute(
      "aria-label",
      name
        ? (aboutPrefix + " " + name.textContent.trim()).trim()
        : drawer.getAttribute("aria-label")
    );
  }

  function open(card) {
    fill(card);
    drawer.classList.remove("is-closing");
    drawer.showModal();
    drawer.scrollTop = 0;
  }

  function close() {
    if (reduceMotion.matches) {
      drawer.close();
      return;
    }
    // Let the slide-out finish before the dialog is actually removed.
    drawer.classList.add("is-closing");
    var done = function () {
      drawer.removeEventListener("animationend", done);
      drawer.classList.remove("is-closing");
      drawer.close();
    };
    drawer.addEventListener("animationend", done);
  }

  for (var i = 0; i < cards.length; i++) {
    (function (card) {
      var summary = card.querySelector("summary");
      if (!summary) return;
      summary.addEventListener("click", function (event) {
        // Stop <details> toggling; the drawer is the mechanism now.
        event.preventDefault();
        open(card);
      });
    })(cards[i]);
  }

  if (closeBtn) closeBtn.addEventListener("click", close);

  // Clicking the dimmed area outside the panel closes it. The dialog element
  // fills the viewport, so compare against the panel's own box.
  drawer.addEventListener("click", function (event) {
    var box = drawer.getBoundingClientRect();
    var inside =
      event.clientX >= box.left &&
      event.clientX <= box.right &&
      event.clientY >= box.top &&
      event.clientY <= box.bottom;
    if (!inside) close();
  });

  // Escape fires 'cancel'; route it through the same animated close.
  drawer.addEventListener("cancel", function (event) {
    event.preventDefault();
    close();
  });
})();
