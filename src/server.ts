import { Hono } from "hono"
import { cors } from "hono/cors"
import { serveStatic } from "hono/serve-static"

import {
  GITHUB_TOKEN,
  FRONTEND_DOMAIN,
  PUBLIC_DIR,
  GITHUB_GRAPHQL_URL,
} from "./const.ts"
import { validateDomain } from "./middleware/domain.ts"

if (!GITHUB_TOKEN) {
  throw new Error("Missing GitHub token. Set GITHUB_TOKEN in environment.")
}

const app = new Hono()

// Setup CORS for the frontend route if defined
if (FRONTEND_DOMAIN) {
  app.use(
    "*",
    cors({
      origin: FRONTEND_DOMAIN,
      allowMethods: ["POST", "OPTIONS"],
      allowHeaders: ["Content-Type"],
    })
  )
}

app.post("/graphql", validateDomain, async (c) => {
  const requestBody = await c.req.raw.text()

  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: requestBody,
  })

  const responseText = await response.text()
  return new Response(responseText, {
    status: response.status,
    headers: {
      "Content-Type": "application/json",
    },
  })
})

app.all("/graphql", validateDomain, (c) => c.redirect(GITHUB_GRAPHQL_URL, 301))

app.use(
  "/*",
  serveStatic({
    root: `./${PUBLIC_DIR}`,
    getContent: async (path, c) => {
      try {
        return await Deno.readFile(path)
      } catch (_e) {
        return c.text("", 404)
      }
    },
  })
)

Deno.serve(app.fetch)
