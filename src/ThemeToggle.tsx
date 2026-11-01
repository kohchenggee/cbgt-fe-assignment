import { Switch, ToggleGroup } from "radix-ui";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useCallback, useState } from "react";

type Theme = "light" | "dark";
type Segment = "retail" | "premium";

export const segmentLabels: Record<Segment, string> = {
  retail: "Retail",
  premium: "Premium",
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    return (document.documentElement.dataset.theme as Theme) || "light";
  });

  const [segment, setSegment] = useState<Segment>(() => {
    return (document.documentElement.dataset.segment as Segment) || "retail";
  });

  const updateTheme = useCallback((newTheme: Theme) => {
    document.documentElement.dataset.theme = newTheme;
    localStorage.setItem("theme", newTheme);
    setTheme(newTheme);
  }, []);

  const updateSegment = useCallback((newSegment: Segment) => {
    document.documentElement.dataset.segment = newSegment;
    setSegment(newSegment);
  }, []);

  return (
    <div className="theme-controls">
      <div className="segment-control">
        <label htmlFor="segment-switch" className="segment-control__label">
          {segmentLabels[segment]}
        </label>
        <Switch.Root
          id="segment-switch"
          className="switch-root"
          checked={segment === "premium"}
          onCheckedChange={(checked) =>
            updateSegment(checked ? "premium" : "retail")
          }
          aria-label={`Toggle segment, currently ${segmentLabels[segment]}`}
        >
          <Switch.Thumb className="switch-thumb" />
        </Switch.Root>
      </div>

      <ToggleGroup.Root
        type="single"
        value={theme}
        onValueChange={(val) => {
          // Prevent deselecting (which would produce empty string)
          if (val) updateTheme(val as Theme);
        }}
        className="toggle-group"
        aria-label="Select theme"
      >
        <ToggleGroup.Item
          value="light"
          className="toggle-group__item"
          aria-label="Light mode"
        >
          <SunIcon width={16} height={16} />
        </ToggleGroup.Item>
        <ToggleGroup.Item
          value="dark"
          className="toggle-group__item"
          aria-label="Dark mode"
        >
          <MoonIcon width={16} height={16} />
        </ToggleGroup.Item>
      </ToggleGroup.Root>
    </div>
  );
}

