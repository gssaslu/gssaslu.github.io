/**
 * Event photos open in a lightbox instead of navigating to the image file.
 *
 * Progressive enhancement, the same bargain the bio drawer makes: every
 * thumbnail is already a real <a> pointing at the full-size photo, so with no
 * JavaScript a click still shows the picture. When this script runs it takes
 * the click instead and opens the photo over the page.
 *
 * There is exactly one <dialog>, opened with showModal(), which hands us:
 *   - focus trapped inside the lightbox while it is open
 *   - Escape to close
 *   - focus returned to the thumbnail that was clicked
 *
 * Arrow keys move between photos. The dialog stays open and only its contents
 * change, so focus never leaves and the browser never repaints the page behind.
 */
(function () {
  "use strict";

  var box = document.getElementById("lightbox");
  if (!box || typeof box.showModal !== "function") return;

  var links = document.querySelectorAll(".gallery__link");
  if (!links.length) return;

  var img = box.querySelector(".lightbox__img");
  var caption = box.querySelector(".lightbox__caption");
  var closeBtn = box.querySelector(".lightbox__close");
  var prevBtn = box.querySelector(".lightbox__nav--prev");
  var nextBtn = box.querySelector(".lightbox__nav--next");
  var index = 0;

  // A single photo has nothing to page through; hide the arrows rather than
  // offer two buttons that both land you back where you started.
  if (links.length < 2) {
    if (prevBtn) prevBtn.hidden = true;
    if (nextBtn) nextBtn.hidden = true;
  }

  function show(i) {
    // Wrap at both ends, so the arrows never dead-end.
    index = (i + links.length) % links.length;
    var link = links[index];
    var text = link.getAttribute("data-caption") || "";

    img.src = link.getAttribute("href");
    img.alt = text || box.getAttribute("data-photo-alt") || "";
    caption.textContent = text;
    caption.hidden = !text;

    var fallback = box.getAttribute("data-label-single") || "";
    box.setAttribute(
      "aria-label",
      text ? text : fallback + " " + (index + 1) + " / " + links.length
    );
  }

  function open(i) {
    show(i);
    box.showModal();
  }

  for (var n = 0; n < links.length; n++) {
    (function (i) {
      links[i].addEventListener("click", function (event) {
        event.preventDefault();
        open(i);
      });
    })(n);
  }

  if (closeBtn) closeBtn.addEventListener("click", function () { box.close(); });
  if (prevBtn) prevBtn.addEventListener("click", function () { show(index - 1); });
  if (nextBtn) nextBtn.addEventListener("click", function () { show(index + 1); });

  box.addEventListener("keydown", function (event) {
    if (links.length < 2) return;
    if (event.key === "ArrowLeft") { event.preventDefault(); show(index - 1); }
    if (event.key === "ArrowRight") { event.preventDefault(); show(index + 1); }
  });

  // Clicking the dimmed area closes. The dialog fills the viewport, so the
  // test is against the figure's box rather than the dialog's.
  box.addEventListener("click", function (event) {
    if (event.target.closest(".lightbox__figure, .lightbox__nav, .lightbox__close")) return;
    box.close();
  });

  // Drop the loaded image when the lightbox closes, so a long gallery does not
  // keep the last full-size photo in memory for the rest of the visit.
  box.addEventListener("close", function () {
    img.removeAttribute("src");
  });
})();
