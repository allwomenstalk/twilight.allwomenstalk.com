# Gmail Signature Setup

This repo includes `signature.html`, a ready-to-use email signature for Gmail with the Allwomenstalk logo.
Edit `signature-data.json`, then regenerate the HTML.

## Quick setup (recommended)
1. Update `signature-data.json` with your details.
2. Run:
   ```bash
   node tools/generate-signature.js
   ```
3. Open `signature.html` in a browser.
4. Select the signature content (logo + text) and copy it.
5. Open Gmail.
6. Click the gear icon → **See all settings**.
7. In the **General** tab, scroll to **Signature**.
8. Click **Create new**, give it a name, then paste the signature.
9. (Optional) Set it as the default for new emails and replies/forwards.
10. Scroll down and click **Save Changes**.

## Update your details
Edit these fields inside `signature-data.json` before copying:
- Name
- Title
- Email address
- Website

## Notes
- Phone is removed.
- Any empty field is automatically hidden.
- The logo is hosted at `https://allwomenstalk.com/images/appicon.png`.
- Gmail prefers inline styles and table layouts, which this file already uses.
