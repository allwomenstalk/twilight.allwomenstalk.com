const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dataPath = path.join(root, "signature-data.json");
const outputPath = path.join(root, "signature.html");

const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

const name = data.name || "";
const title = data.title || "";
const email = data.email || "";
const website = data.website || "";
const logoUrl = data.logoUrl || "";
const logoAlt = data.logoAlt || "Logo";
const brandColor = data.brandColor || "#e06c5b";
const textColor = data.textColor || "#222222";
const mutedColor = data.mutedColor || "#666666";
const borderColor = data.borderColor || "#f0c4b4";

const line = (html) => (html ? `          ${html}\n` : "");

const nameLine = name
  ? `<div style="font-size: 16px; font-weight: 700; line-height: 1.2; color: ${textColor};">${name}</div>`
  : "";
const titleLine = title
  ? `<div style="font-size: 13px; color: ${mutedColor}; line-height: 1.4;">${title}</div>`
  : "";
const emailLine = email
  ? `<div style="font-size: 13px; line-height: 1.6; margin-top: 6px;"><span style="color: #999999;">Email:</span> <a href="mailto:${email}" style="color: ${textColor}; text-decoration: none;">${email}</a></div>`
  : "";
const websiteLine = website
  ? `<div style="font-size: 13px; line-height: 1.6;"><a href="${website}" target="_blank" style="color: ${brandColor}; text-decoration: none; font-weight: 600;">${website.replace(/^https?:\/\//, "")}</a></div>`
  : "";

const hasLogo = Boolean(logoUrl);

const leftCell = hasLogo
  ? `      <td style="padding-right: 14px; border-right: 2px solid ${borderColor};">
        <a href="${website || "#"}" target="_blank" style="text-decoration: none;">
          <img
            src="${logoUrl}"
            alt="${logoAlt}"
            width="120"
            style="display: block; border: 0; outline: none; height: auto;"
          />
        </a>
      </td>
`
  : "";

const rightCell = `      <td style="${hasLogo ? "padding-left: 14px;" : ""}">
${line(nameLine)}${line(titleLine)}${line(emailLine)}${line(websiteLine)}      </td>
`;

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Email Signature</title>
  </head>
  <body>
    <!-- Copy everything inside the signature wrapper into Gmail -->
    <table
      class="signature"
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="font-family: Arial, sans-serif; color: ${textColor};"
    >
      <tr>
${leftCell}${rightCell}      </tr>
    </table>
  </body>
</html>
`;

fs.writeFileSync(outputPath, html, "utf8");
console.log(`Wrote ${path.relative(root, outputPath)}`);
