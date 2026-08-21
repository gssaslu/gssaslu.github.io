/**
 * GSSA animated sidebar — a drifting network of nodes that link when they come
 * close, evoking a triangulated spatial network (and echoing the satellite,
 * globe and north-arrow in the GSSA mark).
 *
 * Written without dependencies on purpose. The reference implementation this
 * takes after uses particles.js, which has been unmaintained since ~2016 and
 * would be a liability on a site handed to new officers every May.
 *
 * Behaviour:
 *   - honours prefers-reduced-motion (draws one static frame, never animates)
 *   - pauses when scrolled out of view or when the tab is hidden
 *   - scales node count to viewport area and redraws crisply on HiDPI screens
 */
(function () {
  "use strict";

  var canvas = document.getElementById("network");
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext("2d");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  var LINK_DIST = 112; // px at which two nodes start to connect
  var SPEED = 0.22; // px per frame
  var NODE_COLOR = "rgba(255, 255, 255, 0.72)";
  var ACCENT_COLOR = "rgba(246, 204, 70, 0.95)"; // GSSA gold
  var LINK_RGB = "126, 168, 235"; // light tint of GSSA blue

  var nodes = [];
  var width = 0;
  var height = 0;
  var dpr = 1;
  var frame = null;
  var visible = true;

  function nodeCount() {
    // Roughly one node per 6500 css px², clamped so phones stay cheap and
    // tall desktop rails do not turn into soup. Tuned for the 17.5rem rail —
    // a sparser field left too much empty navy.
    return Math.max(34, Math.min(90, Math.round((width * height) / 6500)));
  }

  function seed() {
    nodes = [];
    var total = nodeCount();
    for (var i = 0; i < total; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * SPEED * 2,
        vy: (Math.random() - 0.5) * SPEED * 2,
        r: Math.random() * 1.6 + 1,
        accent: Math.random() < 0.12, // ~1 in 8 nodes picks up the gold
      });
    }
  }

  function resize() {
    var rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    seed();
    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Links first, so nodes sit on top of them.
    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var dx = nodes[i].x - nodes[j].x;
        var dy = nodes[i].y - nodes[j].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist >= LINK_DIST) continue;

        ctx.beginPath();
        ctx.strokeStyle =
          "rgba(" + LINK_RGB + "," + (1 - dist / LINK_DIST) * 0.4 + ")";
        ctx.lineWidth = 1;
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }

    for (var k = 0; k < nodes.length; k++) {
      var n = nodes[k];
      ctx.beginPath();
      ctx.fillStyle = n.accent ? ACCENT_COLOR : NODE_COLOR;
      ctx.arc(n.x, n.y, n.accent ? n.r + 0.4 : n.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function step() {
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.x += n.vx;
      n.y += n.vy;

      // Bounce off the edges of the rail.
      if (n.x <= 0 || n.x >= width) {
        n.vx *= -1;
        n.x = Math.max(0, Math.min(width, n.x));
      }
      if (n.y <= 0 || n.y >= height) {
        n.vy *= -1;
        n.y = Math.max(0, Math.min(height, n.y));
      }
    }
    draw();
    frame = window.requestAnimationFrame(step);
  }

  function start() {
    if (frame !== null || reduceMotion.matches || !visible) return;
    frame = window.requestAnimationFrame(step);
  }

  function stop() {
    if (frame === null) return;
    window.cancelAnimationFrame(frame);
    frame = null;
  }

  // --- wiring --------------------------------------------------------------

  resize();

  if (typeof ResizeObserver === "function") {
    new ResizeObserver(resize).observe(canvas);
  } else {
    window.addEventListener("resize", resize);
  }

  // Do not burn cycles animating a rail nobody can see.
  if (typeof IntersectionObserver === "function") {
    new IntersectionObserver(
      function (entries) {
        visible = entries[0].isIntersecting;
        visible ? start() : stop();
      },
      { threshold: 0 }
    ).observe(canvas);
  }

  document.addEventListener("visibilitychange", function () {
    document.hidden ? stop() : start();
  });

  // Respond live if the reader flips the OS motion setting.
  var onMotionChange = function () {
    if (reduceMotion.matches) {
      stop();
      draw();
    } else {
      start();
    }
  };
  if (typeof reduceMotion.addEventListener === "function") {
    reduceMotion.addEventListener("change", onMotionChange);
  } else if (typeof reduceMotion.addListener === "function") {
    reduceMotion.addListener(onMotionChange);
  }

  start();
})();
