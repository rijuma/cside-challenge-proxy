import { Hono } from "hono"
import { cors } from "hono/cors"
import { serveStatic } from "hono/serve-static"
import { secureHeaders } from "hono/secure-headers"

import {
  GITHUB_TOKEN,
  FRONTEND_DOMAIN,
  PUBLIC_DIR,
  GITHUB_API,
} from "./const.ts"
import { validateDomain } from "./middleware/validate-domain.ts"

if (!GITHUB_TOKEN) {
  throw new Error("Missing GitHub token. Set GITHUB_TOKEN in environment.")
}

const app = new Hono()

app.use(secureHeaders())

// Setup CORS for the frontend route if defined
if (FRONTEND_DOMAIN) {
  app.use(
    "*",
    cors({
      origin: FRONTEND_DOMAIN,
      allowMethods: ["POST", "OPTIONS"],
    })
  )
}

app.post("/graphql", validateDomain(), async (c) => {
  const requestBody = await c.req.raw.text()

  const response = await fetch(`${GITHUB_API}/graphql`, {
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
