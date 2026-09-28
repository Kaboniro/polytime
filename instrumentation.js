// Runs once when the Next.js server starts. The Node-only work lives in
// instrumentation-node.js, imported conditionally so it is never bundled for
// the Edge runtime.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./instrumentation-node");
  }
}
