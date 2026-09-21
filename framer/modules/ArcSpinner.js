import {
  jsx as _jsx,
  jsxs as _jsxs,
  Fragment as _Fragment,
} from "react/jsx-runtime";
import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer";
/**
 * A dependency-free Framer adaptation of the supplied Arc spinner.
 *
 * @framerIntrinsicWidth 48
 * @framerIntrinsicHeight 48
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */ export default function ArcSpinner(props) {
  const {
    color = "#111111",
    trackOpacity = 0.1,
    strokeWidth = 5,
    duration = 1,
    direction = "clockwise",
    animate = true,
    label = "Loading",
    style,
  } = props;
  const isStatic = useIsStaticRenderer();
  const shouldAnimate = animate && !isStatic;
  return /*#__PURE__*/ _jsxs(_Fragment, {
    children: [
      /*#__PURE__*/ _jsx("style", {
        children: `
                @keyframes framer-arc-spinner-spin {
                    to { transform: rotate(360deg); }
                }

                @media (prefers-reduced-motion: reduce) {
                    .framer-arc-spinner {
                        animation: none !important;
                    }
                }
            `,
      }),
      /*#__PURE__*/ _jsx("div", {
        className: "framer-arc-spinner",
        role: "status",
        "aria-label": label,
        style: {
          ...style,
          position: "relative",
          width: "100%",
          height: "100%",
          minWidth: 1,
          minHeight: 1,
          boxSizing: "border-box",
          borderRadius: "50%",
          borderStyle: "solid",
          borderWidth: strokeWidth,
          borderColor: `color-mix(in srgb, ${color} ${Math.round(trackOpacity * 100)}%, transparent)`,
          borderTopColor: color,
          color,
          transform: "rotate(0deg)",
          animationName: shouldAnimate ? "framer-arc-spinner-spin" : "none",
          animationDuration: `${Math.max(duration, 0.1)}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          animationDirection:
            direction === "counterclockwise" ? "reverse" : "normal",
        },
      }),
    ],
  });
}
addPropertyControls(ArcSpinner, {
  color: { type: ControlType.Color, title: "Color", defaultValue: "#111111" },
  trackOpacity: {
    type: ControlType.Number,
    title: "Track",
    defaultValue: 0.1,
    min: 0,
    max: 1,
    step: 0.05,
  },
  strokeWidth: {
    type: ControlType.Number,
    title: "Stroke",
    defaultValue: 5,
    min: 1,
    max: 20,
    step: 1,
    unit: "px",
  },
  animate: { type: ControlType.Boolean, title: "Animate", defaultValue: true },
  duration: {
    type: ControlType.Number,
    title: "Duration",
    defaultValue: 1,
    min: 0.1,
    max: 10,
    step: 0.1,
    unit: "s",
    hidden: ({ animate }) => !animate,
  },
  direction: {
    type: ControlType.Enum,
    title: "Direction",
    options: ["clockwise", "counterclockwise"],
    optionTitles: ["Clockwise", "Counter"],
    defaultValue: "clockwise",
    displaySegmentedControl: true,
    hidden: ({ animate }) => !animate,
  },
  label: { type: ControlType.String, title: "Label", defaultValue: "Loading" },
});
export const __FramerMetadata__ = {
  exports: {
    default: {
      type: "reactComponent",
      name: "ArcSpinner",
      slots: [],
      annotations: {
        framerIntrinsicHeight: "48",
        framerSupportedLayoutWidth: "any-prefer-fixed",
        framerSupportedLayoutHeight: "any-prefer-fixed",
        framerIntrinsicWidth: "48",
        framerContractVersion: "1",
      },
    },
    __FramerMetadata__: { type: "variable" },
  },
};
//# sourceMappingURL=./ArcSpinner.map
