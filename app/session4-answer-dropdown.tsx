"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Select } from "radix-ui";
import type { LocalizedText } from "./course-data";
import { Session3Text as Text } from "./session3-translation";

export function ExpoAnswerDropdown({ label, name, value, options, onChange, disabled }: {
  label: LocalizedText;
  name?: string;
  value: string;
  options: { id: string; label: LocalizedText }[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const field = useRef<HTMLDivElement>(null);
  const [container,setContainer] = useState<HTMLElement | null>(null);
  useEffect(() => {
    // Keep the menu inside the translation scope while the floating panel escapes the card.
    setContainer(field.current?.closest<HTMLElement>(".session4-lesson") ?? null);
  }, []);

  return <div className="expo-answer-field" ref={field}>
    <span><Text value={label}/></span>
    <Select.Root value={value} onValueChange={onChange} disabled={disabled}>
      <Select.Trigger className="expo-answer-trigger" aria-label={name ?? label.fr}>
        <Select.Value placeholder="Choisir…"/>
        <Select.Icon asChild><ChevronDown size={16} aria-hidden="true"/></Select.Icon>
      </Select.Trigger>
      {container && <Select.Portal container={container}>
        <Select.Content position="popper" sideOffset={5} collisionPadding={10} className="expo-answer-menu">
          <Select.Viewport>
            {options.map(option => <Select.Item key={option.id} value={option.id} data-s3-ar={option.label.ar} className="expo-answer-option">
              <Select.ItemText>{option.label.fr}</Select.ItemText>
              <Select.ItemIndicator asChild><Check size={15} aria-hidden="true"/></Select.ItemIndicator>
            </Select.Item>)}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>}
    </Select.Root>
  </div>;
}
