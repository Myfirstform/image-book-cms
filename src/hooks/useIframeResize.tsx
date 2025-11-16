import { useEffect } from "react";

/**
 * Hook to automatically send height updates to parent window when embedded in iframe
 * Uses ResizeObserver and MutationObserver for dynamic content changes
 */
export const useIframeResize = () => {
  useEffect(() => {
    const sendHeight = () => {
      const height = document.body.scrollHeight;
      parent.postMessage({ type: "resize", height, iframeHeight: height }, "*");
    };

    // Send initial height
    sendHeight();

    // ResizeObserver for element size changes
    const resizeObserver = new ResizeObserver(() => {
      sendHeight();
    });

    resizeObserver.observe(document.body);

    // MutationObserver for DOM changes (add/delete/edit content)
    const mutationObserver = new MutationObserver(() => {
      sendHeight();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    // Image load handler
    const handleImageLoad = () => sendHeight();
    const images = document.querySelectorAll("img");
    images.forEach((img) => {
      if (!img.complete) {
        img.addEventListener("load", handleImageLoad);
      }
    });

    // Window resize fallback
    window.addEventListener("resize", sendHeight);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", sendHeight);
      images.forEach((img) => {
        img.removeEventListener("load", handleImageLoad);
      });
    };
  }, []);
};
