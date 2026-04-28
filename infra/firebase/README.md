# Firebase Deployment

This directory holds the Firebase configuration for the project. The repo can deploy the Vite frontend to Firebase Hosting and manage Firestore security rules/indexes through the Firebase CLI.

The repository supports two Firebase projects through `.firebaserc` aliases:

- `financial` -> `financial-suite`
- `accademia` -> `accademia-previdenza`

Use [Firebase multi-project deploy](../../docs/FIREBASE_MULTI_PROJECT_DEPLOY.md) for the branch-based deployment flow.

## Prerequisites

- Node.js 18+ and either `pnpm` (preferred) or `npm` available on your PATH
- Firebase CLI: `npm install -g firebase-tools`
- Access to the Firebase project you want to deploy to: `financial-suite` or `accademia-previdenza`

## One-time setup

```bash
# Authenticate the CLI
firebase login

# Verify aliases and the selected project
firebase projects:list
firebase use financial
firebase use accademia
```

If you plan to use the emulators locally, start them with:

```bash
firebase emulators:start --only firestore,hosting
```

## Build and deploy Hosting

```bash
# Install deps once (or run `npm --prefix app/frontend install`)
pnpm --dir app/frontend install

# Build the production bundle
pnpm --dir app/frontend build

# Deploy static hosting + Firestore rules/indexes to the selected project
firebase deploy --only hosting,firestore --project financial
firebase deploy --only hosting,firestore --project accademia
```

For a two-environment flow (`test`/`prod`) with Cloud Run + Hosting, use the dedicated runbook:

- `docs/DEPLOY_TEST_PROD.md`

In particular:
- `test` can be deployed to a Hosting preview channel (`firebase hosting:channel:deploy ...`)
- `prod` should deploy to live Hosting (`firebase deploy --only hosting`)
- project selection must be explicit with `--project` or `FIREBASE_PROJECT_ID`.

The Hosting configuration in `firebase.json` serves the contents of `app/frontend/dist` and rewrites all requests to `index.html` so client-side routing works. Remember to set `VITE_API_BASE` during your frontend build so calls go to the deployed backend (for example a Cloud Run URL).

## Firestore rules & indexes

- Update `infra/firebase/firestore.rules` as you open up read/write access to Firestore from client apps.
- Define composite indexes in `infra/firebase/firestore.indexes.json`. The Firebase CLI keeps the file in sync when you create indexes through the console.

To push changes to rules or indexes without touching Hosting, you can run:

```bash
firebase deploy --only firestore
```

## Next steps

- Automate deployment via CI by running the same build + `firebase deploy` commands.
- Update Hosting rewrites or headers in `firebase.json` if you need to proxy API traffic (for example to a Cloud Run service that hosts the FastAPI backend).
