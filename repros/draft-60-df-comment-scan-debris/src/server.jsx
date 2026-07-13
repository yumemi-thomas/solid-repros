import { renderToStream } from "@solidjs/web";
import App from "./App.jsx";

export function streamApp() {
  return renderToStream(() => <App />);
}
