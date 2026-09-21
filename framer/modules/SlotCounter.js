import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { useMemo } from "react";
import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer";
import { motion, useInView } from "framer-motion";
function numberFromCss(value, fallback) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}
function resolveLineHeight(fontSize, lineHeight) {
  if (typeof lineHeight === "number") {
    return lineHeight <= 4 ? fontSize * lineHeight : lineHeight;
  }
  if (typeof lineHeight === "string") {
    const parsed = Number.parseFloat(lineHeight);
    if (!Number.isFinite(parsed)) return fontSize;
    if (lineHeight.endsWith("em")) return fontSize * parsed;
    if (lineHeight.endsWith("%")) return fontSize * (parsed / 100);
    return parsed;
  }
  return fontSize;
}
function mod(value, base) {
  return ((value % base) + base) % base;
}
function buildReel(target, rolls, direction) {
  const delta = direction === "up" ? 1 : -1;
  const extra = direction === "up" ? target : mod(-target, 10);
  const steps = Math.max(1, Math.round(rolls)) * 10 + extra;
  const digits = Array.from({ length: steps + 1 }, (_, index) =>
    mod(index * delta, 10),
  );
  return { digits, steps };
}
function DigitReel(props) {
  const {
    digit,
    digitHeight,
    delay,
    duration,
    rolls,
    direction,
    fadeEdges,
    digitWidth,
    shouldAnimate,
    isStatic,
  } = props;
  const reel = useMemo(
    () => buildReel(digit, rolls, direction),
    [digit, rolls, direction],
  );
  const destination = -reel.steps * digitHeight;
  if (isStatic) {
    return /*#__PURE__*/ _jsx("span", {
      style: {
        display: "block",
        width: `${digitWidth}em`,
        flex: `0 0 ${digitWidth}em`,
        height: digitHeight,
        lineHeight: `${digitHeight}px`,
        textAlign: "center",
      },
      children: digit,
    });
  }
  return /*#__PURE__*/ _jsx("span", {
    style: {
      display: "block",
      position: "relative",
      width: `${digitWidth}em`,
      flex: `0 0 ${digitWidth}em`,
      height: digitHeight,
      overflow: "hidden",
      textAlign: "center",
      WebkitMaskImage: fadeEdges
        ? "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)"
        : undefined,
      maskImage: fadeEdges
        ? "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)"
        : undefined,
    },
    children: /*#__PURE__*/ _jsx(motion.span, {
      initial: { y: 0 },
      animate: { y: shouldAnimate ? destination : 0 },
      transition: { duration, delay, ease: [0.22, 1, 0.36, 1] },
      style: {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        alignItems: "center",
        willChange: "transform",
      },
      children: reel.digits.map((item, index) =>
        /*#__PURE__*/ _jsx(
          "span",
          {
            style: {
              display: "block",
              height: digitHeight,
              lineHeight: `${digitHeight}px`,
              flex: `0 0 ${digitHeight}px`,
              width: "100%",
              textAlign: "center",
            },
            children: item,
          },
          `${index}-${item}`,
        ),
      ),
    }),
  });
}
/**
 * Staggered Slot Counter
 *
 * @framerIntrinsicWidth 560
 * @framerIntrinsicHeight 104
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */ export default function SlotCounter(props) {
  const {
    value = 4510834,
    prefix = "",
    suffix = "",
    decimals = 0,
    grouping = true,
    direction = "up",
    staggerFrom = "left",
    rolls = 2,
    duration = 1.1,
    stagger = 0.08,
    trigger = "mount",
    replay = false,
    fadeEdges = true,
    digitGap = 0,
    digitWidth = 0.62,
    color = "#000000",
    font = {},
    style,
  } = props;
  const isStatic = useIsStaticRenderer();
  const containerRef = React.useRef(null);
  const isInView = useInView(containerRef, { once: !replay, amount: 0.25 });
  const shouldAnimate = trigger === "mount" || isInView;
  const safeDecimals = Math.max(0, Math.min(3, Math.round(decimals)));
  const absoluteValue = Math.abs(Number.isFinite(value) ? value : 0);
  const formattedNumber = new Intl.NumberFormat("en-US", {
    useGrouping: grouping,
    minimumFractionDigits: safeDecimals,
    maximumFractionDigits: safeDecimals,
  }).format(absoluteValue);
  const displayValue = `${prefix}${value < 0 ? "−" : ""}${formattedNumber}${suffix}`;
  const characters = Array.from(displayValue);
  const totalDigits = characters.filter((character) =>
    /\d/.test(character),
  ).length;
  const fontSize = numberFromCss(font.fontSize, 72);
  const digitHeight = resolveLineHeight(fontSize, font.lineHeight);
  const textAlign =
    font.textAlign === "right"
      ? "flex-end"
      : font.textAlign === "center"
        ? "center"
        : "flex-start";
  let digitOrdinal = 0;
  return /*#__PURE__*/ _jsx("div", {
    ref: containerRef,
    role: "img",
    "aria-label": displayValue,
    style: {
      ...style,
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: textAlign,
      gap: digitGap,
      overflow: "visible",
      color,
      fontVariantNumeric: "tabular-nums",
      whiteSpace: "nowrap",
      userSelect: "none",
      minWidth: style?.width === "100%" ? undefined : "max-content",
      ...font,
      lineHeight: `${digitHeight}px`,
    },
    children: /*#__PURE__*/ _jsx("span", {
      "aria-hidden": "true",
      style: { display: "contents" },
      children: characters.map((character, index) => {
        if (/\d/.test(character)) {
          const currentOrdinal = digitOrdinal++;
          const delayIndex =
            staggerFrom === "right"
              ? totalDigits - 1 - currentOrdinal
              : currentOrdinal;
          return /*#__PURE__*/ _jsx(
            DigitReel,
            {
              digit: Number(character),
              digitHeight: digitHeight,
              delay: Math.max(0, delayIndex * stagger),
              duration: duration,
              rolls: rolls,
              direction: direction,
              fadeEdges: fadeEdges,
              digitWidth: digitWidth,
              shouldAnimate: shouldAnimate,
              isStatic: isStatic,
            },
            `${displayValue}-${index}-${character}`,
          );
        }
        if (isStatic) {
          return /*#__PURE__*/ _jsx(
            "span",
            { style: { height: digitHeight }, children: character },
            `${index}-${character}`,
          );
        }
        return /*#__PURE__*/ _jsx(
          motion.span,
          {
            initial: { opacity: 0, y: digitHeight * 0.12 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.35, delay: Math.max(0, index * stagger) },
            style: { height: digitHeight },
            children: character,
          },
          `${displayValue}-${index}-${character}`,
        );
      }),
    }),
  });
}
addPropertyControls(SlotCounter, {
  value: {
    type: ControlType.Number,
    title: "Value",
    defaultValue: 4510834,
    min: -999999999,
    max: 999999999,
    step: 1,
    displayStepper: true,
  },
  prefix: { type: ControlType.String, title: "Prefix", defaultValue: "" },
  suffix: { type: ControlType.String, title: "Suffix", defaultValue: "" },
  decimals: {
    type: ControlType.Number,
    title: "Decimals",
    defaultValue: 0,
    min: 0,
    max: 3,
    step: 1,
    displayStepper: true,
  },
  grouping: {
    type: ControlType.Boolean,
    title: "Separators",
    defaultValue: true,
  },
  direction: {
    type: ControlType.Enum,
    title: "Roll",
    options: ["up", "down"],
    optionTitles: ["Up", "Down"],
    defaultValue: "up",
    displaySegmentedControl: true,
  },
  staggerFrom: {
    type: ControlType.Enum,
    title: "Stagger",
    options: ["left", "right"],
    optionTitles: ["Left → Right", "Right → Left"],
    defaultValue: "left",
    displaySegmentedControl: true,
  },
  rolls: {
    type: ControlType.Number,
    title: "Rolls",
    defaultValue: 2,
    min: 1,
    max: 6,
    step: 1,
    displayStepper: true,
  },
  duration: {
    type: ControlType.Number,
    title: "Duration",
    defaultValue: 1.1,
    min: 0.2,
    max: 3,
    step: 0.05,
    unit: "s",
  },
  stagger: {
    type: ControlType.Number,
    title: "Delay",
    defaultValue: 0.08,
    min: 0,
    max: 0.3,
    step: 0.01,
    unit: "s",
  },
  trigger: {
    type: ControlType.Enum,
    title: "Trigger",
    options: ["mount", "inView"],
    optionTitles: ["On Mount", "In View"],
    defaultValue: "mount",
    displaySegmentedControl: true,
  },
  replay: {
    type: ControlType.Boolean,
    title: "Replay",
    defaultValue: false,
    hidden: ({ trigger }) => trigger !== "inView",
  },
  fadeEdges: {
    type: ControlType.Boolean,
    title: "Edge Fade",
    defaultValue: true,
  },
  digitGap: {
    type: ControlType.Number,
    title: "Digit Gap",
    defaultValue: 0,
    min: -12,
    max: 20,
    step: 1,
    unit: "px",
  },
  digitWidth: {
    type: ControlType.Number,
    title: "Digit Width",
    defaultValue: 0.62,
    min: 0.4,
    max: 1.2,
    step: 0.01,
    unit: "em",
  },
  color: { type: ControlType.Color, title: "Color", defaultValue: "#000000" },
  font: {
    type: ControlType.Font,
    title: "Typography",
    controls: "extended",
    defaultFontType: "sans-serif",
    defaultValue: {
      fontSize: "72px",
      variant: "Medium",
      letterSpacing: "-0.04em",
      lineHeight: "1em",
      textAlign: "left",
    },
  },
});
SlotCounter.displayName = "Slot Counter";
export const __FramerMetadata__ = {
  exports: {
    default: {
      type: "reactComponent",
      name: "SlotCounter",
      slots: [],
      annotations: {
        framerIntrinsicHeight: "104",
        framerIntrinsicWidth: "560",
        framerContractVersion: "1",
        framerSupportedLayoutHeight: "any-prefer-fixed",
        framerSupportedLayoutWidth: "any-prefer-fixed",
      },
    },
    __FramerMetadata__: { type: "variable" },
  },
};
//# sourceMappingURL=./SlotCounter.map
