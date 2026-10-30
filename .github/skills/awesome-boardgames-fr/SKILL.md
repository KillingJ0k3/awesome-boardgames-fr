---
name: awesome-boardgames-fr
description: "Use when working on the Awesome Boardgames FR repository: site YAML data, the Go README generator, its template or tests, GitHub Pages and Jekyll rendering, or the multi-site search frontend."
---

# Awesome Boardgames FR

Use this skill to make changes that fit the repository's data-generation, publishing, and browser-search workflows.

## Project Overview

This repository maintains a French-language directory of board-game shops, publishers, price comparators, general-interest sites, and STL stores. It has two related outputs:

- A generated `README.md`, built from YAML data and a Go text template.
- A static search page under `search/`, which loads the same YAML files in the browser and builds search links for individual sites.

GitHub Pages/Jekyll is the expected publishing path. The repository's visible GitHub Actions workflow updates the README; it does not define a Pages deployment workflow.

## Data And README Generation

- Source records live in `data/comparators.yaml`, `data/editors.yaml`, `data/general.yaml`, `data/vpc.yaml`, and `data/stl.yaml`.
- Records are YAML lists. Common fields include `name`, `url`, `country`, `search`, and `description`; some entries also use `tags`, `date_added`, or `date_removed`.
- `updater/updater.go` scans the data directory for `.yaml` and `.yml` files, parses them with `gopkg.in/yaml.v3`, and sorts each file's entries by name, case-insensitively.
- The generator builds an explicit template context, groups country-specific sections, and renders `template/README.tpl` to `README.md` using Go's `text/template` package.
- Country grouping in the README is based on exact country values: French comparators use `fr`; international comparators include `de`, `be`, and `international`; VPC sections group `fr`, `de`, `be`, and `international`.
- The generator uses paths relative to the repository root and overwrites `README.md`. Do not hand-edit generated README sections; update the YAML or template, run the generator, then review the resulting diff.
- Adding a new data file is discovered by the Go YAML loader, but the README will only render it if the explicit context in `updater/updater.go` and the template are also updated. The browser has its own explicit source list in `search/app.js` (`DATA_FILES`); update that list when the search page should include the new file.

Run from the repository root:

```sh
go test ./...
go run ./updater/
```

The first command runs the updater tests. The second regenerates `README.md` and may modify it.

## GitHub Pages And Jekyll

- `_config.yml` selects the `minima` theme. Its `title` value is currently empty.
- `_layouts/default.html` is a Jekyll layout. It uses Jekyll variables such as `page.lang`, `site.lang`, and `content`, and includes the theme's `head.html` and `footer.html`.
- GitHub Pages builds are not configured in `.github/workflows/update-readme.yaml`. That workflow runs Go when `data/**` changes on `master` or in a pull request, then commits the generated README update.
- Treat the README generator and the Pages/Jekyll rendering step as separate stages: the Go program writes Markdown; Jekyll is responsible for turning site content into the published site.

## Search Frontend

- `search/index.html` defines the search form, global and per-filter clear actions, filter controls, results toolbar, and site list.
- `search/styles.css` controls the responsive layout and visual styling. Desktop uses a narrow filter column beside a wider results column; smaller screens stack them.
- `search/app.js` loads the five YAML files listed in `DATA_FILES` with `fetch`, parses the subset of YAML used by this project, populates filters, and renders the site links. It has no frontend package manager or build step.
- The search field does not filter the directory by site name. It URL-encodes the query and appends it to a site's `search` suffix when that suffix exists. Sites without a `search` value still link to their base URL and cannot be selected for bulk opening.
- Country, category, and tag selections filter the visible site list. Multiple selected values within one filter are alternatives; active filter groups are combined together.
- Removed sites (`date_removed`) and sites without a search suffix have disabled bulk-selection checkboxes. Bulk opening uses `window.open`, so browsers may require pop-up permission.
- Filter options are native multi-select controls. `renderSelectOptions` sets each control's visible row count to its number of options; preserve this behavior when changing how options are populated.
- Because the page fetches YAML files, preview it through HTTP rather than opening `search/index.html` with a `file://` URL. From the repository root:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000/search/`.

## Change And Verification Workflow

1. Identify whether the change belongs in source YAML, the Go generator/template, Jekyll configuration/layout, or the browser search page.
2. For directory updates, preserve the existing YAML list and field conventions. Check whether the README template and the browser's `DATA_FILES` list both need the new source.
3. For generated README changes, run `go test ./...`, then `go run ./updater/`, and inspect the README diff.
4. For frontend changes, serve the repository over HTTP and verify the relevant interaction and responsive layout in a browser. Keep the existing IDs used by `search/app.js` in sync with `search/index.html`.
5. Do not confuse the Go updater workflow with GitHub Pages deployment; no Pages build workflow is defined in this repository.
