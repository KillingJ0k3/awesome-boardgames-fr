# {{ .Title }}

<a name="contents"></a>

- [Awesome Boardgames (FR)](#awesome-boardgames-fr)
  - [Sites de VPC](#sites-de-vpc)
    - [France](#france)
    - [Allemagne](#allemagne)
    - [Belgique](#belgique)
    - [International (autres)](#international-autres)
  - [Boutiques d'éditeurs](#boutiques-déditeurs)
  - [Comparateurs](#comparateurs)
    - [France](#france-1)
    - [International](#international)
  - [Général](#général)

## Sites de VPC

### France

{{range .VPC_FR -}}
- [{{ .name }}]({{ .url }}){{ if .description }} : {{ .description }}{{ end }}
{{ end }}

**[⬆ revenir au début](#contents)**

### Allemagne

{{ range .VPC_DE -}}
- [{{ .name }}]({{ .url }}){{ if .description }} : {{ .description }}{{ end }}
{{ end }}

**[⬆ revenir au début](#contents)**

### Belgique

{{ range .VPC_BE -}}
- [{{ .name }}]({{ .url }}){{ if .description }} : {{ .description }}{{ end }}
{{ end }}

**[⬆ revenir au début](#contents)**

### International (autres)

{{ range .VPC_WORLD -}}
- [{{ .name }}]({{ .url }}){{ if .description }} : {{ .description }}{{ end }}
{{ end }}

**[⬆ revenir au début](#contents)**

## Boutiques d'éditeurs

Editeurs ayant une boutique/shop en ligne.

{{ range .Editors -}}
- [{{ .name }}]({{ .url }}) [{{ .country }}]{{ if .description }} : {{ .description }}{{ end }}
{{ end }}

**[⬆ revenir au début](#contents)**

## Comparateurs

### France

{{ range .Comparators_FR -}}
- [{{ .name }}]({{ .url }}){{ if .description }} : {{ .description }}{{ end }}
{{ end }}

**[⬆ revenir au début](#contents)**

### International

{{ range .Comparators_WORLD -}}
- [{{ .name }}]({{ .url }}){{ if .description }} : {{ .description }}{{ end }}
{{ end }}

**[⬆ revenir au début](#contents)**


## Général

Sites généraux en lien avec le jeu de société

{{ range .General -}}
- [{{ .name }}]({{ .url }}) [{{ .country }}]{{ if .description }} : {{ .description }}{{ end }}
{{ end }}

**[⬆ revenir au début](#contents)**

