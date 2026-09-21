import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer";
const DELAYS = [0, 1, 2, 1, 2, 2, 3, 3, 4];
/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */ export default function RippleLoader(props) {
  const {
    cellSize = 52,
    spacing = 1,
    radius = 4,
    duration = 1.5,
    delay = 0.1,
    startColor = "#00FF87",
    endColor = "#60EFFF",
    background = "rgba(0, 0, 0, 0)",
    style,
  } = props;
  const isStatic = useIsStaticRenderer();
  const totalSize = 3 * (cellSize + spacing * 2);
  return /*#__PURE__*/ _jsxs("div", {
    role: "status",
    "aria-label": "Loading",
    style: {
      ...style,
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      background,
    },
    children: [
      /*#__PURE__*/ _jsx("style", {
        children: `
                @keyframes framer-ripple-loader {
                    0% {
                        background-color: transparent;
                    }

                    30% {
                        background-color: var(--cell-color);
                    }

                    60%,
                    100% {
                        background-color: transparent;
                    }
                }
            `,
      }),
      /*#__PURE__*/ _jsx("div", {
        style: {
          display: "flex",
          flexWrap: "wrap",
          width: totalSize,
          height: totalSize,
          flexShrink: 0,
        },
        children: DELAYS.map((delayStep, index) => {
          const startWeight = 100 - (index / (DELAYS.length - 1)) * 100;
          const color = `color-mix(
                        in srgb,
                        ${startColor} ${startWeight}%,
                        ${endColor}
                    )`;
          return /*#__PURE__*/ _jsx(
            "div",
            {
              style: {
                flex: `0 0 ${cellSize}px`,
                width: cellSize,
                height: cellSize,
                margin: spacing,
                boxSizing: "border-box",
                borderRadius: radius,
                backgroundColor: isStatic ? color : "transparent",
                opacity: isStatic ? 0.8 : 1,
                animation: isStatic
                  ? "none"
                  : `framer-ripple-loader ${duration}s ease infinite`,
                animationDelay: `${delayStep * delay}s`,
                "--cell-color": color,
              },
            },
            index,
          );
        }),
      }),
    ],
  });
}
addPropertyControls(RippleLoader, {
  cellSize: {
    type: ControlType.Number,
    title: "Cell Size",
    defaultValue: 52,
    min: 4,
    max: 120,
    step: 1,
    unit: "px",
  },
  spacing: {
    type: ControlType.Number,
    title: "Spacing",
    defaultValue: 1,
    min: 0,
    max: 24,
    step: 1,
    unit: "px",
  },
  radius: {
    type: ControlType.Number,
    title: "Radius",
    defaultValue: 4,
    min: 0,
    max: 60,
    step: 1,
    unit: "px",
  },
  duration: {
    type: ControlType.Number,
    title: "Duration",
    defaultValue: 1.5,
    min: 0.2,
    max: 5,
    step: 0.1,
    unit: "s",
  },
  delay: {
    type: ControlType.Number,
    title: "Cell Delay",
    defaultValue: 0.1,
    min: 0,
    max: 1,
    step: 0.05,
    unit: "s",
  },
  startColor: {
    type: ControlType.Color,
    title: "Start",
    defaultValue: "#00FF87",
  },
  endColor: { type: ControlType.Color, title: "End", defaultValue: "#60EFFF" },
  background: {
    type: ControlType.Color,
    title: "Background",
    defaultValue: "rgba(0, 0, 0, 0)",
  },
});
export const __FramerMetadata__ = {
  exports: {
    default: {
      type: "reactComponent",
      name: "RippleLoader",
      slots: [],
      annotations: {
        framerContractVersion: "1",
        framerSupportedLayoutWidth: "any-prefer-fixed",
        framerSupportedLayoutHeight: "any-prefer-fixed",
      },
    },
    __FramerMetadata__: { type: "variable" },
  },
};
//# sourceMappingURL=./Square_loading.map
