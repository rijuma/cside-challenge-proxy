import { describe, it, beforeEach } from "jsr:@std/testing/bdd"
import { assertEquals } from "jsr:@std/assert"
import { Hono } from "hono"
import { validateDomain } from "./validate-domain.ts"

// Mock domain constant
const MOCKED_FRONTEND_DOMAIN = "https://example.com"

let app: Hono

// Utility to create app per test
const createApp = (domain?: string) => {
  const a = new Hono()
  a.use("*", validateDomain(domain))
  a.get("/", (c) => c.text("Welcome"))
  return a
}

describe("validateDomain middleware", () => {
  describe("when FRONTEND_DOMAIN is set", () => {
    beforeEach(() => {
      app = createApp(MOCKED_FRONTEND_DOMAIN)
    })

    it("allows requests from valid origin", async () => {
      const res = await app.request("/", {
        method: "GET",
        headers: {
          Origin: MOCKED_FRONTEND_DOMAIN,
        },
      })

      assertEquals(res.status, 200)
      assertEquals(await res.text(), "Welcome")
    })

    it("blocks requests from invalid origin", async () => {
      const res = await app.request("/", {
        method: "GET",
        headers: {
          Origin: "https://bad.com",
        },
      })

      assertEquals(res.status, 418)
      assertEquals(await res.json(), { error: "No coffee today..." })
    })
  })

  describe("when FRONTEND_DOMAIN is empty", () => {
    beforeEach(() => {
      app = createApp("")
    })

    it("skips domain validation", async () => {
      const res = await app.request("/", {
        method: "GET",
        headers: {
          Origin: "https://any.com",
        },
      })

      assertEquals(res.status, 200)
      assertEquals(await res.text(), "Welcome")
    })
  })
})
