// Validated per the dataviz skill (validate_palette.js) for both light and
// dark chart surfaces. Fixed slot order - never remapped per chart.
export const CHART_TOKENS = {
  light: {
    // 4-slot categorical (appointment status breakdown)
    slot1: "#2a78d6", // Scheduled
    slot2: "#1baf7a", // Completed
    slot3: "#eda100", // NoShow
    slot4: "#008300", // Cancelled
    // 2-slot categorical (usage vs waste)
    usage: "#2a78d6",
    waste: "#e34948",
    grid: "#e1e0d9",
    axis: "#898781",
    text: "#52514e",
  },
  dark: {
    slot1: "#3987e5",
    slot2: "#199e70",
    slot3: "#c98500",
    slot4: "#008300",
    usage: "#3987e5",
    waste: "#e66767",
    grid: "#2c2c2a",
    axis: "#898781",
    text: "#c3c2b7",
  },
};
