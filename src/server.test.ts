import { Hono } from "hono"
import { secureHeaders } from "hono/secure-headers"
import { cors } from "hono/cors"
import { validateDomain } from "./middleware/validate-domain.ts"
import { serveStatic } from "hono/serve-static"
import { beforeEach, describe, it } from "@std/testing/bdd"
import { stub } from "@std/testing/mock"
import { assertEquals, assertStringIncludes } from "jsr:@std/assert"

// Mocks for constants
const GITHUB_TOKEN = "mock-token"
const FRONTEND_DOMAIN = "https://frontend.test"
const PUBLIC_DIR = "public"
const GITHUB_API = "https://api.github.com"

let app: Hono;

const setupApp = () => {
  const app = new Hono();

  app.use(secureHeaders());

  app.use(
    "*",
    cors({
      origin: FRONTEND_DOMAIN,
      allowMethods: ["POST", "OPTIONS"],
    })
  );

  app.post("/graphql", validateDomain(FRONTEND_DOMAIN), async (c) => {
    const requestBody = await c.req.raw.text();

    const response = await fetch(`${GITHUB_API}/graphql`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: requestBody,
    });

    const responseText = await response.text();
    return new Response(responseText, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  });

  app.use(
    "/*",
    serveStatic({
      root: `./${PUBLIC_DIR}`,
      getContent: async (path, c) => {
        try {
          return await Deno.readFile(path);
        } catch (_e) {
          return c.text("", 404);
        }
      },
    })
  );

  return app;
};

describe("Hono server", () => {
  beforeEach(() => {
    app = setupApp();
  });

  it("proxies /graphql POST requests to GitHub API", async () => {
    using _fetchStub = stub(globalThis, "fetch", async () =>
      await new Response(JSON.stringify({ data: "mocked" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const res = await app.request("/graphql", {
      method: "POST",
      headers: {
        Origin: FRONTEND_DOMAIN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: "{ viewer { login } }" }),
    });

    assertEquals(res.status, 200);
    const body = await res.text();
    assertStringIncludes(body, "mocked");
  });

  it("returns 404 when file is missing", async () => {
    using _readFileStub = stub(Deno, "readFile", () => {
      throw new Error("File not found");
    });

    const res = await app.request("/missing.html");
    assertEquals(res.status, 404);
    const body = await res.text();
    assertEquals(body, "");
  });

  it("returns static file content when file exists", async () => {
    using _readFileStub = stub(Deno, "readFile", () =>
      Promise.resolve(new TextEncoder().encode("Hello there!") as Uint8Array<ArrayBuffer>)
    );

    const res = await app.request("/index.html");
    assertEquals(res.status, 200);
    const body = await res.text();
    assertEquals(body, "Hello there!");
  });
});