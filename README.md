# Proxy Utility for c/side Interview Challenge

## Developer info

- Full name: Juan Marcos Rigoli
- Email: [marcos@rigoli.dev](mailto:marcos@rigoli.dev)
- Contact info: https://rigoli.dev

## Description

The purpose of this service is to be used as a proxy from a frontend-only app and avoid exposing tokens.

It just adds the expected tokens to the request and calls GitHub GraphQL API.

This is related to a c/side Interview Challenge that can be found here: https://github.com/rijuma/cside-github

## Stack

This is a minimalistic implementation using:

- [Deno](https://deno.com)
- [Hono](https://hono.dev)

## Setup

- Clone this repository.
- Make a copy of the `.env.example` file as `.env`.
- Update the new `.env` file with:

  - `GITHUB_TOKEN`: A GitHub personal token. Make sure to use a [Fine-grained personal access tokens](https://github.com/settings/personal-access-tokens) with just the necessary permissions. Ideally `Read-only access to public repositories` ONLY.
  - `FRONTEND_DOMAIN`: Add CORS headers and allow requests only from this domain.

- Make sure you have [Deno installed](https://docs.deno.com/runtime/getting_started/installation), open a console in the project's directory and install dependencies with:

  ```bash
  deno install
  ```

- Start the service with:

  ```bash
  deno task start
  ```

  This should start the service locally at: http://localhost:8000

> [!NOTICE]
> The `Dockerfile`, the `compose.yml` and some variables on `.env.example` are just part of the configuration for the server to be deployed on a VPS using nginx as a reverse-proxy. You don't need it to run locally.
