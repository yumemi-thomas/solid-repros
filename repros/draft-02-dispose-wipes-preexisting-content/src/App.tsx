import { createSignal } from "solid-js";
import { render } from "@solidjs/web";

// The embeddable widget (a client-only island).
function ReviewForm() {
  const [stars, setStars] = createSignal(0);
  return <p>Your rating: <button onClick={() => setStars(stars() + 1)}>★ {stars()}</button></p>;
}

// The library's mount API: render into whatever element the host provides and
// return a disposer — exactly like Astro's client:only Solid renderer.
function mountReviewForm(el) {
  return render(() => <ReviewForm />, el);
}

export default function App() {
  const [mounted, setMounted] = createSignal(false);
  const [slotWiped, setSlotWiped] = createSignal(); // undefined until first unmount

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
    <section style={{ "font-family": "system-ui", padding: "16px" }}>
      <h2>Embeddable reviews island mounted into a host slot</h2>
      <button onClick={mount} disabled={mounted()}>mount widget</button>{" "}
      <button onClick={unmount} disabled={!mounted()}>unmount widget</button>
      <p
        style={{
          color: slotWiped() === undefined ? "#666" : slotWiped() ? "#c5221f" : "#137333"
        }}
      >
        {slotWiped() === undefined
          ? "Mount appends the widget after the host's content; unmount should remove only the widget."
          : slotWiped()
            ? "FAIL — unmounting the widget blanked the whole #reviews slot, including the host's heading + summary."
            : "PASS — pre-existing content survived dispose."}
      </p>
    </section>
  );
}
