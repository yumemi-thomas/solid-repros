import { createServer as createHttpServer } from "node:http";
import { createServer as createViteServer } from "vite";

const port = Number(process.env.PORT || 5173);
const vite = await createViteServer({
  appType: "custom",
  server: { middlewareMode: true }
});

const pageStart = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Solid streaming fallback debris repro</title>
    <link rel="icon" href="data:," />
    <script type="module" src="/@vite/client"></script>
    <style>
      :root { color: #172033; background: #f4f7fb; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
      * { box-sizing: border-box; }
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 32px; }
      main { width: min(100%, 680px); }
      .intro { margin-bottom: 18px; color: #526078; }
      .intro h2 { margin: 0 0 6px; color: #172033; font-size: 18px; }
      .intro p { margin: 0; line-height: 1.55; }
      .card { padding: 28px; border: 1px solid #dce3ee; border-radius: 16px; background: white; box-shadow: 0 14px 40px #1f355415; }
      .eyebrow { margin: 0 0 6px; color: #65738a; font-size: 13px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
      h1 { margin: 0; font-size: 30px; }
      .status { min-height: 24px; margin: 24px 0 0; color: #3152a4; }
      .verdict { display: grid; gap: 6px; margin-top: 18px; padding: 18px; border-radius: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; }
      .verdict.waiting { color: #5b6472; background: #e9edf3; }
      .verdict.fail { color: #8b1c2d; background: #ffe8ec; border: 1px solid #ffc6d0; }
      .verdict.pass { color: #17613a; background: #e5f8ed; border: 1px solid #b8e8ca; }
    </style>
    <script>
      globalThis._$HY = { events: [], completed: new WeakSet(), r: {}, done: false, fe() {} };
    </script>
  </head>
  <body>
    <main>
      <section class="intro">
        <h2>Real Solid 2 streaming SSR</h2>
        <p>The fallback is sent immediately. After 1.2 seconds the server streams the resolved report status and Solid's emitted activation script swaps it in.</p>
      </section>
      <div id="app">`;

const pageEnd = `</div>
      <div id="verdict" class="verdict waiting">Waiting for the stream to finish…</div>
      <script>
        window.__afterStream = document.querySelector("[data-report-status]").textContent;
      </script>
      <script type="module" src="/src/client.jsx"></script>
    </main>
  </body>
</html>`;

const server = createHttpServer((request, response) => {
  vite.middlewares(request, response, async () => {
    const pathname = new URL(request.url || "/", "http://localhost").pathname;
    if (pathname !== "/") {
      response.statusCode = 404;
      response.end("Not found");
      return;
    }

    try {
      const { streamApp } = await vite.ssrLoadModule("/src/server.jsx");
      response.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, no-transform",
        "X-Accel-Buffering": "no"
      });
      response.write(pageStart);
      streamApp().pipe({
        write(chunk) {
          response.write(chunk);
        },
        end() {
          response.end(pageEnd);
        }
      });
    } catch (error) {
      vite.ssrFixStacktrace(error);
      console.error(error);
      if (!response.headersSent) response.writeHead(500, { "Content-Type": "text/plain" });
      response.end(error.stack || String(error));
    }
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Streaming repro running at http://localhost:${port}`);
});
