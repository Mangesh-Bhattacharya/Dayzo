# Dayzo - daily budget app

Enter monthly income, get one daily number (income / days in month), log spends, watch the number drop.
Green -> amber -> red as the day's budget is used up. Morning (8:00) and night (21:30) local notifications.
All data stays on-device (AsyncStorage). No accounts, no backend, no network calls.

## Run
    npm install
    npx expo start          # scan QR with Expo Go (iOS/Android), or press w for web preview
    npx tsc --noEmit        # typecheck

## Ship ($2.00 paid app)
1. Change `ios.bundleIdentifier` and `android.package` in app.json from com.dayzo.app to your own ID.
2. `npm i -g eas-cli && eas login && eas build:configure`
3. `eas build -p ios --profile production` and `eas build -p android --profile production`
4. `eas submit -p ios` / `eas submit -p android`
5. App Store Connect: Pricing -> pick the Tier/price point closest to US$2.00 (Apple converts to INR and other currencies).
   Play Console: Monetize -> Set up paid app -> price $2.00. NOTE: a Play app set to paid cannot later be switched to free.
   (Free + one-time in-app unlock is the alternative; it needs a purchases SDK such as RevenueCat.)
6. Needed for review: privacy policy URL (state: no data collected, stored on device only), screenshots, app description.
   Apple: App Privacy = "Data Not Collected". Google: Data safety = no data collected/shared.
7. Accounts: Apple Developer US$99/yr, Google Play one-time US$25.

## Known scope limits (v1)
- Spends are entered manually (quick-add chips make it a 2-tap job). Automatic UPI/SMS capture is not included:
  iOS cannot read SMS, and Google Play restricts the SMS permission. Candidate v2: Android on-device SMS parsing.
- Notification numbers are refreshed whenever the app is opened or data changes (next 7 days are pre-scheduled).

## Free distribution (no store fees)
See FREE-DISTRIBUTION.md. Short version: push this repo to GitHub, add the signing secrets, and tag `v1.0.0`.
GitHub Actions builds the APK (and publishes the installable web app to GitHub Pages) for free.
Paid store routes are in STORE-SUBMISSION.md.
