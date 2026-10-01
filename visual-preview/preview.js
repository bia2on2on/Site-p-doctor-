(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const supportsObserver = "IntersectionObserver" in window;

  if (!reducedMotion.matches && supportsObserver) {
    document.documentElement.classList.add("has-motion");
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });

    document.querySelectorAll("[data-reveal]").forEach((item) => revealObserver.observe(item));

    const workflowTrack = document.querySelector("[data-progress]");
    if (workflowTrack) {
      const progressObserver = new IntersectionObserver((entries, observer) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        workflowTrack.classList.add("is-active");
        observer.disconnect();
      }, { threshold: 0.16 });
      progressObserver.observe(workflowTrack);
    }
  } else {
    document.querySelector("[data-progress]")?.classList.add("is-active");
  }

  const header = document.querySelector("#site-header");
  if (header) {
    let ticking = false;
    const updateHeader = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 10);
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateHeader);
    }, { passive: true });
    updateHeader();
  }

  const mobileNavigation = document.querySelector("#mobile-navigation");
  const desktopWorkflow = document.querySelector("#desktop-workflows");

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

    if (mobileNavigation && link.closest(".mobile-navigation")) mobileNavigation.open = false;
    if (desktopWorkflow && link.closest(".nav-dropdown")) desktopWorkflow.open = false;

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
    const desktopTabs = window.matchMedia("(min-width: 1121px)");

    if (tablist && tabs.length === 6 && panels.length === tabs.length) {
      const panelFor = (tab) => settingsLayout.querySelector(`#${CSS.escape(tab.getAttribute("aria-controls"))}`);
      const tabFromHash = tabs.find((tab) => `#${tab.getAttribute("aria-controls")}` === window.location.hash);
      let statusAnimationTimer = 0;

      const syncOrientation = () => tablist.setAttribute("aria-orientation", desktopTabs.matches ? "vertical" : "horizontal");
      syncOrientation();
      if (desktopTabs.addEventListener) desktopTabs.addEventListener("change", syncOrientation);
      else desktopTabs.addListener(syncOrientation);

      const activateTab = (activeTab, updateHash = false) => {
        settingsLayout.dataset.tabsEnhanced = "true";
        panels.forEach((panel) => panel.classList.remove("is-entering"));
        tabs.forEach((tab) => {
          const active = tab === activeTab;
          tab.classList.toggle("is-active", active);
          tab.setAttribute("aria-selected", String(active));
          tab.tabIndex = active ? 0 : -1;
          const panel = panelFor(tab);
          if (panel) panel.hidden = !active;
        });

        const activePanel = panelFor(activeTab);
        if (activePanel && activeTab.id === "tab-status" && !reducedMotion.matches) {
          window.clearTimeout(statusAnimationTimer);
          activePanel.classList.add("is-entering");
          statusAnimationTimer = window.setTimeout(() => activePanel.classList.remove("is-entering"), 700);
        }
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
        syncOrientation();
        const currentIndex = tabs.indexOf(document.activeElement);
        if (currentIndex < 0) return;
        const vertical = desktopTabs.matches;
        const rtl = getComputedStyle(tablist).direction === "rtl";
        let nextIndex = currentIndex;

        if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = tabs.length - 1;
        else if (vertical && event.key === "ArrowDown") nextIndex = (currentIndex + 1) % tabs.length;
        else if (vertical && event.key === "ArrowUp") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        else if (!vertical && event.key === "ArrowLeft") nextIndex = (currentIndex + (rtl ? 1 : -1) + tabs.length) % tabs.length;
        else if (!vertical && event.key === "ArrowRight") nextIndex = (currentIndex + (rtl ? -1 : 1) + tabs.length) % tabs.length;
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
