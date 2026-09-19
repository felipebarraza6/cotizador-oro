# Cotizador oro — landing de prototipo

Landing **aparte** de [Gungir](https://github.com/felipebarraza6/gungir) para enviar al cliente.

- Estática (Vite + React)
- GitHub Pages: https://felipebarraza6.github.io/cotizador-oro/
- El cliente **solo ve marca del negocio + Gungir** (nada de infra interna en la UI)

## Dev

```bash
bun install
bun run dev
```

```env
VITE_API_BASE=http://localhost:8000/api
VITE_BRANCH_SLUG=casa-oro
VITE_BRAND_NAME=Casa de Oro
```

## Deploy

Push a `main` → GitHub Actions → Pages.
