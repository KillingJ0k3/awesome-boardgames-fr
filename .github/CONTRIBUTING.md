# Comment contribuer

## Gestion des sites

Il vous suffit de : 

- Créer un pull-request
- Faire les modifications nécessaires dans les fichiers `*.yaml` dans le répertoire [data/](data/)
- Pousser votre pull-request

### Définition d'un site

Chaque site, au sein des fichiers `*.yaml`, a la définition suivante : 

```yaml
- name: Nom du site
  url: https://www.url-du-site.com/
  search: "/path-de-recherche"
  tags: [ "tag1", "tag2" ]
  country: international
```

Les pays disponibles étant : 

- `fr` : France
- `be` : Belgique
- `de` : Allemagne
- `international` : reste du monde

Les tags sont : 

- `classiques` : jeux classiques (échecs, go, ...) ou traditionnels
- `jdr` : jeux de rôle
- `jdp` : jeux de plateau / jeux de société
- `jdc` : jeux de cartes
- `figurines` : jeux de figurines
- `warhammer` : revendeur Games Workshop
- `wargames` : jeux de type wargame

### Notes

- Ne pas modifier le contenu du fichier `README.md` : il est automatiquement mis à jour depuis les fichiers `*.yaml`
- L'ajout de nouveau tags est libre (mais il faut rester raisonnable)
- L'ajout de nouvelles catégories est plus compliqué, et nécessite des modifications en conséquence dans les fichiers `updater/updater.go` et `web/app.js`

