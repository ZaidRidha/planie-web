/* Preview renderer for the admin waitlist broadcast.

   KEEP IN SYNC with planie-backend/functions/src/utils/emailTemplates.ts
   (buildBroadcastEmail). The two repos deploy separately, so this is a
   deliberate copy rather than a shared import — a preview that has drifted
   from what SendGrid actually posts is worse than no preview at all, so any
   change to the email must be made in both files.

   Merge tags are NOT resolved here: the backend resolves them per recipient.
   The preview substitutes the first selected row so the admin sees real copy
   rather than {{city}}. */

const PAPER = "#EFE7DD";
const CARD = "#FFFDFB";
const INK = "#12100E";
const INK_BODY = "#4A443E";
const MUTED = "#8C837B";
const FAINT = "#B8AFA6";
const SANS = "'Plus Jakarta Sans',Arial,Helvetica,sans-serif";
const SERIF = "Georgia,'Times New Roman',serif";

const LOGO = "https://planie-app-project.web.app/email-logo.png";

export function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function paragraphs(text, style) {
  return text
    .split(/\n{2,}/)
    .map((para) => {
      const safe = escapeHtml(para.trim()).replace(/\n/g, "<br/>");
      const linked = safe.replace(
        /(https?:\/\/[^\s<]+)/g,
        `<a href="$1" style="color:${INK};">$1</a>`,
      );
      return `<p style="${style}">${linked}</p>`;
    })
    .join("");
}

/* A short single paragraph sits centred under the headline the way the design
   intends; anything longer is a letter, and centred body copy is unreadable. */
const LEAD_MAX = 200;

export function buildBroadcastEmail(parts, unsubUrl) {
  const {
    eyebrow = "", heading = "", message = "",
    ctaLabel = "", ctaUrl = "", ctaNote = "",
    stepsTitle = "", steps = [], footerNote = "", signoff = "Thanks,",
  } = parts;

  const isLead = !message.includes("\n\n") && message.length <= LEAD_MAX;

  const eyebrowHtml = eyebrow
    ? `<p style="margin:0;font-family:${SANS};font-size:10px;font-weight:bold;letter-spacing:3px;color:${FAINT};mso-line-height-rule:exactly;line-height:14px">${escapeHtml(eyebrow.toUpperCase())}</p>`
    : "";

  const headingHtml = heading
    ? `<h1 class="h1" style="margin:${eyebrow ? "18px" : "0"} 0 0;font-family:${SERIF};font-size:37px;line-height:44px;mso-line-height-rule:exactly;font-weight:normal;color:${INK};letter-spacing:-0.9px">${escapeHtml(heading)}</h1>`
    : "";

  const messageHtml = isLead && message
    ? paragraphs(message, `margin:${heading || eyebrow ? "16px" : "0"} 0 0;font-family:${SANS};font-size:15.5px;line-height:26px;mso-line-height-rule:exactly;color:${MUTED}`)
    : "";

  const bodyHtml = isLead || !message
    ? ""
    : `<tr><td style="padding:${heading || eyebrow ? "22px" : "0"} 56px 0" class="px">
        ${paragraphs(message, `margin:0 0 18px;font-family:${SANS};font-size:15.5px;line-height:26px;mso-line-height-rule:exactly;color:${INK_BODY}`)}
      </td></tr>`;

  const ctaHtml = ctaLabel && ctaUrl
    ? `<tr><td align="center" style="padding:34px 56px 0" class="px">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td align="center" bgcolor="${INK}" style="border-radius:2px"><a href="${escapeHtml(ctaUrl)}" style="display:block;padding:17px 34px;font-family:${SANS};font-size:12px;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:1.6px">${escapeHtml(ctaLabel.toUpperCase())}</a></td>
        </tr></table>
        ${ctaNote ? `<p style="margin:14px 0 0;font-family:${SANS};font-size:12.5px;line-height:20px;mso-line-height-rule:exactly;color:${FAINT}">${escapeHtml(ctaNote)}</p>` : ""}
      </td></tr>`
    : "";

  const stepRows = steps
    .map((step, i) => {
      const rule = i === 0
        ? ""
        : `<tr><td colspan="2" style="padding:24px 0 0;border-bottom:1px solid #F2EBE3;font-size:0;line-height:0">&nbsp;</td></tr>`;
      return `${rule}
        <tr>
          <td width="42" valign="top" style="padding:24px 0 0;font-family:${SERIF};font-size:17px;color:#C4BDB5;mso-line-height-rule:exactly;line-height:25px">${i + 1}</td>
          <td style="padding:24px 0 0;font-family:${SANS};font-size:15.5px;line-height:25px;mso-line-height-rule:exactly;color:${INK_BODY}">${escapeHtml(step)}</td>
        </tr>`;
    })
    .join("");

  const stepsHtml = steps.length
    ? `${stepsTitle
      ? `<tr><td style="padding:48px 56px 0" class="px">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%">
          <tr><td align="center" style="border-top:1px solid ${PAPER};padding:26px 0 0;font-family:${SANS};font-size:10px;font-weight:bold;letter-spacing:3px;color:${FAINT};mso-line-height-rule:exactly;line-height:14px">${escapeHtml(stepsTitle.toUpperCase())}</td></tr>
          </table>
        </td></tr>`
      : ""}
      <tr><td style="padding:${stepsTitle ? "8px" : "40px"} 56px 0" class="px">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%">${stepRows}</table>
      </td></tr>`
    : "";

  const footerNoteHtml = footerNote
    ? `<tr><td style="padding:44px 56px 0" class="px">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%">
        <tr><td style="border-top:1px solid ${PAPER};padding:28px 0 0;font-family:${SANS};font-size:14px;line-height:24px;mso-line-height-rule:exactly;color:#A29A92">${escapeHtml(footerNote)}</td></tr>
        </table>
      </td></tr>`
    : "";

  const unsubHtml = unsubUrl
    ? `<br /><a href="${unsubUrl}" style="color:#B0A79E;text-decoration:underline">Unsubscribe</a> from Planie emails.`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<style>
@media only screen and (max-width:620px){.px{padding-left:30px !important;padding-right:30px !important}.h1{font-size:31px !important;line-height:36px !important}}
</style>
</head>
<body style="margin:0;padding:0;background:${PAPER};-webkit-font-smoothing:antialiased">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${PAPER}">
<tr><td align="center" style="padding:56px 12px 60px">

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="width:560px;max-width:560px;background:${CARD};border-radius:4px;border:1px solid #E3D9CD;overflow:hidden">

<tr><td align="center" style="padding:54px 56px 0" class="px">
<img src="${LOGO}" height="31" alt="planie" style="display:block;height:31px;width:auto;border:0;outline:none;text-decoration:none" />
</td></tr>

${eyebrowHtml || headingHtml || messageHtml
    ? `<tr><td align="center" style="padding:34px 56px 0" class="px">${eyebrowHtml}${headingHtml}${messageHtml}</td></tr>`
    : ""}
${bodyHtml}
${ctaHtml}
${stepsHtml}
${footerNoteHtml}

<tr><td style="padding:26px 56px 52px" class="px">
<p style="margin:0;font-family:${SERIF};font-size:16px;line-height:25px;mso-line-height-rule:exactly;color:${INK_BODY}">${escapeHtml(signoff)}<br />The planie team</p>
</td></tr>

</table>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="width:560px;max-width:560px">
<tr><td align="center" style="padding:28px 56px 0;font-family:${SANS};font-size:11px;line-height:19px;mso-line-height-rule:exactly;letter-spacing:0.2px;color:#B0A79E">
planie &nbsp;&middot;&nbsp; 14 Hartfield Road, London SW19 3TA${unsubHtml}
</td></tr>
</table>

</td></tr>
</table>
</body>
</html>`;
}

/* Mirrors the backend's applyMergeTags, minus the write side: unknown tags are
   left intact so a preview shows you the tag doesn't exist, and known-but-empty
   ones vanish exactly as they will in the real send. */
const MERGE_TAGS = ["email", "city", "platform", "business", "contact", "venueType"];

export function applyMergeTags(template, row) {
  if (!template) return template;
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (whole, tag) => {
    if (!MERGE_TAGS.includes(tag)) return whole;
    const v = row?.[tag];
    return typeof v === "string" && v.trim() ? v.trim() : "";
  });
}

export function renderParts(parts, row) {
  const t = (s) => applyMergeTags(s, row);
  return {
    ...parts,
    eyebrow: t(parts.eyebrow),
    heading: t(parts.heading),
    message: t(parts.message),
    ctaLabel: t(parts.ctaLabel),
    ctaUrl: t(parts.ctaUrl),
    ctaNote: t(parts.ctaNote),
    stepsTitle: t(parts.stepsTitle),
    steps: (parts.steps ?? []).map((s) => t(s)),
    footerNote: t(parts.footerNote),
  };
}

