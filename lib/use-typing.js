import { useEffect, useState } from "react";

const isTextField = (el) => Boolean(el?.matches?.("input:not([type=checkbox]):not([type=radio]):not([type=file]), select, textarea"));

// True while the visitor is typing in a form field (used to move floating buttons out of the way on phones).
export function useTyping() {
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    const update = () => setTyping(isTextField(document.activeElement));
    // focusout fires before the next field gets focus, so read the active element a frame later.
    const later = () => requestAnimationFrame(update);
    document.addEventListener("focusin", update);
    document.addEventListener("focusout", later);
    return () => {
      document.removeEventListener("focusin", update);
      document.removeEventListener("focusout", later);
    };
  }, []);
  return typing;
}
