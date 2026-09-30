(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const hasMotionSupport = "IntersectionObserver" in window;

  if (!reducedMotion.matches && hasMotionSupport) {
    document.documentElement.classList.add("has-motion");
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -4% 0px" });

    document.querySelectorAll("[data-reveal]").forEach((item) => revealObserver.observe(item));
  }

  const header = document.querySelector("#site-header");
  if (header) {
    const updateHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  const mobileNavigation = document.querySelector("#mobile-navigation");
  const desktopWorkflow = document.querySelector("#desktop-workflows");
  const desktopHover = window.matchMedia("(hover: hover) and (min-width: 901px)");

  if (desktopWorkflow) {
    const desktopWorkflowSummary = desktopWorkflow.querySelector(":scope > summary");
    desktopWorkflowSummary?.addEventListener("click", (event) => {
      if (desktopHover.matches && desktopWorkflow.matches(":hover")) {
        event.preventDefault();
        desktopWorkflow.open = true;
      }
    });
    desktopWorkflow.addEventListener("pointerenter", (event) => {
      if (desktopHover.matches && event.pointerType === "mouse") desktopWorkflow.open = true;
    });
    desktopWorkflow.addEventListener("pointerleave", (event) => {
      if (!desktopHover.matches || event.pointerType !== "mouse") return;
      if (event.relatedTarget && desktopWorkflow.contains(event.relatedTarget)) return;
      window.setTimeout(() => {
        if (!desktopWorkflow.matches(":hover") && !desktopWorkflow.contains(document.activeElement)) {
          desktopWorkflow.open = false;
        }
      }, 140);
    });
    desktopWorkflow.addEventListener("focusout", () => {
      window.setTimeout(() => {
        if (!desktopWorkflow.matches(":hover") && !desktopWorkflow.contains(document.activeElement)) {
          desktopWorkflow.open = false;
        }
      }, 0);
    });
  }

  document.addEventListener("pointerdown", (event) => {
    if (desktopWorkflow && !desktopWorkflow.contains(event.target)) desktopWorkflow.open = false;
    if (mobileNavigation && !mobileNavigation.contains(event.target)) mobileNavigation.open = false;
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const openDisclosures = [...document.querySelectorAll("details[open]")].reverse();
    const disclosure = openDisclosures.find((item) => item.closest(".desktop-nav, .mobile-navigation"));
    if (!disclosure) return;
    event.preventDefault();
    disclosure.open = false;
    disclosure.querySelector(":scope > summary")?.focus();
  });

  const toast = document.querySelector("#preview-toast");
  let toastTimer = 0;
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;

    if (mobileNavigation && link.closest(".mobile-navigation")) {
      mobileNavigation.open = false;
    }
    if (desktopWorkflow && link.closest(".nav-dropdown")) {
      desktopWorkflow.open = false;
    }

    if (link.matches("[data-demo-cta]") && toast) {
      toast.textContent = "در این پیش‌نمایش هیچ درخواستی ثبت یا ارسال نمی‌شود.";
      toast.hidden = false;
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => { toast.hidden = true; }, 3600);
    }
  });

  const settingsLayout = document.querySelector("[data-settings-tabs]");
  if (settingsLayout) {
    const tablist = settingsLayout.querySelector('[role="tablist"]');
    const tabs = [...settingsLayout.querySelectorAll('[role="tab"]')];
    const panels = [...settingsLayout.querySelectorAll('[role="tabpanel"]')];

    if (tablist && tabs.length && panels.length === tabs.length) {
      const panelFor = (tab) => settingsLayout.querySelector(`#${CSS.escape(tab.getAttribute("aria-controls"))}`);
      const tabFromHash = tabs.find((tab) => `#${tab.getAttribute("aria-controls")}` === window.location.hash);

      const activateTab = (activeTab, updateHash = false) => {
        settingsLayout.dataset.tabsEnhanced = "true";
        tabs.forEach((tab) => {
          const active = tab === activeTab;
          tab.classList.toggle("is-active", active);
          tab.setAttribute("aria-selected", String(active));
          tab.tabIndex = active ? 0 : -1;
          const panel = panelFor(tab);
          if (panel) panel.hidden = !active;
        });
        if (updateHash) window.history.replaceState(null, "", `#${activeTab.getAttribute("aria-controls")}`);
      };

      activateTab(tabFromHash || tabs[0]);

      tabs.forEach((tab) => {
        tab.addEventListener("click", (event) => {
          event.preventDefault();
          activateTab(tab, true);
        });
      });

      tablist.addEventListener("keydown", (event) => {
        const currentIndex = tabs.indexOf(document.activeElement);
        if (currentIndex < 0) return;
        let nextIndex = currentIndex;
        const vertical = tablist.getAttribute("aria-orientation") === "vertical" && window.matchMedia("(min-width: 901px)").matches;
        const rtl = getComputedStyle(tablist).direction === "rtl";

        if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = tabs.length - 1;
        else if (vertical && event.key === "ArrowDown") nextIndex = (currentIndex + 1) % tabs.length;
        else if (vertical && event.key === "ArrowUp") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        else if (!vertical && event.key === "ArrowRight") nextIndex = (currentIndex + (rtl ? -1 : 1) + tabs.length) % tabs.length;
        else if (!vertical && event.key === "ArrowLeft") nextIndex = (currentIndex + (rtl ? 1 : -1) + tabs.length) % tabs.length;
        else return;

        event.preventDefault();
        tabs[nextIndex].focus();
        activateTab(tabs[nextIndex], true);
      });

      window.addEventListener("hashchange", () => {
        const matchingTab = tabs.find((tab) => `#${tab.getAttribute("aria-controls")}` === window.location.hash);
        if (matchingTab) activateTab(matchingTab);
      });
    }
  }
})();
