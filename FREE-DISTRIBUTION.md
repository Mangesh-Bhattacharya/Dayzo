# Getting Dayzo to users without paying any store

Nothing here costs money up front. Each route lists what you get and what you give up.

## Android

| Route | Cost | How | Limits |
|---|---|---|---|
| GitHub Releases (APK download) | Free | Push the repo to GitHub, add a signing key (below), push a tag like `v1.0.0`. The `Build Android APK` workflow builds and attaches `dayzo-v1.0.0.apk`. | Users enable "install unknown apps" once. No built-in updates. |
| Obtainium (updates) | Free | Users add your GitHub repo URL to the free Obtainium app and it installs and updates from your releases. | Needs a public repo (or a token). |
| Direct download from your own site | Free | Host the APK anywhere (GitHub Pages, Netlify, Cloudflare Pages). | Same sideload step. |
| IzzyOnDroid | Free | Public repo + OSI licence + the APK on GitHub releases + the `fastlane/` metadata already in this project. Request inclusion at their Codeberg tracker. | Free apps only, open source only. |
| Aptoide, Uptodown | Reported free to publish | Create a developer account and upload the signed APK. | Mostly free apps; check each store's current paid-app terms. |
| Huawei AppGallery, Amazon Appstore | Reported free to register | Create a developer account and upload the APK. | Identity checks; AppGallery reach is mainly Huawei devices. Check current terms. |
| Samsung Galaxy Store | Not free for you | Samsung's developer relations has stated that free-distributor accounts no longer exist and publishing needs a registered commercial seller. | Skip unless you have a registered business. |

### Sign the APK with your own key (one time)
1. `./scripts/make-keystore.sh` (needs Java). It creates `dayzo-release.keystore`. Back it up and never lose the password: all future updates must use the same key.
2. In your GitHub repo: Settings > Secrets and variables > Actions, add
   `DAYZO_KEYSTORE_B64` (output of `base64 -w0 dayzo-release.keystore`), `DAYZO_KEYSTORE_PASSWORD`, `DAYZO_KEY_ALIAS` (`dayzo`), `DAYZO_KEY_PASSWORD`.
3. `git tag v1.0.0 && git push origin v1.0.0`. The APK appears under Releases in a few minutes.
Without the secrets the build still works but uses the debug key; do not hand that to the public.

## iPhone / iPad (Apple does not allow any free store)

| Route | Cost | How | Limits |
|---|---|---|---|
| Install as a web app (recommended) | Free | The `Publish web app` workflow puts it on GitHub Pages. On the iPhone open the link in Safari > Share > Add to Home Screen. Works offline, keeps data on the device. | No scheduled reminders (browsers cannot schedule local notifications), no App Store listing. |
| AltStore / Sideloadly with a free Apple ID | Free | Build the unsigned .ipa with the experimental `Build unsigned iOS IPA` workflow (free macOS runner), then sign and install with AltStore or Sideloadly. | Sources report 3 apps max and a 7-day signing window that must be refreshed. The workflow has not been run. Free Apple IDs also cannot use push capabilities, so reminders may not work. |

Whatever you do, TestFlight, the App Store and EU alternative marketplaces need either the paid developer program or a business, so they are not part of this list.

## Charging $2 without a store

Stores are not the only way to be paid. Sell the APK link (and the web-app link) through a payment-link seller such as Gumroad or Lemon Squeezy: they take a percentage per sale instead of an upfront fee (check their current rates). Deliver a private download after payment. This conflicts with open-sourcing the repo: anyone could build it from source for free.

## Set up the free publishing (about 10 minutes)
1. Create a GitHub account if needed and a new repository.
2. `git init && git add . && git commit -m "Dayzo 1.0" && git branch -M main && git remote add origin <your repo url> && git push -u origin main`
3. Repo Settings > Pages > Source: GitHub Actions. Push to `main` builds and publishes the web app.
4. Add the signing secrets, then push a `v*` tag for the APK.
