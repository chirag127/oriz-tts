# Government Hospitals

> Government hospitals with state, district, and bed count

**Category:** india-govt · **Data:** MoHFW / public · **License:** CC-BY-4.0 · **Updates:** yearly

## API Endpoints

All endpoints are served as static JSON from GitHub Pages.

| Endpoint | Format |
|----------|--------|
| `/data/hospitals.json` | JSON |

## Usage

```bash
curl https://chirag127.github.io/govt-hospitals/data.json
```

```javascript
const res = await fetch('https://chirag127.github.io/govt-hospitals/data.json');
const data = await res.json();
```

## Data

- Source: MoHFW / public
- License: CC-BY-4.0
- Last updated: `2026-08-25T03:10:22.842Z`

See `data/` for raw JSON and `data/schema.json` for the schema.

## Documentation

Visit the [interactive docs](https://chirag127.github.io/govt-hospitals/) for the browsable API reference.

## Contributing

Issues and PRs welcome. Ensure `data/schema.json` validates all data files.

## License

CC-BY-4.0
