# Bienvenue sur DeliveCROUS 🍽️

DeliveCROUS est une application mobile qui permet aux étudiants de commander des plats du CROUS directement depuis leur smartphone et de se faire livrer sur leur campus universitaire.

## Fonctionnalités principales

- **Inscription et connexion** faciles pour accéder à vos services de restauration universitaire
- **Catalogue de plats** complet proposé par les restaurants CROUS
- **Système de favoris** pour retrouver rapidement vos repas préférés
- **Commandes personnalisées** avec choix de l'université et de la salle de livraison
- **Historique des commandes** avec possibilité de visualiser les détails et d'annuler

## Installation et démarrage

### Prérequis

- Node.js et npm installés sur votre machine
- Expo CLI installé globalement (`npm install -g expo-cli`)

### Configuration de l'environnement

1. Créez un fichier `.env` à la racine du projet en suivant le modèle du fichier `.env.example`
2. Renseignez votre adresse IP locale dans la variable `API_URL` si vous travaillez en local :
   ```
   API_URL=http://VOTRE_ADRESSE_IP:PORT
   ```

### Installation des dépendances

```bash
npm install
```

### Lancement du projet

Le projet nécessite deux terminaux :

1. Pour lancer le backend :
```bash
npm run backend
```

2. Pour lancer l'application :
```bash
npm start
```

Suivez les instructions dans le terminal pour ouvrir l'application sur :
- Votre appareil mobile avec Expo Go
- Un émulateur Android
- Un simulateur iOS

## Structure de l'application

- **Écran d'authentification** : Inscription et connexion
- **Écran principal** : Liste des plats disponibles
- **Écran détail** : Informations complètes sur un plat et option de commande
- **Écran favoris** : Accès rapide à vos plats préférés
- **Écran commandes** : Historique des commandes passées
- **Panier** : Ajout de plusieurs plats pour une commande groupée

## Support

Si vous rencontrez des problèmes lors de l'installation ou de l'utilisation de DeliveCROUS, contactez l'équipe de développement.

Bon appétit et bonne utilisation de DeliveCROUS ! 🍕🥗🍱