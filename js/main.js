/* ============================================================
   GAURAV THAKUR — Data Engineer Portfolio · main.js
   Effects: Atom Network · Cursor Glow · Scroll Beam · DE Anim
   ============================================================ */

/* ── TYPEWRITER ── */
var TxtType = function (el, toRotate, period) {
  this.toRotate = toRotate;
  this.el = el;
  this.loopNum = 0;
  this.period = parseInt(period, 10) || 2000;
  this.txt = "";
  this.isDeleting = false;
  this.tick();
};
TxtType.prototype.tick = function () {
  var i = this.loopNum % this.toRotate.length;
  var full = this.toRotate[i];
  this.txt = this.isDeleting
    ? full.substring(0, this.txt.length - 1)
    : full.substring(0, this.txt.length + 1);
  this.el.innerHTML = '<span class="wrap">' + this.txt + "</span>";
  var that = this,
    delta = 200 - Math.random() * 100;
  if (this.isDeleting) delta /= 4;
  if (!this.isDeleting && this.txt === full) {
    delta = this.period / 4;
    this.isDeleting = true;
  } else if (this.isDeleting && this.txt === "") {
    this.isDeleting = false;
    this.loopNum++;
    delta = 500;
  }
  setTimeout(function () {
    that.tick();
  }, delta);
};

/* ══════════════════════════════════════════
   ATOM NETWORK BACKGROUND
   Nodes float + connect with bond lines,
   cursor proximity lights them up
   ══════════════════════════════════════════ */
function initAtomNetwork() {
  var canvas = document.getElementById("atom-canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var W,
    H,
    nodes = [];
  var mouse = { x: -9999, y: -9999 };
  var CONNECT_DIST = 140;
  var NODE_COUNT = 70;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener(
    "mousemove",
    function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    },
    { passive: true },
  );

  // Node types — data engineering themed
  var types = [
    { col: "rgba(0,229,204,", r: 3, glow: "rgba(0,229,204,0.6)" }, // teal — data nodes
    { col: "rgba(124,108,250,", r: 2.5, glow: "rgba(124,108,250,0.5)" }, // purple — transform nodes
    { col: "rgba(245,166,35,", r: 2, glow: "rgba(245,166,35,0.5)" }, // amber — cert/output nodes
    { col: "rgba(40,202,65,", r: 1.5, glow: "rgba(40,202,65,0.5)" }, // green — health check nodes
  ];

  for (var i = 0; i < NODE_COUNT; i++) {
    var t = types[Math.floor(Math.random() * types.length)];
    nodes.push({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: t.r,
      baseAlpha: Math.random() * 0.45 + 0.15,
      col: t.col,
      glow: t.glow,
      pulse: Math.random() * Math.PI * 2, // phase offset for pulsing
    });
  }

  var tick = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    tick++;

    nodes.forEach(function (n) {
      // move
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < -20) n.x = W + 20;
      if (n.x > W + 20) n.x = -20;
      if (n.y < -20) n.y = H + 20;
      if (n.y > H + 20) n.y = -20;

      // cursor proximity boost
      var dx = n.x - mouse.x,
        dy = n.y - mouse.y;
      var mdist = Math.sqrt(dx * dx + dy * dy);
      var boost = mdist < 200 ? (1 - mdist / 200) * 0.8 : 0;

      // pulsing alpha
      var alpha =
        n.baseAlpha + Math.sin(tick * 0.018 + n.pulse) * 0.1 + boost * 0.6;
      alpha = Math.min(alpha, 1);

      // draw node
      if (boost > 0.05) {
        // cursor glow on nearby nodes
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + boost * 8, 0, Math.PI * 2);
        var grad = ctx.createRadialGradient(
          n.x,
          n.y,
          0,
          n.x,
          n.y,
          n.r + boost * 8,
        );
        grad.addColorStop(0, n.col + alpha * 0.8 + ")");
        grad.addColorStop(1, n.col + "0)");
        ctx.fillStyle = grad;
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = n.col + alpha + ")";
      ctx.fill();
    });

    // draw bonds between close nodes
    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var a = nodes[i],
          b = nodes[j];
        var dx = a.x - b.x,
          dy = a.y - b.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          var lineAlpha = (1 - dist / CONNECT_DIST) * 0.18;
          // cursor proximity brightens bonds too
          var adx = (a.x + b.x) / 2 - mouse.x,
            ady = (a.y + b.y) / 2 - mouse.y;
          var mBoost = Math.max(0, 1 - Math.sqrt(adx * adx + ady * ady) / 250);
          lineAlpha += mBoost * 0.35;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = "rgba(0,229,204," + lineAlpha + ")";
          ctx.lineWidth = lineAlpha > 0.25 ? 1.2 : 0.6;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════
   CURSOR GLOW — soft light follows cursor
   ══════════════════════════════════════════ */
function initCursorGlow() {
  var glow = document.getElementById("cursor-glow");
  if (!glow) return;
  var tx = 0,
    ty = 0,
    cx = 0,
    cy = 0;
  window.addEventListener(
    "mousemove",
    function (e) {
      tx = e.clientX;
      ty = e.clientY;
      glow.style.opacity = "1";
    },
    { passive: true },
  );
  // smooth lerp follow
  function loop() {
    cx += (tx - cx) * 0.09;
    cy += (ty - cy) * 0.09;
    glow.style.left = cx + "px";
    glow.style.top = cy + "px";
    requestAnimationFrame(loop);
  }
  loop();
  // hide when mouse leaves window
  document.addEventListener("mouseleave", function () {
    glow.style.opacity = "0";
  });
}

/* ══════════════════════════════════════════
   SCROLL BEAM — bright light sweeps on scroll
   ══════════════════════════════════════════ */
function initScrollBeam() {
  var beam = document.getElementById("scroll-beam");
  if (!beam) return;
  var lastScroll = window.scrollY;
  var beamTimer = null;
  var beamPos = 0;
  var animating = false;

  function showBeam(fromY) {
    beam.style.top = fromY + "px";
    beam.style.opacity = "1";
    animating = true;
    var start = null;
    var distance = window.innerHeight * 0.4; // travel 40vh

    function step(ts) {
      if (!start) start = ts;
      var elapsed = ts - start;
      var progress = Math.min(elapsed / 500, 1); // 500ms sweep
      var ease = 1 - Math.pow(1 - progress, 2);
      beam.style.top = fromY + ease * distance + "px";
      beam.style.opacity = String(
        progress < 0.5 ? progress * 2 : (1 - progress) * 2,
      );
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        beam.style.opacity = "0";
        animating = false;
      }
    }
    requestAnimationFrame(step);
  }

  var throttle = false;
  window.addEventListener(
    "scroll",
    function () {
      if (throttle) return;
      throttle = true;
      setTimeout(function () {
        throttle = false;
      }, 60);
      var currentScroll = window.scrollY;
      if (!animating && Math.abs(currentScroll - lastScroll) > 5) {
        showBeam(currentScroll > lastScroll ? 0 : window.innerHeight);
      }
      lastScroll = currentScroll;
    },
    { passive: true },
  );
}

/* ══════════════════════════════════════════
   DATA ENGINEER ANIMATION SECTION
   ══════════════════════════════════════════ */
function initDESection() {
  // Animate pipeline stages in on scroll
  var pipeline = document.getElementById("dePipelineAnim");
  if (!pipeline) return;

  var obs = new IntersectionObserver(
    function (entries) {
      if (!entries[0].isIntersecting) return;
      // Cascade stages in
      var stages = pipeline.querySelectorAll(".de-stage, .de-arrow");
      stages.forEach(function (el, i) {
        setTimeout(function () {
          el.classList.add("de-in");
        }, i * 150);
      });
      // Animate log lines
      var logs = document.querySelectorAll(".de-log-line");
      logs.forEach(function (l, i) {
        setTimeout(
          function () {
            l.classList.add("log-in");
          },
          800 + i * 400,
        );
      });
      // Animate live metrics
      animateMetric("metricRows", 2417832, "", 2000, formatBig);
      animateMetric("metricPassed", 142, "", 1800, null);
      animateMetric("metricLatency", 3100, "ms", 2200, null);
      obs.disconnect();
    },
    { threshold: 0.25 },
  );
  obs.observe(pipeline);
}

function formatBig(n) {
  return n >= 1000000
    ? (n / 1000000).toFixed(1) + "M"
    : n >= 1000
      ? (n / 1000).toFixed(0) + "K"
      : String(n);
}

function animateMetric(id, target, suffix, dur, fmt) {
  var el = document.getElementById(id);
  if (!el) return;
  var start = null;
  function step(ts) {
    if (!start) start = ts;
    var p = Math.min((ts - start) / dur, 1);
    var e = 1 - Math.pow(1 - p, 3);
    var v = Math.floor(e * target);
    el.textContent = (fmt ? fmt(v) : v) + suffix;
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = (fmt ? fmt(target) : target) + suffix;
  }
  requestAnimationFrame(step);
}

/* ── STAT COUNTERS ── */
function initCounters() {
  document.querySelectorAll("[data-target]").forEach(function (el) {
    var fired = false;
    new IntersectionObserver(
      function (entries) {
        if (!entries[0].isIntersecting || fired) return;
        fired = true;
        var target = parseFloat(el.dataset.target);
        var suffix = el.dataset.suffix || "";
        var start = null,
          dur = 1400;
        (function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var e = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.floor(e * target) + suffix;
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = target + suffix;
        })(performance.now());
      },
      { threshold: 0.5 },
    ).observe(el);
  });
}

/* ── CARD FLIP ── */
window.flipCard = function (id) {
  var c = document.getElementById(id);
  if (c) c.classList.toggle("flipped");
};

/* ── SKILL TAG STAGGER ── */
function initSkillStagger() {
  document.querySelectorAll(".skill-group").forEach(function (g) {
    new IntersectionObserver(
      function (entries) {
        if (!entries[0].isIntersecting) return;
        g.querySelectorAll(".stag").forEach(function (t, i) {
          t.style.transitionDelay = i * 48 + "ms";
        });
        g.classList.add("tags-in");
      },
      { threshold: 0.2 },
    ).observe(g);
  });
}

/* ── SECTION BEAM (left progress line) ── */
function initBeam() {
  var beam = document.getElementById("sectionBeam");
  if (!beam) return;
  function update() {
    var scrolled = window.scrollY;
    var total = document.body.scrollHeight - window.innerHeight;
    var h = (scrolled / total) * (window.innerHeight - 60);
    beam.style.height = Math.max(0, h) + "px";
    beam.style.opacity = scrolled > 80 ? "1" : "0";
  }
  window.addEventListener("scroll", update, { passive: true });
  update();
}

/* ── SCROLL REVEAL ── */
function initReveal() {
  var els = document.querySelectorAll(
    ".section-heading,.section-eyebrow,.section-sub,.about-text,.about-aside," +
      ".principle-card,.proj-card,.rec-card,.skill-group," +
      ".exp-item,.cert-card,.cert-rec,.contact-email,.contact-sub,.contact-socials," +
      ".project-recs,.cert-recs,.de-metrics-row,.de-terminal",
  );
  els.forEach(function (el) {
    el.classList.add("reveal");
  });
  new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var sibs = entry.target.parentElement
          ? Array.from(entry.target.parentElement.children)
          : [];
        var delay = Math.min(sibs.indexOf(entry.target) * 65, 320);
        setTimeout(function () {
          entry.target.classList.add("visible");
        }, delay);
      });
    },
    { threshold: 0.07, rootMargin: "0px 0px -40px 0px" },
  ).observe.call(
    new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var sibs = e.target.parentElement
            ? Array.from(e.target.parentElement.children)
            : [];
          setTimeout(
            function () {
              e.target.classList.add("visible");
            },
            Math.min(sibs.indexOf(e.target) * 65, 320),
          );
        });
      },
      { threshold: 0.07, rootMargin: "0px 0px -40px 0px" },
    ),
    document.body,
  );
  // Re-do correctly
  var revObs = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var sibs = entry.target.parentElement
          ? Array.from(entry.target.parentElement.children)
          : [];
        var delay = Math.min(sibs.indexOf(entry.target) * 65, 320);
        setTimeout(function () {
          entry.target.classList.add("visible");
        }, delay);
        revObs.unobserve(entry.target);
      });
    },
    { threshold: 0.07, rootMargin: "0px 0px -40px 0px" },
  );
  els.forEach(function (el) {
    revObs.observe(el);
  });
}

/* ── NAVBAR ── */
function initNavbar() {
  var nb = document.getElementById("navbar");
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  window.addEventListener(
    "scroll",
    function () {
      nb.classList.toggle("scrolled", window.scrollY > 40);
    },
    { passive: true },
  );
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", links.classList.contains("open"));
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }
  var secs = document.querySelectorAll("section[id]");
  var navAs = document.querySelectorAll(".nav-link");
  window.addEventListener(
    "scroll",
    function () {
      var pos = window.scrollY + 80;
      secs.forEach(function (s) {
        if (pos >= s.offsetTop && pos < s.offsetTop + s.offsetHeight) {
          navAs.forEach(function (a) {
            a.classList.remove("active");
          });
          var act = document.querySelector('.nav-link[href="#' + s.id + '"]');
          if (act) act.classList.add("active");
        }
      });
    },
    { passive: true },
  );
}

/* ── SMOOTH SCROLL ── */
function initScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var t = document.querySelector(this.getAttribute("href"));
      if (t) {
        e.preventDefault();
        t.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

/* ── INIT ── */
window.addEventListener("DOMContentLoaded", function () {
  Array.from(document.getElementsByClassName("typewrite")).forEach(
    function (el) {
      var r = el.getAttribute("data-type"),
        p = el.getAttribute("data-period");
      if (r) new TxtType(el, JSON.parse(r), p);
    },
  );
  initAtomNetwork();
  initCursorGlow();
  initScrollBeam();
  initNavbar();
  initScroll();
  initReveal();
  initSkillStagger();
  initCounters();
  initBeam();
  initDESection();
});

(function () {
  var s = document.createElement("style");
  s.textContent =
    ".nav-link.active{color:var(--accent)!important;background:var(--accent-dim)!important}";
  document.head.appendChild(s);
})();

/* ── THEME TOGGLE ── */
(function () {
  var btn = document.getElementById("themeToggle");
  var icon = document.getElementById("themeIcon");
  if (!btn) return;

  // Restore saved preference
  if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light-mode");
    icon.className = "fa-solid fa-sun";
  }

  btn.addEventListener("click", function () {
    var isLight = document.body.classList.toggle("light-mode");
    icon.className = isLight ? "fa-solid fa-sun" : "fa-solid fa-moon";
    localStorage.setItem("theme", isLight ? "light" : "dark");
  });
})();
