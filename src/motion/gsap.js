// The one place GSAP plugins are registered (ARCHITECTURE.md §6). Every other
// file imports gsap from here, never from "gsap" directly, so plugins are always
// registered before use and there is exactly one GSAP instance.
//
// All of these plugins are free since GSAP 3.13. Only the ones the spec uses are
// imported, to stay inside the 120 KB JS budget (ARCHITECTURE.md §7).
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText"; // headline glitch reveal, practice-card text sweep
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin"; // option border drawing itself
import { MotionPathPlugin } from "gsap/MotionPathPlugin"; // journey-bar plane
import { Flip } from "gsap/Flip"; // confidence dots sorting into groups
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin"; // glitch / checking readout
import { CustomEase } from "gsap/CustomEase"; // eases defined in DESIGN.md

gsap.registerPlugin(SplitText, DrawSVGPlugin, MotionPathPlugin, Flip, ScrambleTextPlugin, CustomEase);

export { gsap, SplitText, DrawSVGPlugin, MotionPathPlugin, Flip, ScrambleTextPlugin, CustomEase };
