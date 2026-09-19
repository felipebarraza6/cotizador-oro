# Cotizador oro — landing de prototipo

Landing **aparte** de [Gungir](https://github.com/felipebarraza6/gungir). Solo para enviar al cliente.

- Estática (Vite + React)
- GitHub Pages: `https://felipebarraza6.github.io/cotizador-oro/`
- Consume Yggdra público:
  - `POST /api/public/quote-preview/`
  - `POST /api/public/quotes/`
  - (opcional) `GET /api/public/landing-config/?slug=`

Gungir = producto general. Esta web = vertical demo (compra de oro) que demuestra cómo una landing de tenant pega a la API.

## Dev

```bash
bun install
bun run dev
```

```env
VITE_YGGDRA_API_BASE=http://localhost:8000/api
VITE_BRANCH_SLUG=casa-oro
VITE_BRAND_NAME=Casa de Oro
```

Seed en Yggdra: `python manage.py seed_gungir --slug casa-oro`

## Deploy

Push a `main` → workflow `Deploy GitHub Pages`.

En el repo: Settings → Pages → Source = **GitHub Actions**.
