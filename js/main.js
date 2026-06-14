/* ============================================================
   GAURAV THAKUR PORTFOLIO — main.js
   - Typewriter effect (preserved from original)
   - Scroll reveal
   - Navbar scroll state + mobile toggle
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
  var fullTxt = this.toRotate[i];

  this.txt = this.isDeleting
    ? fullTxt.substring(0, this.txt.length - 1)
    : fullTxt.substring(0, this.txt.length + 1);

  this.el.innerHTML = '<span class="wrap">' + this.txt + "</span>";

  var that = this;
  var delta = 200 - Math.random() * 100;

  if (this.isDeleting) {
    delta /= 5;
  }

  if (!this.isDeleting && this.txt === fullTxt) {
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

/* ── SCROLL REVEAL ── */
function initScrollReveal() {
  var targets = document.querySelectorAll(
    ".section-title, .section-label, .about-text, .about-card-stack, " +
      ".skill-category, .timeline-item, .project-card, .contact-sub, .contact-email-btn, .contact-socials",
  );

  targets.forEach(function (el) {
    el.classList.add("reveal");
  });

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          // Staggered delay based on index among siblings
          var siblings = entry.target.parentElement
            ? Array.from(entry.target.parentElement.children)
            : [];
          var idx = siblings.indexOf(entry.target);
          var delay = idx >= 0 ? Math.min(idx * 80, 400) : 0;
          setTimeout(function () {
            entry.target.classList.add("visible");
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
  );

  targets.forEach(function (el) {
    observer.observe(el);
  });
}

/* ── NAVBAR ── */
function initNavbar() {
  var navbar = document.getElementById("navbar");
  var toggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");

  // Scroll state
  window.addEventListener(
    "scroll",
    function () {
      if (window.scrollY > 40) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    },
    { passive: true },
  );

  // Mobile toggle
  if (toggle && navLinks) {
    toggle.addEventListener("click", function () {
      navLinks.classList.toggle("open");
      var isOpen = navLinks.classList.contains("open");
      toggle.setAttribute("aria-expanded", isOpen);
    });

    // Close on link click
    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Active link highlighting on scroll
  var sections = document.querySelectorAll("section[id], footer[id]");
  var navItems = document.querySelectorAll(".nav-link");

  window.addEventListener(
    "scroll",
    function () {
      var scrollPos = window.scrollY + 80;
      sections.forEach(function (sec) {
        if (
          scrollPos >= sec.offsetTop &&
          scrollPos < sec.offsetTop + sec.offsetHeight
        ) {
          navItems.forEach(function (a) {
            a.classList.remove("active");
          });
          var active = document.querySelector(
            '.nav-link[href="#' + sec.id + '"]',
          );
          if (active) active.classList.add("active");
        }
      });
    },
    { passive: true },
  );
}

/* ── SMOOTH ANCHOR SCROLL ── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var target = document.querySelector(this.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

/* ── COPY TO CLIPBOARD (kept for compatibility) ── */
function copyToClipboard(el) {
  if (el && el.href) {
    navigator.clipboard.writeText(el.href).catch(function () {});
  }
}

/* ── INIT ── */
window.addEventListener("DOMContentLoaded", function () {
  // Typewriter
  var elements = document.getElementsByClassName("typewrite");
  for (var i = 0; i < elements.length; i++) {
    var toRotate = elements[i].getAttribute("data-type");
    var period = elements[i].getAttribute("data-period");
    if (toRotate) {
      new TxtType(elements[i], JSON.parse(toRotate), period);
    }
  }

  initNavbar();
  initSmoothScroll();
  initScrollReveal();
});

/* Active nav link style is injected via JS to avoid FOUC */
(function () {
  var style = document.createElement("style");
  style.textContent = ".nav-link.active { color: var(--accent) !important; }";
  document.head.appendChild(style);
})();
