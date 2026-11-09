"use client";

import { createContext, useContext, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { LocalizedText } from "./course-data";

const TranslationMode = createContext(false);
export const useSession3Translation = () => useContext(TranslationMode);

/** One French phrase is one translation target, including inside answer controls. */
export function Session3Text({ value, className = "" }: { value: LocalizedText; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const translated = Boolean(value.ar.trim()) && value.fr.trim().toLocaleLowerCase() !== value.ar.trim().toLocaleLowerCase();
  useEffect(() => {
    const phrase = ref.current;
    if (!phrase) return;
    // Buttons and links already have a keyboard stop; plain text needs its own.
    if (translated && !phrase.closest("button, a[href], input, select, textarea, [role='button'], [role='radio']")) phrase.tabIndex = 0;
    else phrase.removeAttribute("tabindex");
  }, [translated, value.fr]);
  return <span ref={ref} className={`s3-phrase ${className}`.trim()} lang="fr" dir="ltr" data-s3-ar={translated ? value.ar : undefined}>{value.fr}</span>;
}

type Translation = { target: HTMLElement; text: string };

export function Session3TranslationScope({ enabled, scopeKey, children }: { enabled: boolean; scopeKey: string; children: ReactNode }) {
  const tooltipId = `s3-translation-${useId().replaceAll(":", "")}`;
  const [translation, setTranslation] = useState<Translation | null>(null);
  const [position, setPosition] = useState({ left: 12, top: 12 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    let current: HTMLElement | null = null;
    let previousDescription: string | null = null;
    function hide() {
      if (current) {
        if (previousDescription) current.setAttribute("aria-describedby", previousDescription);
        else current.removeAttribute("aria-describedby");
      }
      current = null;
      previousDescription = null;
      setTranslation(null);
    }
    function show(phrase: HTMLElement | null) {
      if (!phrase?.dataset.s3Ar || !phrase.closest(".session3-theme") || phrase.closest("[hidden], [aria-hidden='true']")) { hide(); return; }
      if (phrase === current) return;
      hide();
      current = phrase;
      previousDescription = phrase.getAttribute("aria-describedby");
      phrase.setAttribute("aria-describedby", [previousDescription, tooltipId].filter(Boolean).join(" "));
      setTranslation({ target: phrase, text: phrase.dataset.s3Ar });
    }
    function targetOf(event: Event, keyboard = false) {
      const target = event.target;
      if (!(target instanceof Element)) return null;
      return target.closest<HTMLElement>("[data-s3-ar]")
        ?? (keyboard && target.matches("button, a[href], [role='button'], [role='radio']") ? target.querySelector<HTMLElement>("[data-s3-ar]") : null);
    }
    const pointerOver = (event: PointerEvent) => { if (event.pointerType !== "touch") show(targetOf(event)); };
    const pointerOut = (event: PointerEvent) => {
      if (current && (!(event.relatedTarget instanceof Node) || !current.contains(event.relatedTarget))) hide();
    };
    const focus = (event: FocusEvent) => show(targetOf(event, true));
    const key = (event: KeyboardEvent) => { if (event.key === "Escape") hide(); };
    const touch = (event: PointerEvent) => { if (event.pointerType === "touch") show(targetOf(event)); };
    const touchEnd = (event: PointerEvent) => { if (event.pointerType === "touch") hide(); };
    document.addEventListener("pointerover", pointerOver);
    document.addEventListener("pointerout", pointerOut);
    document.addEventListener("focusin", focus);
    document.addEventListener("focusout", hide);
    document.addEventListener("keydown", key);
    document.addEventListener("pointerdown", touch);
    document.addEventListener("pointerup", touchEnd);
    document.addEventListener("pointercancel", hide);
    document.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    window.addEventListener("blur", hide);
    document.addEventListener("fullscreenchange", hide);
    return () => {
      hide();
      document.removeEventListener("pointerover", pointerOver);
      document.removeEventListener("pointerout", pointerOut);
      document.removeEventListener("focusin", focus);
      document.removeEventListener("focusout", hide);
      document.removeEventListener("keydown", key);
      document.removeEventListener("pointerdown", touch);
      document.removeEventListener("pointerup", touchEnd);
      document.removeEventListener("pointercancel", hide);
      document.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
      window.removeEventListener("blur", hide);
      document.removeEventListener("fullscreenchange", hide);
    };
  }, [enabled, scopeKey, tooltipId]);

  useLayoutEffect(() => {
    if (!translation || !tooltipRef.current) return;
    const phrase = translation.target.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();
    const left = Math.max(11, Math.min(window.innerWidth - tooltip.width - 11, phrase.left + (phrase.width - tooltip.width) / 2));
    const above = phrase.top - tooltip.height - 10;
    const top = Math.max(11, Math.min(window.innerHeight - tooltip.height - 11, above >= 11 ? above : phrase.bottom + 10));
    setPosition({ left, top });
  }, [translation]);

  return <TranslationMode.Provider value={enabled}>
    {children}
    {enabled && translation && createPortal(<div ref={tooltipRef} id={tooltipId} className="s3-translation-tooltip" role="tooltip" lang="ar" dir="rtl" style={position}>{translation.text}</div>, document.fullscreenElement ?? document.body)}
  </TranslationMode.Provider>;
}
