// render() into a NON-EMPTY container appends, but the disposer does
// `element.textContent = ""` and wipes the whole container. — Solid 2.0.0-beta.16 (and 1.x).
//
// Realistic case: an embeddable widget / client-only island with a mount(el)
// API — the exact shape @astrojs/solid-js uses (`render(fn, element)` + calling
// the returned disposer on teardown). The host hands the widget an element it
// already put content in (#reviews). Mounting appends the widget after the
// host's content; unmounting should remove only the widget, but it blanks the
// whole slot — destroying the host's heading + summary.
// Issue draft: issue-drafts/20-dispose-wipes-preexisting-content.md
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";

// --- the embeddable widget (a client-only island) ---
function ReviewForm() {
  const [stars, setStars] = createSignal(0);
  return (
    <p>
      Your rating:{" "}
      <button onClick={() => setStars(stars() + 1)}>★ {stars()}</button>
    </p>
  );
}

// The library's mount API: render into whatever element the host provides and
// return a disposer — exactly like Astro's client:only Solid renderer.
function mountReviewForm(el) {
  return render(() => <ReviewForm />, el);
}

// --- host app (control panel; owns #root) ---
export default function App() {
  const [mounted, setMounted] = createSignal(false);
  const [slotWiped, setSlotWiped] = createSignal(false);

  let dispose;
  const slot = () => document.getElementById("reviews");

  function mount() {
    if (dispose) return;
    dispose = mountReviewForm(slot()); // appends after the host's content
    setMounted(true);
  }
  function unmount() {
    dispose?.();
    dispose = undefined;
    setMounted(false);
    setSlotWiped(!slot().querySelector("h3")); // did the host heading survive?
  }

  return (
    <section style={{ padding: "16px" }}>
      <h2>Embeddable reviews island mounted into a host slot</h2>
      <button onClick={mount} disabled={mounted()}>mount widget</button>{" "}
      <button onClick={unmount} disabled={!mounted()}>unmount widget</button>
      <p style={{ color: slotWiped() ? "#c5221f" : "#666" }}>
        {slotWiped()
          ? "FAIL — unmounting the widget blanked the whole #reviews slot, including the host's heading + summary."
          : "Mount appends the widget after the host's content; unmount should remove only the widget."}
      </p>
    </section>
  );
}
