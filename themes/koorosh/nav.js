/**
 * Koorosh navigation progressive enhancement (vanilla, no dependencies).
 *
 * Progressive enhancement contract:
 * - Without JavaScript the menu is never inaccessible: the toggle button stays
 *   hidden, the full menu renders statically, and desktop submenus open via
 *   CSS :hover/:focus-within in foundation.css.
 * - With JavaScript the "koorosh-js" class on <html> is set immediately (this
 *   file loads in <head>), before paint, so the collapsed mobile state never
 *   flashes open. All further wiring waits for DOM readiness.
 *
 * Everything interactive here is a native <button> or <a>; state is exposed
 * through aria-expanded. Navigation links remain plain crawlable anchors.
 */
(function () {
  'use strict';

  var doc = document;
  doc.documentElement.classList.add('koorosh-js');

  function ready(fn) {
    if (doc.readyState !== 'loading') {
      fn();
    } else {
      doc.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = doc.querySelector('.nav-toggle');
    if (!toggle) {
      return; // No primary menu assigned: header keeps identity + CTA only.
    }
    var nav = doc.getElementById(toggle.getAttribute('aria-controls'));
    if (!nav) {
      return;
    }

    var persian = doc.documentElement.lang === 'fa-IR';

    // --- Mobile menu toggle -------------------------------------------------
    function setNav(open) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      nav.classList.toggle('nav-open', open);
    }
    toggle.addEventListener('click', function () {
      setNav(toggle.getAttribute('aria-expanded') !== 'true');
    });
    doc.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setNav(false);
        toggle.focus();
      }
    });
    // Keep state honest when the viewport crosses into the desktop layout.
    var desktop = window.matchMedia('(min-width: 48em)');
    var resetOnDesktop = function (event) {
      if (event.matches) {
        setNav(false);
      }
    };
    if (desktop.addEventListener) {
      desktop.addEventListener('change', resetOnDesktop);
    }

    // --- Submenu toggles ----------------------------------------------------
    // Each parent item keeps its real links; an explicit <button> beside the
    // parent link owns open/close (no hover-only access, keyboard operable).
    var parents = nav.querySelectorAll('.menu-item-has-children');
    Array.prototype.forEach.call(parents, function (parent) {
      var link = parent.querySelector(':scope > a');
      if (!link) {
        return;
      }
      var button = doc.createElement('button');
      button.type = 'button';
      button.className = 'submenu-toggle';
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', (persian ? 'زیرمنوی ' : 'Submenu: ') + link.textContent.trim());

      function setSubmenu(open) {
        parent.classList.toggle('submenu-open', open);
        button.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
      button.addEventListener('click', function () {
        setSubmenu(!parent.classList.contains('submenu-open'));
      });
      // A "#" placeholder parent link opens its submenu instead of jumping.
      link.addEventListener('click', function (event) {
        if (link.getAttribute('href') === '#') {
          event.preventDefault();
          setSubmenu(!parent.classList.contains('submenu-open'));
        }
      });
      parent.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && parent.classList.contains('submenu-open')) {
          event.stopPropagation();
          setSubmenu(false);
          button.focus();
        }
      });
      link.parentNode.insertBefore(button, link.nextSibling);
    });
  });
})();
