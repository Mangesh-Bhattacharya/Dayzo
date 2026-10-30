// Expo config plugin: signs the Android release build with your own keystore when
// DAYZO_KEYSTORE (path), DAYZO_KEYSTORE_PASSWORD, DAYZO_KEY_ALIAS, DAYZO_KEY_PASSWORD are set.
// Without them the build falls back to the default debug key (installs fine, but cannot be updated in place by a differently-signed build).
const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (cfg) => {
    let src = cfg.modResults.contents;
    if (src.includes('dayzoRelease')) return cfg; // already patched
    src = src.replace(
      /signingConfigs\s*\{\s*debug\s*\{([\s\S]*?)\n        \}\n    \}/,
      (m) =>
        m.replace(/\n    \}$/, `
        dayzoRelease {
            def ks = System.getenv('DAYZO_KEYSTORE')
            if (ks) {
                storeFile file(ks)
                storePassword System.getenv('DAYZO_KEYSTORE_PASSWORD')
                keyAlias System.getenv('DAYZO_KEY_ALIAS')
                keyPassword System.getenv('DAYZO_KEY_PASSWORD')
            }
        }
    }`),
    );
    src = src.replace(
      /(release \{[\s\S]*?)signingConfig signingConfigs\.debug/,
      "$1signingConfig (System.getenv('DAYZO_KEYSTORE') ? signingConfigs.dayzoRelease : signingConfigs.debug)",
    );
    cfg.modResults.contents = src;
    return cfg;
  });
};
