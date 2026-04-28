(() => {
    const views = Array.from(document.querySelectorAll("[data-view]"));
    const tabs = Array.from(document.querySelectorAll("[data-view-target]"));
    const validViews = new Set(views.map((view) => view.dataset.view));

    function getRequestedView() {
        const hashView = window.location.hash.replace("#", "");
        if (validViews.has(hashView)) {
            return hashView;
        }

        const fileName = window.location.pathname.split("/").pop();
        if (fileName === "personal.html") {
            return "personal";
        }

        return document.body.dataset.initialView || "home";
    }

    function getCanonicalUrl(view) {
        const path = window.location.pathname.replace(/personal\.html$/, "index.html");
        const search = window.location.search;
        return view === "personal" ? `${path}${search}#personal` : `${path}${search}`;
    }

    function setView(view, shouldUpdateHistory = false) {
        const nextView = validViews.has(view) ? view : "home";

        views.forEach((panel) => {
            const isActive = panel.dataset.view === nextView;
            panel.hidden = !isActive;
            panel.classList.toggle("is-active", isActive);
        });

        tabs.forEach((tab) => {
            const isActive = tab.dataset.viewTarget === nextView;
            tab.setAttribute("aria-selected", String(isActive));
            tab.tabIndex = isActive ? 0 : -1;
        });

        document.title = nextView === "personal"
            ? "George Barrone - Personal About Me"
            : "George Barrone - Developer & Engineer";

        if (shouldUpdateHistory) {
            try {
                window.history.pushState({ view: nextView }, "", getCanonicalUrl(nextView));
            } catch {
                // Some local file previews reject URL updates; the view has already switched.
            }
        }
    }

    tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => {
            setView(tab.dataset.viewTarget, true);
        });

        tab.addEventListener("keydown", (event) => {
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
                return;
            }

            event.preventDefault();
            const direction = event.key === "ArrowRight" ? 1 : -1;
            const nextIndex = (index + direction + tabs.length) % tabs.length;
            tabs[nextIndex].focus();
            setView(tabs[nextIndex].dataset.viewTarget, true);
        });
    });

    window.addEventListener("popstate", () => {
        setView(getRequestedView());
    });

    setView(getRequestedView());
})();
