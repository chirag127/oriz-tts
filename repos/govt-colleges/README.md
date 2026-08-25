# Government Colleges

> Government colleges and universities with state, type, and NAAC rating

**Category:** india-govt · **Data:** UGC / public · **License:** CC-BY-4.0 · **Updates:** yearly

## API Endpoints

All endpoints are served as static JSON from GitHub Pages.

| Endpoint | Format |
|----------|--------|
| `/data/colleges.json` | JSON |

## Usage

```bash
curl https://chirag127.github.io/govt-colleges/data.json
```

```javascript
const res = await fetch('https://chirag127.github.io/govt-colleges/data.json');
const data = await res.json();
```

## Data

- Source: UGC / public
- License: CC-BY-4.0
- Last updated: `2026-08-25T03:10:22.826Z`

See `data/` for raw JSON and `data/schema.json` for the schema.

## Documentation

Visit the [interactive docs](https://chirag127.github.io/govt-colleges/) for the browsable API reference.

## Contributing

Issues and PRs welcome. Ensure `data/schema.json` validates all data files.

## License

CC-BY-4.0
