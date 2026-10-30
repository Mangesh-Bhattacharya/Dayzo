# Dayzo: store submission guide

Everything that can be prepared without your accounts is done. This file lists what is ready and what only you can do.

## Status

| Item | State |
|---|---|
| App tested (31 logic checks, 16 browser checks, iOS + Android bundles compile, expo-doctor 20/20) | Done |
| Store screenshots (Apple 1290x2796, Play 1080x2160), feature graphic, 512 icon | Done, in `store/` and `fastlane/` |
| Listing text, privacy policy, data-safety / privacy-label answers | Done, in `store/` (fill the 3 placeholders) |
| Real Android/iOS binaries (.aab / .ipa) | Needs you: EAS login (cloud build) |
| Store accounts, bundle ID, price, submission | Needs you |
| F-Droid main repo | Blocked by a dependency, see section 4 |

Placeholders to fill: support email in `store/privacy-policy.md`, support URL and copyright line in `store/apple/listing.md`, your real bundle ID in `app.json`.

## 1. Before any store

1. Pick a bundle/application ID you control (reverse domain, e.g. `com.yourname.dayzo`). Change `ios.bundleIdentifier` and `android.package` in `app.json`. It cannot be changed after publishing.
2. Host the privacy policy at a public URL (a GitHub Pages page or any static page). Both stores require the URL.
3. Install the build tool and sign in (this is you logging in, not something to share):
   `npm i -g eas-cli && eas login && eas build:configure`

## 2. Google Play (paid, $2.00)

1. Create a Play Console developer account (US$25, identity verification required).
2. Set up a payments/merchant profile (required to sell paid apps).
3. `eas build -p android --profile production` produces an .aab.
4. Create the app in Play Console: type App, Paid. Fill listing from `store/google/listing.md`; upload images from `fastlane/metadata/android/en-US/images/`.
5. Complete Data safety (answers in the listing file), content rating, target audience 18+.
6. Newly created personal developer accounts may have to run a closed test with a minimum number of testers for a set period before production access is granted. Check the current rule in Play Console under Production > Apply for access.
7. `eas submit -p android` (needs a Play service-account key) or upload the .aab manually.
8. A paid app can never be made free later (and vice versa). Decide the pricing model first.

## 3. Apple App Store (paid)

1. Apple Developer Program: US$99/year. A Mac is not required when you use EAS cloud builds.
2. `eas build -p ios --profile production`, then `eas submit -p ios`.
3. In App Store Connect: Pricing > US$1.99 (nearest US price point to $2.00). Fill the listing from `store/apple/listing.md`, upload `store/apple/screenshots-6.7in`.
4. App Privacy: Data Not Collected. The export-compliance flag is already set.
5. Expect review in about 1 to 2 days. Apple sometimes rejects very simple apps under "minimum functionality" (guideline 4.2); the history chart, streaks, month tracking and notifications are the answer to that. Say so in the review notes if asked.

Optional proprietary store: Samsung Galaxy Store accepts the same signed APK/AAB; check its current seller requirements.

## 4. Open-source stores: what is actually possible

Two facts decide this, and both are verified against the stores' published policies.

**a) F-Droid (main repo) will reject the current build.** Its inclusion policy forbids Firebase and Google Play Services, and `expo-notifications` bundles `firebase-messaging` on Android (confirmed in `node_modules/expo-notifications/android/build.gradle`). Also, F-Droid only hosts free software; there is no paid listing.

**b) Open source and a $2 price pull against each other.** Any OSI-approved license lets anyone build and distribute the app for free, and every open-source store requires such a license plus a public source repo. The client has to decide whether he is fine with that. A common compromise is a public repo with paid store builds that buy convenience, updates and support. I did not add a LICENSE file because that is the copyright owner's call.

Options, cheapest first:

| Route | What it takes | Catch |
|---|---|---|
| GitHub Releases | Public repo, signed APK attached to each release (`eas build -p android --profile preview`) | None. Users sideload or use Obtainium. |
| IzzyOnDroid | Public repo with OSI license, APK in GitHub releases, fastlane metadata (already in `fastlane/`), request at their issue tracker on Codeberg | Free-only. Its policy tolerates some non-free dependencies; confirm Firebase is acceptable when you file. Keep the same signing key for all releases. |
| Your own F-Droid-style repo | Run `fdroidserver` on any static host | You are the store; users add the repo URL. |
| F-Droid main | Build flavor with no Firebase: replace `expo-notifications` with a Firebase-free local-notification module (or drop reminders in that flavor), then submit a merge request to `fdroiddata` | A few hours of native work plus real-device testing. I did not do this: it cannot be verified from here and I did not want to ship an untested notification path. |

## 5. Why I did not publish for you

Creating developer accounts, signing in, paying fees and setting prices are actions only you can take. Everything above is staged so each step is a form fill or one command.
