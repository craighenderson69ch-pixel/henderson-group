"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { escapeHtml } = require("../js/safe.js");

require("../js/countries.js");

const countries = globalThis.COUNTRIES;
assert.ok(Array.isArray(countries) && countries.length > 80, "country list should load");

const names = countries.map((row) => row[1]);
const dupes = names.filter((name, i) => names.indexOf(name) !== i);
assert.deepStrictEqual(dupes, [], "country names must be unique");
assert.ok(names.includes("Brazil"), "Brazil stays on the list");
assert.ok(names.includes("Other / Multiple"), "catch-all region stays on the list");
assert.ok(!names.includes("Mexico (Northern Region)"), "duplicate Mexico alias removed");

assert.strictEqual(escapeHtml("<script>alert(1)</script>"), "&lt;script&gt;alert(1)&lt;/script&gt;");
assert.strictEqual(escapeHtml("Luxury & Lifestyle"), "Luxury &amp; Lifestyle");
assert.strictEqual(escapeHtml("O'Hara \"Firm\""), "O&#39;Hara &quot;Firm&quot;");
assert.strictEqual(escapeHtml(null), "");

const index = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
assert.ok(index.includes('id="consult-form"'), "consultation uses a real form");
assert.ok(index.includes("js/safe.js"), "escape helper is loaded on the landing page");
assert.ok(
  index.includes("https://craighenderson69ch-pixel.github.io/henderson-group/assets/og-image.jpg"),
  "Open Graph image must be an absolute URL"
);
assert.ok(index.includes('href="#consult">Consultation</a>'), "mobile nav includes consultation");

const brief = fs.readFileSync(path.join(__dirname, "..", "brief.html"), "utf8");
assert.ok(brief.includes("One client. One mandate."), "brief states the mandate rule");
assert.ok(!/US\$12k|\$2\.4M|4\.8×/.test(brief), "brief must not invent results");
assert.ok(brief.includes("craig@hendersongroup.com.au"), "brief includes the enquiry address");

const sitemap = fs.readFileSync(path.join(__dirname, "..", "sitemap.xml"), "utf8");
assert.ok(sitemap.includes("/brief.html"), "sitemap lists the brief");

console.log("site-checks: " + countries.length + " countries, escape + markup OK");
