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

// Named eases from DESIGN.md, registered once so every file can use them by name.
CustomEase.create("soft", "M0,0 C0.2,0.7 0.2,1 1,1"); // §4.3 fade-up: cubic-bezier(.2,.7,.2,1)

export { gsap, SplitText, DrawSVGPlugin, MotionPathPlugin, Flip, ScrambleTextPlugin, CustomEase };
