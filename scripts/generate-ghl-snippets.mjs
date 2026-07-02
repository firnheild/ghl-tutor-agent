import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outDir = join(process.cwd(), "public", "ghl-snippets");
mkdirSync(outDir, { recursive: true });

const nav = [
  "Launchpad",
  "Dashboard",
  "Conversations",
  "Contacts",
  "Opportunities",
  "Calendars",
  "Sites",
  "Automation",
  "Reporting",
  "Settings",
];

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function rect(x, y, w, h, fill = "#fff", stroke = "#d7dde5", r = 14) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`;
}

function text(x, y, value, size = 18, fill = "#0f172a", weight = 500) {
  return `<text x="${x}" y="${y}" font-family="Inter, Arial, sans-serif" font-size="${size}" fill="${fill}" font-weight="${weight}">${esc(value)}</text>`;
}

function pill(x, y, value, fill = "#ecfdf5", stroke = "#a7f3d0", fg = "#047857") {
  const width = Math.max(88, value.length * 8 + 28);
  return `${rect(x, y, width, 30, fill, stroke, 15)}${text(x + 14, y + 20, value, 13, fg, 700)}`;
}

function sidebar(active) {
  return `
    ${rect(24, 24, 192, 672, "#111827", "#111827", 22)}
    ${text(52, 72, "HighLevel", 24, "#ffffff", 800)}
    ${text(52, 100, "Training sub-account", 12, "#9ca3af", 600)}
    ${nav
      .map((item, index) => {
        const y = 138 + index * 48;
        const selected = item === active;
        return `
          ${rect(44, y, 144, 34, selected ? "#0ea5a3" : "#111827", selected ? "#0ea5a3" : "#374151", 8)}
          <circle cx="62" cy="${y + 17}" r="5" fill="${selected ? "#ffffff" : "#6b7280"}"/>
          ${text(76, y + 22, item, 13, selected ? "#ffffff" : "#d1d5db", selected ? 800 : 600)}
        `;
      })
      .join("")}
  `;
}

function shell({ active, title, subtitle, children }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720">
    <rect width="1200" height="720" fill="#eef3f8"/>
    ${sidebar(active)}
    ${rect(240, 24, 936, 672, "#ffffff", "#d7dde5", 22)}
    ${text(272, 70, title, 28, "#0f172a", 800)}
    ${text(272, 100, subtitle, 14, "#64748b", 600)}
    ${pill(1000, 50, "redacted demo", "#fff7ed", "#fed7aa", "#c2410c")}
    ${children}
    ${text(272, 668, "Training mockup. Replace this SVG with a redacted real GHL screenshot when available.", 14, "#64748b", 600)}
  </svg>`;
}

const snippets = {
  "orientation-dashboard.svg": shell({
    active: "Dashboard",
    title: "Dashboard overview",
    subtitle: "Where a beginner learner starts finding CRM, calendar, funnel, and automation tools.",
    children: `
      ${rect(272, 132, 260, 118, "#f8fafc")} ${text(296, 166, "New Leads", 15, "#64748b", 700)} ${text(296, 214, "24", 42, "#0f766e", 800)}
      ${rect(554, 132, 260, 118, "#f8fafc")} ${text(578, 166, "Appointments", 15, "#64748b", 700)} ${text(578, 214, "8", 42, "#2563eb", 800)}
      ${rect(836, 132, 260, 118, "#f8fafc")} ${text(860, 166, "Pipeline Value", 15, "#64748b", 700)} ${text(860, 214, "$12.4k", 38, "#be123c", 800)}
      ${rect(272, 286, 392, 300, "#ffffff")} ${text(296, 326, "Main places to learn first", 20, "#0f172a", 800)}
      ${["Contacts = people and leads", "Opportunities = sales tracking", "Calendars = booking", "Sites = forms and funnels", "Automation = workflows"].map((line, i) => `${pill(300, 356 + i * 42, line, "#f0fdfa", "#99f6e4", "#0f766e")}`).join("")}
      ${rect(700, 286, 396, 300, "#f8fafc")} ${text(730, 326, "Example learner question", 18, "#0f172a", 800)}
      ${text(730, 370, "Client says: We need faster lead follow-up.", 16, "#334155", 600)}
      ${text(730, 420, "Start by checking Contacts, Conversations,", 16, "#334155", 600)}
      ${text(730, 450, "and Automation before designing anything.", 16, "#334155", 600)}
    `,
  }),
  "crm-contacts.svg": shell({
    active: "Contacts",
    title: "Contact record with tags and fields",
    subtitle: "Where learners see leads, tags, custom fields, notes, and tasks in one place.",
    children: `
      ${rect(272, 130, 360, 500, "#f8fafc")} ${text(296, 170, "Contacts", 22, "#0f172a", 800)}
      ${rect(296, 194, 296, 42, "#ffffff")} ${text(316, 222, "Search contacts...", 14, "#94a3b8", 500)}
      ${["Jane Demo Lead", "Marco Test Contact", "Ava Sample Buyer", "Noah Clinic Lead"].map((name, i) => `${rect(296, 260 + i * 76, 296, 56, i === 0 ? "#ecfdf5" : "#ffffff", i === 0 ? "#34d399" : "#d7dde5", 10)}${text(316, 292 + i * 76, name, 15, "#0f172a", 800)}${text(316, 310 + i * 76, "redacted@example.com", 12, "#64748b", 600)}`).join("")}
      ${rect(664, 130, 432, 500, "#ffffff")} ${text(696, 174, "Jane Demo Lead", 24, "#0f172a", 800)} ${text(696, 202, "Phone and email redacted", 14, "#64748b", 600)}
      ${text(696, 252, "Tags", 15, "#0f172a", 800)} ${pill(696, 270, "source-facebook-ad")} ${pill(856, 270, "interest-implant", "#eff6ff", "#bfdbfe", "#1d4ed8")} ${pill(696, 310, "status-new-lead", "#fff7ed", "#fed7aa", "#c2410c")}
      ${text(696, 370, "Custom fields", 15, "#0f172a", 800)}
      ${rect(696, 388, 170, 48, "#f8fafc")} ${text(712, 418, "Preferred Time", 13, "#64748b", 700)}
      ${rect(884, 388, 170, 48, "#f8fafc")} ${text(900, 418, "Service Interest", 13, "#64748b", 700)}
      ${text(696, 480, "Notes and tasks", 15, "#0f172a", 800)}
      ${rect(696, 500, 358, 62, "#f8fafc")} ${text(714, 536, "Task: Call within 10 minutes", 15, "#334155", 700)}
    `,
  }),
  "pipeline-opportunities.svg": shell({
    active: "Opportunities",
    title: "Opportunity pipeline",
    subtitle: "How leads move through sales stages from new inquiry to won or lost.",
    children: `
      ${["New Lead", "Contacted", "Appointment Set", "Proposal", "Won"].map((stage, i) => `${rect(272 + i * 174, 140, 150, 430, "#f8fafc")} ${text(292 + i * 174, 176, stage, 15, "#0f172a", 800)} ${text(292 + i * 174, 202, i === 0 ? "$3.2k" : i === 4 ? "$7.1k" : "$1.8k", 13, "#64748b", 700)}`).join("")}
      ${rect(290, 234, 114, 88, "#ffffff")} ${text(308, 266, "Seller lead", 14, "#0f172a", 800)} ${pill(308, 280, "hot", "#fff1f2", "#fecdd3", "#be123c")}
      ${rect(464, 258, 114, 88, "#ffffff")} ${text(482, 290, "Dental consult", 13, "#0f172a", 800)} ${pill(482, 304, "called")}
      ${rect(638, 226, 114, 88, "#ffffff")} ${text(656, 258, "Grooming appt", 13, "#0f172a", 800)} ${pill(656, 272, "booked", "#eff6ff", "#bfdbfe", "#1d4ed8")}
      ${rect(986, 250, 114, 88, "#ffffff")} ${text(1004, 282, "Closed deal", 13, "#0f172a", 800)} ${pill(1004, 296, "won")}
      ${text(292, 620, "Practice focus: name stages after real business actions, not vague labels.", 18, "#334155", 700)}
    `,
  }),
  "calendar-booking.svg": shell({
    active: "Calendars",
    title: "Calendar and booking setup",
    subtitle: "Availability, appointment length, buffers, booking link, and reminders.",
    children: `
      ${rect(272, 132, 430, 488, "#f8fafc")} ${text(302, 174, "Service calendar", 22, "#0f172a", 800)}
      ${["Mon 9:00 AM - 5:00 PM", "Tue 9:00 AM - 5:00 PM", "Wed closed", "Thu 10:00 AM - 6:00 PM", "Fri 9:00 AM - 3:00 PM"].map((line, i) => `${rect(304, 206 + i * 62, 350, 42, "#ffffff")} ${text(326, 233 + i * 62, line, 15, i === 2 ? "#dc2626" : "#334155", 700)}`).join("")}
      ${rect(734, 132, 362, 488, "#ffffff")} ${text(766, 174, "Booking rules", 22, "#0f172a", 800)}
      ${pill(766, 214, "Appointment length: 45 min", "#eff6ff", "#bfdbfe", "#1d4ed8")}
      ${pill(766, 260, "Buffer: 15 min", "#f0fdfa", "#99f6e4", "#0f766e")}
      ${pill(766, 306, "Confirmation SMS", "#fff7ed", "#fed7aa", "#c2410c")}
      ${pill(766, 352, "Reminder: 24 hours before", "#fdf2f8", "#fbcfe8", "#be185d")}
      ${rect(766, 430, 286, 90, "#f8fafc")} ${text(790, 462, "Booking link preview", 16, "#0f172a", 800)} ${text(790, 492, "demo.highlevel.com/book/grooming", 13, "#64748b", 600)}
    `,
  }),
  "forms-funnels.svg": shell({
    active: "Sites",
    title: "Form and funnel builder",
    subtitle: "A lead capture path from landing page to form to thank-you page.",
    children: `
      ${rect(272, 130, 260, 500, "#f8fafc")} ${text(302, 170, "Landing page", 20, "#0f172a", 800)} ${rect(302, 204, 198, 72, "#ffffff")} ${text(324, 246, "Free consultation", 18, "#334155", 800)} ${rect(332, 316, 140, 42, "#0ea5a3", "#0ea5a3", 8)} ${text(360, 344, "Book now", 15, "#ffffff", 800)}
      ${rect(586, 130, 260, 500, "#ffffff")} ${text(616, 170, "Form fields", 20, "#0f172a", 800)}
      ${["Full name", "Phone", "Email", "Service interest", "Preferred time"].map((line, i) => `${rect(616, 206 + i * 62, 190, 40, "#f8fafc")} ${text(636, 232 + i * 62, line, 14, "#334155", 700)}`).join("")}
      ${rect(900, 130, 196, 500, "#f8fafc")} ${text(930, 170, "Thank-you page", 18, "#0f172a", 800)} ${text(930, 222, "Your request", 15, "#334155", 700)} ${text(930, 248, "was received.", 15, "#334155", 700)} ${pill(930, 300, "Next: check SMS")}
      ${text(304, 620, "Practice focus: keep forms short and send clean data into the CRM.", 18, "#334155", 700)}
    `,
  }),
  "conversations-inbox.svg": shell({
    active: "Conversations",
    title: "Conversations inbox",
    subtitle: "Where replies appear and where a human can take over.",
    children: `
      ${rect(272, 132, 310, 500, "#f8fafc")} ${text(302, 172, "Inbox", 22, "#0f172a", 800)}
      ${["Jane Demo Lead", "Marco Test Contact", "Ava Seller Lead"].map((name, i) => `${rect(302, 208 + i * 82, 230, 60, i === 0 ? "#ecfdf5" : "#ffffff", i === 0 ? "#34d399" : "#d7dde5", 10)}${text(322, 240 + i * 82, name, 15, "#0f172a", 800)}${text(322, 258 + i * 82, "SMS thread", 12, "#64748b", 600)}`).join("")}
      ${rect(620, 132, 476, 500, "#ffffff")} ${text(650, 172, "Jane Demo Lead", 22, "#0f172a", 800)}
      ${rect(650, 216, 280, 52, "#f1f5f9")} ${text(670, 248, "Hi, is Tuesday available?", 15, "#334155", 600)}
      ${rect(760, 292, 280, 62, "#dcfce7", "#bbf7d0", 14)} ${text(780, 324, "Yes. Want me to send", 15, "#166534", 700)} ${text(780, 346, "the booking link?", 15, "#166534", 700)}
      ${rect(650, 420, 390, 74, "#f8fafc")} ${text(674, 452, "Reply box: staff can answer here", 15, "#64748b", 700)}
      ${pill(650, 530, "Assigned to front desk", "#eff6ff", "#bfdbfe", "#1d4ed8")}
    `,
  }),
  "workflow-builder.svg": shell({
    active: "Automation",
    title: "Workflow builder",
    subtitle: "Trigger, actions, wait step, condition, and stop rule for a safe automation.",
    children: `
      ${rect(282, 140, 240, 70, "#ecfdf5", "#34d399")} ${text(312, 182, "Trigger: Missed call", 18, "#065f46", 800)}
      ${rect(282, 250, 240, 70, "#eff6ff", "#bfdbfe")} ${text(312, 292, "Action: Send SMS", 18, "#1d4ed8", 800)}
      ${rect(282, 360, 240, 70, "#fff7ed", "#fed7aa")} ${text(312, 402, "Action: Create task", 18, "#c2410c", 800)}
      ${rect(602, 250, 220, 70, "#f8fafc")} ${text(632, 292, "Wait: 10 minutes", 18, "#334155", 800)}
      ${rect(902, 232, 160, 108, "#fdf2f8", "#fbcfe8")} ${text(930, 270, "If/Else", 20, "#be185d", 800)} ${text(930, 302, "Did lead reply?", 14, "#be185d", 700)}
      ${rect(862, 398, 230, 70, "#ecfdf5", "#34d399")} ${text(892, 440, "Stop if booked/replied", 17, "#065f46", 800)}
      <path d="M402 210v38 M402 320v38 M522 285h78 M822 285h78 M982 340v56" fill="none" stroke="#64748b" stroke-width="5" stroke-linecap="round"/>
      ${text(304, 620, "Practice focus: every automation needs a clear stop rule and fake-data test.", 18, "#334155", 700)}
    `,
  }),
  "client-implementation.svg": shell({
    active: "Settings",
    title: "Client implementation checklist",
    subtitle: "Requirements, build tasks, testing proof, and handoff notes.",
    children: `
      ${rect(272, 132, 824, 500, "#f8fafc")}
      ${["Collect business requirements", "Create CRM fields and tags", "Build form, calendar, or workflow", "Test with fake data", "Record screenshot proof", "Write handoff notes"].map((line, i) => `${rect(312, 174 + i * 64, 740, 42, "#ffffff")}<circle cx="336" cy="${199 + i * 64}" r="10" fill="${i < 3 ? "#10b981" : "#e5e7eb"}"/>${text(362, 205 + i * 64, line, 17, "#334155", 700)}`).join("")}
      ${text(312, 590, "Practice focus: a teammate should be able to launch from your checklist.", 18, "#334155", 700)}
    `,
  }),
  "external-automation.svg": shell({
    active: "Automation",
    title: "Webhook and external automation",
    subtitle: "When GHL sends clean data to Make, n8n, Zapier, Sheets, or Slack.",
    children: `
      ${rect(280, 180, 220, 100, "#ecfdf5", "#34d399")} ${text(312, 220, "GHL form", 20, "#065f46", 800)} ${text(312, 250, "Seller valuation lead", 14, "#065f46", 700)}
      ${rect(560, 180, 220, 100, "#eff6ff", "#bfdbfe")} ${text(594, 220, "Webhook", 20, "#1d4ed8", 800)} ${text(594, 250, "Send mapped fields", 14, "#1d4ed8", 700)}
      ${rect(840, 132, 220, 90, "#fff7ed", "#fed7aa")} ${text(872, 174, "Google Sheets", 18, "#c2410c", 800)}
      ${rect(840, 260, 220, 90, "#fdf2f8", "#fbcfe8")} ${text(872, 302, "Slack alert", 18, "#be185d", 800)}
      ${rect(840, 388, 220, 90, "#f8fafc")} ${text(872, 430, "Error log", 18, "#334155", 800)}
      <path d="M500 230h58 M780 230h58 M780 230c38 0 38 74 58 74 M780 230c38 0 38 202 58 202" fill="none" stroke="#64748b" stroke-width="5" stroke-linecap="round"/>
      ${pill(316, 360, "Fields: name, phone, email, source, address", "#f8fafc", "#d7dde5", "#334155")}
      ${pill(316, 410, "Never expose API keys or webhook URLs", "#fff1f2", "#fecdd3", "#be123c")}
    `,
  }),
  "portfolio-proof.svg": shell({
    active: "Reporting",
    title: "Portfolio proof and case study",
    subtitle: "How to package a practice build for job applications or client proof.",
    children: `
      ${rect(280, 138, 360, 440, "#ffffff")} ${text(310, 178, "Case study", 24, "#0f172a", 800)}
      ${text(310, 226, "Problem", 17, "#0f172a", 800)} ${text(310, 254, "Missed calls were not followed up.", 14, "#64748b", 600)}
      ${text(310, 310, "Solution", 17, "#0f172a", 800)} ${text(310, 338, "Built text-back workflow and staff task.", 14, "#64748b", 600)}
      ${text(310, 394, "Result", 17, "#0f172a", 800)} ${text(310, 422, "Demo lead received reply in 1 minute.", 14, "#64748b", 600)}
      ${rect(700, 138, 360, 180, "#f8fafc")} ${text(730, 178, "Visual proof", 22, "#0f172a", 800)} ${pill(730, 218, "workflow screenshot")} ${pill(730, 258, "test contact proof", "#eff6ff", "#bfdbfe", "#1d4ed8")}
      ${rect(700, 360, 360, 180, "#f8fafc")} ${text(730, 400, "Resume bullet", 22, "#0f172a", 800)} ${text(730, 444, "Built a mock GHL follow-up system", 15, "#334155", 700)} ${text(730, 470, "with reminders, tasks, and QA notes.", 15, "#334155", 700)}
    `,
  }),
};

for (const [fileName, svg] of Object.entries(snippets)) {
  writeFileSync(join(outDir, fileName), svg, "utf8");
}

console.log(`Generated ${Object.keys(snippets).length} GHL training snippets.`);
