# Developpement

## README.md

Comment régénérer en local le contenu du fichier README.md : dans le répertoire courant, il suffit de lancer la commande suivante.

```bash
go run ./updater
```

## web

Comment tester la partie web en local : dans le répertoire courant, lancer la commande suivante (pour démarrer un serveur en local, accessible sur http://localhost:8000/web/search.html ensuite).

```bash
python3 -m http.server 8000
```

