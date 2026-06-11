# FlashStudy

FlashStudy est une application web qui transforme automatiquement vos cours (PDF ou texte) en flashcards, quiz interactifs et fiches de révision grâce à l'IA (Google Gemini). Elle inclut une page d'accueil (landing page), un système d'authentification, un tableau de bord, et un plan Premium géré via Stripe.

## Stack technique

- **Frontend** : React + TypeScript + Vite, Tailwind CSS, lucide-react
- **Backend / Auth / DB** : Supabase (Postgres, Auth, Edge Functions)
- **IA** : Google Gemini (`@google/genai`)
- **Paiements** : Stripe (Checkout + Billing Portal, mode test)

## Run Locally

**Prérequis :** Node.js

1. Installer les dépendances :
   `npm install`
2. Configurer les variables d'environnement dans [.env.local](.env.local) :
   - `GEMINI_API_KEY` : votre clé API Gemini
   - `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` : votre projet Supabase
   - `VITE_STRIPE_PUBLISHABLE_KEY` : clé publique Stripe (mode test)
3. Lancer l'application :
   `npm run dev`

## Page d'accueil (Landing Page)

Lorsqu'un visiteur n'est pas connecté, il arrive sur une landing page ([components/LandingPage.tsx](components/LandingPage.tsx)) présentant les fonctionnalités, le fonctionnement et les tarifs de FlashStudy, avec des appels à l'action vers l'inscription ou la connexion ([components/Auth.tsx](components/Auth.tsx)).

## Configuration Stripe (mode test)

La logique Stripe est hébergée dans des **Supabase Edge Functions** (dossier [supabase/functions/](supabase/functions/)) :

- `create-checkout-session` : crée une session Stripe Checkout (abonnement Premium)
- `create-portal-session` : ouvre le portail client Stripe pour gérer l'abonnement
- `stripe-webhook` : synchronise le statut `is_vip` du profil utilisateur avec Stripe

### Étapes de déploiement

```bash
# 1. Login + lien du projet Supabase
npx supabase login
npx supabase link --project-ref <votre-project-ref>

# 2. Appliquer la migration SQL (colonnes stripe_customer_id, stripe_subscription_id)
npx supabase db push

# 3. Configurer les secrets des edge functions
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx
npx supabase secrets set STRIPE_PREMIUM_PRICE_ID=price_xxx
npx supabase secrets set APP_URL=http://localhost:3000

# 4. Déployer les fonctions
npx supabase functions deploy create-checkout-session
npx supabase functions deploy create-portal-session
npx supabase functions deploy stripe-webhook
```

### Webhook Stripe

Dans le [Dashboard Stripe (mode test)](https://dashboard.stripe.com/test/webhooks), créez un endpoint pointant vers :

```
https://<votre-project-ref>.supabase.co/functions/v1/stripe-webhook
```

en vous abonnant aux événements `checkout.session.completed`, `customer.subscription.updated` et `customer.subscription.deleted`. Récupérez ensuite le secret de signature et configurez-le :

```bash
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
npx supabase functions deploy stripe-webhook
```

Pour tester un paiement, utilisez la carte de test Stripe `4242 4242 4242 4242` avec n'importe quelle date future et CVC.
