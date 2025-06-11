import { createMiddleware } from "hono/factory"
import { FRONTEND_DOMAIN } from "../const.ts"

export const validateDomain = (domain: string = FRONTEND_DOMAIN) =>
  createMiddleware(async (c, next) => {
    // If we didn't set a domain to check, we can just skip it.
    if (!FRONTEND_DOMAIN) {
      await next()
      return
    }

    // Get the Origin and check that it matches the frontend.
    const origin = c.req.header("Origin")
    if (!origin?.startsWith(domain))
      return c.json({ error: "No coffee today..." }, 418)

    await next()
  })
