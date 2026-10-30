# Google Play Console listing

- App name (max 30): Dayzo: Daily Budget
- Short description (max 80) / Full description: fastlane/metadata/android/en-US/
- Graphics: icon 512x512, feature graphic 1024x500, phone screenshots 1080x2160 (all under fastlane/metadata/android/en-US/images)
- Category: Finance. Tags: Budgeting, Personal finance
- App type: App (not game). Pricing: Paid, set base price to 2.00 USD (Play can convert per country).
  A free app can never be switched to paid, and a paid app can never be switched to free (you would publish a new app / use in-app purchase instead).
- Content rating questionnaire: no violence, no user-generated content, no location, no purchases inside the app -> expect Everyone / PEGI 3
- Target audience: 18+ (financial app, not for children)
- Data safety form: "Does your app collect or share any required user data types?" -> No. Data is not collected, not shared, nothing leaves the device. Encryption in transit: not applicable.
- Permissions in the built APK (verified with aapt2): POST_NOTIFICATIONS and RECEIVE_BOOT_COMPLETED (reminders, and restoring them after a reboot), VIBRATE, WAKE_LOCK, ACCESS_NETWORK_STATE and INTERNET (framework defaults). Overlay, storage, push-receive and install-referrer permissions are removed in app.json. Nothing sensitive is requested.
- Ads: No. Government app: No. Financial features declaration: select "My app doesn't provide any financial features" (it is a manual tracker, no money movement, loans or payments).
