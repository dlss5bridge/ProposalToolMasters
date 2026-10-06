import { styled } from "@mui/material/styles";
import Switch from "@mui/material/Switch";

// App-wide switch. Same MUI <Switch> underneath (same props: checked,
// onChange, onClick, disabled, ...); only the look is defined here, matching
// the .fx-toggle switch in styles/fancy-select.css:
// 42x24 track, grey when off, cyan when on, white thumb, no icons.
const TRACK_W = 42;
const TRACK_H = 24;
const THUMB = 18;
const INSET = (TRACK_H - THUMB) / 2; // 3px gap between thumb and track edge
const PAD = 4; // room around the track for the focus ring

const Android12Switch = styled(Switch)(() => ({
  width: TRACK_W + PAD * 2,
  height: TRACK_H + PAD * 2,
  padding: PAD,
  overflow: "visible",

  "& .MuiSwitch-switchBase": {
    padding: PAD + INSET,
    transitionDuration: "200ms",
    "&:hover": {
      backgroundColor: "transparent",
    },
    "&.Mui-checked": {
      transform: `translateX(${TRACK_W - THUMB - INSET * 2}px)`,
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "#14b5d1",
        opacity: 1,
      },
    },
    "&.Mui-focusVisible + .MuiSwitch-track": {
      boxShadow: "0 0 0 4px rgba(20, 181, 209, 0.2)",
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: 0.5,
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      boxShadow: "none",
    },
  },

  "& .MuiSwitch-thumb": {
    width: THUMB,
    height: THUMB,
    margin: 0,
    backgroundColor: "#fff",
    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.3)",
  },

  "& .MuiSwitch-track": {
    borderRadius: TRACK_H / 2,
    backgroundColor: "#cbd5e1",
    opacity: 1,
    transition: "background-color 200ms ease, box-shadow 150ms ease",
  },

  "& .MuiTouchRipple-root": {
    display: "none",
  },
}));

export default Android12Switch;
