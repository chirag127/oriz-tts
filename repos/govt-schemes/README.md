# Indian Government Schemes

> Central government welfare schemes with eligibility and benefits

**Category:** india-govt · **Data:** India.gov.in · **License:** CC-BY-4.0 · **Updates:** yearly

## API Endpoints

All endpoints are served as static JSON from GitHub Pages.

| Endpoint | Format |
|----------|--------|
| `/data/schemes.json` | JSON |

## Usage

```bash
curl https://chirag127.github.io/govt-schemes/data.json
```

```javascript
const res = await fetch('https://chirag127.github.io/govt-schemes/data.json');
const data = await res.json();
```

## Data

- Source: India.gov.in
- License: CC-BY-4.0
- Last updated: `2026-08-25T03:10:22.805Z`

See `data/` for raw JSON and `data/schema.json` for the schema.

## Documentation

Visit the [interactive docs](https://chirag127.github.io/govt-schemes/) for the browsable API reference.

## Contributing

Issues and PRs welcome. Ensure `data/schema.json` validates all data files.

## License

CC-BY-4.0
