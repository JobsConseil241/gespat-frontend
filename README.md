# GESPAT — Frontend Web

SPA Vue 3 + TypeScript de la plateforme **GESPAT** — interface administrative et opérationnelle pour la gestion du patrimoine.

> **Maître d'œuvre** : MRTECH — MEBODO Richard Aristide
> **Stack** : Vue 3 (Composition API + `<script setup>`) · TypeScript · Vite 8 · Pinia · Vue Router 4 · Tailwind 3 · Chart.js · Axios

## Vue d'ensemble

| Métrique | Valeur |
|---|---|
| Pages (chunks routés) | 24 |
| Composants partagés | 7 |
| Tests Vitest | 38 (7 fichiers) |
| Bundle principal | ~153 KB (~58 KB gzip) |
| Code splitting | 1 chunk par route |

## Stack

- **Vue 3.5** Composition API + `<script setup>`
- **TypeScript** strict + alias `@/`
- **Vite 8** + plugin Vue
- **Pinia 3** — store auth avec token persisté en localStorage
- **Vue Router 4** + guards `requiresAuth` / `guest`
- **Axios** — intercepteurs Bearer + auto-redirect 401
- **Tailwind CSS 3** — palette `gespat` custom + composants utilitaires (`.btn-primary`, `.card`, `.badge-*`, `.table`)
- **Heroicons** + **Chart.js / vue-chartjs** (dashboard + audit)
- **Vitest 2** + **@vue/test-utils** + **jsdom**

## Sidebar — 7 sections / 24 pages

| Section | Pages |
|---|---|
| **Tableau de bord** | DashboardPage (KPI + 3 graphiques Chart.js) |
| **Patrimoine** | Immobilisations List/Form/Detail · Mouvements · Sorties · Maintenances · Amortissements |
| **Inventaire** | Campagnes List/Form/Detail |
| **Codification** | Plans de codification (avec simulation live) · Étiquettes (lots + PDF) |
| **Comptabilité** | Imports · Matching · Réconciliation |
| **Référentiel** | Sites · Localisations · Services · Catégories · Fournisseurs |
| **Administration** | Utilisateurs (CRUD + rôles + reset password) · Audit trail (avec diff) |

## Démarrage local

### Prérequis

- Node 20+ et npm
- Backend GESPAT actif sur `http://127.0.0.1:8000`
  (voir https://github.com/JobsConseil241/gespat-backend)

### Installation

```bash
# 1. Cloner
git clone https://github.com/JobsConseil241/gespat-frontend.git
cd gespat-frontend

# 2. Dépendances
npm install

# 3. Configuration
cp .env.example .env       # VITE_API_URL=http://127.0.0.1:8000/api/v1

# 4. Démarrer
npm run dev                # http://127.0.0.1:5173
```

### Comptes de démo

```
admin@gespat.local      / ChangeMe!2026   (super_admin)
patrimoine@gespat.local / ChangeMe!2026   (gestionnaire_patrimoine)
```

## Scripts npm

```bash
npm run dev                # serveur Vite
npm run build              # production build (vue-tsc + vite build)
npm run preview            # preview du build
npm test                   # Vitest une fois
npm run test:watch         # Vitest en mode watch
npm run test:coverage      # avec rapport de couverture v8
```

## Tests

```
src/
├── api/client.spec.ts                 # 5 tests (intercepteur Bearer + redirect 401)
├── stores/auth.spec.ts                # 7 tests (login/logout/can/hasRole/isAdmin)
├── components/
│   ├── StatusBadge.spec.ts            # 5 tests (30+ variantes de couleurs)
│   ├── Pagination.spec.ts             # 7 tests (émissions + bornes)
│   └── ConfirmDialog.spec.ts          # 4 tests (Teleport + variant danger)
└── pages/
    ├── DashboardPage.spec.ts          # 5 tests (KPI formatés FR, parallélisme appels)
    └── AuditLogsPage.spec.ts          # 5 tests (diff colorisé, fallback "système")
```

## Architecture

```
src/
├── api/
│   ├── client.ts                # Axios instance + intercepteurs
│   └── endpoints.ts             # ~20 modules d'endpoints typés
├── stores/
│   └── auth.ts                  # Pinia : token + user + can/hasRole/isAdmin
├── components/
│   ├── PageHeader.vue
│   ├── Pagination.vue
│   ├── ConfirmDialog.vue
│   ├── EmptyState.vue
│   ├── StatusBadge.vue          # 30+ variantes statut/event/type
│   └── ChartCard.vue            # Doughnut + Bar via vue-chartjs
├── layouts/
│   └── AppLayout.vue            # Sidebar responsive groupée + topbar + menu user
├── pages/                       # 24 pages organisées par module
├── router/index.ts              # Routes + guards
├── stores/                      # Pinia stores
├── test/setup.ts                # Mocks globaux Vitest (localStorage, matchMedia)
├── types/index.ts               # Types métier partagés
├── App.vue
├── main.ts
└── style.css                    # Tailwind base + composants utilitaires
```

## Build production

```bash
npm run build
# → dist/ prêt à uploader (statique)
```

Pour un déploiement sur un sous-domaine (ex. `app.tondomaine.ga`), ajoute un `.htaccess` à la racine pour le routing SPA :

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

Et un fichier `.env.production` avec l'URL de l'API de prod :

```env
VITE_API_URL=https://api.tondomaine.ga/api/v1
VITE_APP_NAME=GESPAT
```

## Surfaces liées

- Backend Laravel : https://github.com/JobsConseil241/gespat-backend
- Mobile Flutter : https://github.com/JobsConseil241/gespat-mobile (privé)

## Licence

Propriétaire — MRTECH / Commanditaire. Tous droits réservés.
