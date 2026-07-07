import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const NO_SCROLL_ROUTES = ["/application-dashboard"];

export const AutoScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const shouldSkip = NO_SCROLL_ROUTES.some((route) =>
      pathname.includes(route),
    );

    if (shouldSkip) {
      return;
    }

    // 2. Scroll to top instantly (overriding any smooth scroll CSS)
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // Force instant jump for "native" feel
    });

    // 3. Accessibility: Focus management
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      mainContent.style.outline = "none";

      mainContent.setAttribute("tabIndex", "-1");
      mainContent.focus({ preventScroll: true });
    }
  }, [pathname]);

  return null;
};

export default AutoScrollToTop;