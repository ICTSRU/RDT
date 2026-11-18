/*  SRU Rooms Digital Twin — front-end config
    Copy this file to  config.js  and fill in the two values, then commit config.js.
    config.js is git-ignored in the sample .gitignore; remove it from .gitignore if you
    prefer to commit the public Web App URL (it is not a secret).                        */

window.RDT_CONFIG = {
  // Apps Script Web App URL  (Deploy > Web app > Copy URL, ends with /exec)
  API_URL: "",

  // OAuth 2.0 Web client ID from Google Cloud Console (same project as the Apps Script)
  GOOGLE_CLIENT_ID: "",

  // Only this e-mail domain may sign in
  ALLOWED_DOMAIN: "sr.edu.sa",

  // Official logos — bundled with every platform under assets/logos/ (the standard).
  LOGO_SRU:  "assets/logos/logo-sru.png",
  LOGO_ICTD: "assets/logos/logo-ictd.png",
  LOGO_ITOC: "assets/logos/logo-itoc.png",
  ITOC_HUB:  "https://ictsru.github.io/ITOC/#forms"
};
