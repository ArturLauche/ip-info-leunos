/**
 * Production-browser regressions with deterministic API fixtures.
 * Install agent-browser outside this project, then run:
 *   node scripts/verify-browser.mjs http://localhost:3001
 * The API unit tests separately exercise the real server-side boundaries.
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const baseUrl = process.argv[2] ?? "http://localhost:3001";
const artifacts = mkdtempSync(join(tmpdir(), "ip-info-browser-"));
const session = `ip-info-verify-${process.pid}`;
const passed = [];

function browser(...args) {
  const output = execFileSync("agent-browser", ["--session", session, "--json", ...args], {
    encoding: "utf8", timeout: 45000, maxBuffer: 2 * 1024 * 1024,
  });
  const result = JSON.parse(output);
  if (!result.success) throw new Error(`${args[0]}: ${JSON.stringify(result.error)}`);
  return result.data;
}
const evaluate = (expression) => browser("eval", expression).result;
const waitFor = (expression) => browser("wait", "--fn", expression);
const open = (path) => browser("open", new URL(path, baseUrl).href);
const clickRole = (role, name) => browser("find", "role", role, "click", "--name", name);
function check(name, work) {
  work();
  passed.push(name);
  console.log(`PASS ${name}`);
}
function assertHealthy() {
  assert.equal(evaluate("!!document.querySelector('[data-nextjs-dialog]')"), false);
  assert.equal(evaluate("document.querySelector('h1')?.textContent === 'Something went wrong'"), false);
  assert.ok(evaluate("document.body.innerText.length > 100"));
}
function assertFits() {
  assert.equal(evaluate("document.documentElement.scrollWidth <= innerWidth"), true);
  assert.equal(evaluate("[...document.querySelectorAll('h1,h2')].filter(e=>e.getBoundingClientRect().width).every(e=>e.scrollWidth <= e.clientWidth + 1)"), true);
}
function installFixtures() {
  evaluate(`(() => {
    window.__calls = [];
    window.__completed = 0;
    window.__plan = [];
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = String(args[0]);
      if (!url.startsWith('/api/')) {
        if (window.__rscDelay && url.includes('_rsc=')) await new Promise(resolve=>setTimeout(resolve,window.__rscDelay));
        return originalFetch(...args);
      }
      const call = {url, body:args[1]?.body};
      window.__calls.push(call);
      const plan = window.__plan.shift() ?? {};
      await new Promise(resolve=>setTimeout(resolve, plan.delay ?? 250));
      window.__completed++;
      if (plan.raw) return new Response(plan.raw, {status:502});
      const target = new URL(url, location.href).searchParams.get('target') ?? 'example.com';
      const data = url.startsWith('/api/dns') ? {
        target, addresses:[{address:'93.184.215.14',family:4}],
        records:[{type:'A',value:'93.184.215.14'},{type:'TXT',value:['v=DKIM1; p=MIIB','IjANBg']}]
      } : url.startsWith('/api/ping') ? {
        ok:true,mode:'tcp',target:'example.com',port:80,latencyMs:12,message:'',messageKey:'tcp_ok'
      } : url.startsWith('/api/asn') ? {found:false,asn:'AS13335',sources:{ipinfo:'unavailable',ripestat:'unavailable',peeringdb:'unavailable'}} : {};
      // Deliberately ignore AbortSignal: stale-result guards must work even
      // when the transport has already received/parsed a superseded response.
      return Response.json({ok:true,data:plan.data ?? data});
    };
  })()`);
}
function submit(query) {
  browser("fill", "input[name=q]", query);
  browser("click", "button[type=submit]");
}

try {
  browser("set", "viewport", "1440", "1000");
  open("/dns");
  browser("snapshot", "-i");
  installFixtures();

  check("empty search is disabled; one DNS request per submission", () => {
    assert.equal(evaluate("document.querySelector('button[type=submit]').disabled"), true);
    submit("example.com");
    waitFor("document.querySelector('h2')?.textContent.includes('DNS records for')");
    browser("wait", "--url", "**/dns?target=example.com");
    assert.equal(evaluate("window.__calls.length"), 1);
    assertHealthy();
  });

  check("TXT chunks are concatenated in the filtered record table", () => {
    clickRole("radio", "TXT");
    assert.ok(evaluate("document.body.innerText.includes('v=DKIM1; p=MIIBIjANBg')"));
  });

  check("cancelled slow lookups cannot overwrite a newer result", () => {
    evaluate("window.__plan.push({delay:1800},{delay:100})");
    submit("old.example.com");
    clickRole("button", "Cancel");
    submit("new.example.com");
    waitFor("window.__completed === window.__calls.length");
    assert.ok(evaluate("document.querySelector('h2')?.textContent.includes('new.example.com')"));
    assert.equal(evaluate("window.__calls.length"), 3);
    assertHealthy();
  });

  check("an unchanged query can be retried without a duplicate request", () => {
    submit("new.example.com");
    waitFor("window.__completed === 4 && !document.querySelector('button[type=submit]').disabled");
    assert.equal(evaluate("window.__calls.length"), 4);
  });

  check("gateway HTML becomes a recoverable translated API error", () => {
    evaluate("window.__plan.push({raw:'<html>Bad gateway</html>'})");
    submit("failed.example.com");
    waitFor("!!document.querySelector('[role=alert]')");
    assert.ok(!evaluate("document.body.innerText.includes('<html>')"));
    assertHealthy();
  });

  check("long DNS results fit desktop and both narrow mobile widths", () => {
    submit(`${"a".repeat(60)}.${"b".repeat(60)}.example.com`);
    waitFor("window.__completed === 6 && !document.querySelector('button[type=submit]').disabled");
    assertFits();
    browser("screenshot", join(artifacts, "dns-desktop-dark.png"));
    browser("set", "viewport", "390", "844");
    assertFits();
    browser("screenshot", join(artifacts, "dns-mobile-dark.png"), "--full");
    browser("set", "viewport", "320", "740");
    assertFits();
  });

  check("lazy command palette opens from keyboard, is named, and has a close button", () => {
    browser("press", "Control+k");
    waitFor("document.activeElement?.getAttribute('role') === 'combobox'");
    assert.ok(evaluate("document.activeElement.getAttribute('aria-label')"));
    clickRole("button", "Close");
    waitFor("!document.querySelector('[role=combobox]')");
    browser("press", "Control+k");
    waitFor("document.activeElement?.getAttribute('role') === 'combobox'");
    browser("fill", "[role=combobox]", "whois");
    browser("press", "Enter");
    browser("wait", "--url", "**/whois");
    assertHealthy();
  });

  check("reduced motion avoids route snapshot cloning and leaves no stale copy", () => {
    browser("set", "media", "light", "reduced-motion");
    // A fresh load under reduced motion, so no fallback copy of the page exists.
    open("/whois");
    browser("press", "Control+k");
    waitFor("document.activeElement?.getAttribute('role') === 'combobox'");
    evaluate(`(() => {
      window.__routeClones=0;
      const original=Element.prototype.cloneNode;
      Element.prototype.cloneNode=function(...args){
        if(this.classList.contains('tool-page-current')) window.__routeClones++;
        return original.apply(this,args);
      };
      const stale=document.createElement('div');
      stale.className='tool-page-snapshot';
      document.querySelector('.tool-page-snapshot-layer').append(stale);
    })()`);
    browser("fill", "[role=combobox]", "dns");
    browser("press", "Enter");
    browser("wait", "--url", "**/dns");
    assert.equal(evaluate("window.__routeClones"), 0);
    // A commit that mounts no replacement copy must not leave the old one over the route.
    assert.equal(evaluate("document.querySelector('.tool-page-snapshot-layer').childElementCount"), 0);
  });

  check("same-tool navigation and history restore or clear lookup state", () => {
    open("/dns");
    browser("snapshot", "-i");
    installFixtures();
    submit("first.example.com");
    waitFor("window.__completed === 1");
    browser("press", "Control+k");
    waitFor("document.activeElement?.getAttribute('role') === 'combobox'");
    // Keep the pointer over a lower suggestion while new rows appear beneath
    // it. Typing must reset selection to the first row for keyboard navigation.
    const pointer = evaluate("(() => {const r=document.querySelector('#command-item-3').getBoundingClientRect();return {x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2)}})()");
    browser("mouse", "move", String(pointer.x), String(pointer.y));
    browser("fill", "[role=combobox]", "second.example.com");
    waitFor("document.querySelector('#command-item-0')?.getAttribute('aria-selected') === 'true'");
    browser("press", "ArrowDown");
    browser("press", "Enter");
    browser("wait", "--url", "**/dns?target=second.example.com");
    waitFor("window.__completed === 2");
    browser("back");
    waitFor("document.querySelector('h2')?.textContent.includes('first.example.com')");
    browser("forward");
    waitFor("document.querySelector('h2')?.textContent.includes('second.example.com')");
    assert.equal(evaluate("window.__calls.length"), 4);
    browser("press", "Control+k");
    waitFor("document.activeElement?.getAttribute('role') === 'combobox'");
    browser("fill", "[role=combobox]", "dns");
    browser("press", "Enter");
    browser("wait", "--url", "**/dns");
    waitFor("document.querySelector('input[name=q]')?.value === ''");
    // The screen-reader-only field label also reads "DNS records for", so look for the result heading.
    assert.equal(evaluate("[...document.querySelectorAll('h2')].some(h=>h.textContent.includes('DNS records for'))"), false);
    assert.equal(evaluate("window.__calls.length"), 4);
    assertHealthy();
  });

  check("ASN pathname navigation starts only the destination lookup", () => {
    open("/asn");
    browser("snapshot", "-i");
    installFixtures();
    submit("13335");
    browser("wait", "--url", "**/asn/AS13335");
    waitFor("window.__completed === 1");
    assert.equal(evaluate("window.__calls.length"), 1);
    assertHealthy();
  });

  check("delayed DNS URL echoes preserve drafts; external navigation still resets them", () => {
    open("/dns");
    browser("snapshot", "-i");
    installFixtures();
    evaluate("window.__rscDelay=1500; window.__plan.push({delay:1800})");
    submit("submitted.example.com");
    clickRole("button", "Cancel");
    browser("fill", "input[name=q]", "draft.example.com");
    browser("wait", "--url", "**/dns?target=submitted.example.com");
    waitFor("window.__completed === window.__calls.length");
    assert.equal(evaluate("document.querySelector('input[name=q]').value"), "draft.example.com");
    assert.equal(evaluate("window.__calls.length"), 1);
    evaluate("window.__rscDelay=0");
    browser("press", "Control+k");
    waitFor("document.activeElement?.getAttribute('role') === 'combobox'");
    browser("fill", "[role=combobox]", "dns");
    browser("press", "Enter");
    browser("wait", "--url", "**/dns");
    waitFor("document.querySelector('input[name=q]')?.value === ''");
    browser("back");
    waitFor("document.querySelector('h2')?.textContent.includes('submitted.example.com')");
    assert.equal(evaluate("document.querySelector('input[name=q]').value"), "submitted.example.com");
    assert.equal(evaluate("window.__calls.length"), 2);
    assertHealthy();
  });

  check("Ping preserves explicitly edited preset ports and omits disabled credentials", () => {
    // Earlier checks leave the browser at a phone width; this form is a desktop flow.
    browser("set", "viewport", "1440", "1000");
    open("/ping");
    browser("snapshot", "-i");
    installFixtures();
    browser("fill", "#ping-port", "80");
    clickRole("tab", "UDP");
    assert.equal(evaluate("document.querySelector('#ping-port').value"), "80");
    clickRole("tab", "Database");
    // The database options expand with a short animation; clicking while they
    // move is rejected as "covered" by stricter agent-browser versions.
    browser("wait", "600");
    browser("click", "#ping-use-auth");
    browser("wait", "600");
    browser("fill", "#ping-username", "test-user");
    browser("fill", "#ping-password", "browser-test-secret");
    browser("click", "#ping-use-auth");
    browser("wait", "600");
    browser("click", "button[type=submit]");
    waitFor("window.__completed === 1");
    const request = JSON.parse(evaluate("window.__calls[0].body"));
    assert.equal(request.auth, undefined);
    assert.equal(request.port, 80);
    assertHealthy();
  });

  check("mode deep links choose the right default port", () => {
    open("/ping?mode=udp");
    waitFor("!!document.querySelector('#ping-port')");
    assert.equal(evaluate("document.querySelector('#ping-port').value"), "53");
  });

  check("a delayed URL update cannot restart a cancelled IP lookup or overwrite a draft", () => {
    open("/check");
    browser("snapshot", "-i");
    installFixtures();
    evaluate("window.__rscDelay=1500; window.__plan.push({delay:1800})");
    submit("8.8.8.8");
    clickRole("button", "Cancel");
    browser("fill", "input[name=q]", "1.0.0.1");
    browser("wait", "--url", "**/check?q=8.8.8.8");
    waitFor("window.__completed === window.__calls.length");
    assert.equal(evaluate("window.__calls.length"), 1);
    assert.equal(evaluate("document.querySelector('input[name=q]').value"), "1.0.0.1");
    assert.equal(evaluate("document.body.innerText.includes('Queried IP address')"), false);
    assertHealthy();
  });

  check("repeated IP parameters render and repeat submissions rerun", () => {
    const ipData = {ipv4:'1.1.1.1',ipv6:null,ipVersion:4,country:'Australia',countryCode:'AU',region:'',regionName:'',city:'',zip:'',lat:0,lon:0,timezone:'',isp:'Cloudflare',org:'Cloudflare',as:'AS13335 Cloudflare',asname:'CLOUDFLARENET',reverse:'one.one.one.one',mobile:false,proxy:false,hosting:true,connectionType:'datacenter'};
    browser("network", "route", "**/api/ip*", "--body", JSON.stringify({ok:true,data:ipData}));
    open("/check?q=1.1.1.1&q=8.8.8.8");
    waitFor("document.querySelector('input[name=q]')?.value === '1.1.1.1'");
    waitFor("!document.querySelector('button[type=submit]').disabled");
    assertHealthy();
    const before = evaluate("performance.getEntriesByType('resource').filter(r=>r.name.includes('/api/ip?')).length");
    submit("1.1.1.1");
    waitFor(`performance.getEntriesByType('resource').filter(r=>r.name.includes('/api/ip?')).length > ${before}`);
    waitFor("!document.querySelector('button[type=submit]').disabled");
    assertFits();
    browser("network", "unroute");
  });

  check("light theme and mobile navigation remain usable", () => {
    browser("set", "viewport", "390", "844");
    // Scope to the phone header: the desktop sidebar keeps its own (hidden) copies
    // of these controls, which a role search can match first.
    browser("click", "header.sticky button[aria-label='Toggle theme']");
    clickRole("menuitem", "Light");
    waitFor("document.documentElement.classList.contains('light')");
    assertFits();
    browser("screenshot", join(artifacts, "ip-mobile-light.png"));
    browser("click", "header.sticky button[aria-label='Menu']");
    // The sheet slides in for ~500 ms; a click while it moves can land on the overlay.
    browser("wait", "700");
    browser("click", "[role=dialog] a[href='/dns']");
    browser("wait", "--url", "**/dns");
    assertHealthy();
  });

  check("German WHOIS fallback notes and raw disclosure work", () => {
    browser("set", "headers", JSON.stringify({"accept-language":"de"}));
    open("/whois");
    browser("snapshot", "-i");
    installFixtures();
    const data = {
      target: "example.com", server: "rdap.org", raw: "Domain Name: EXAMPLE.COM\nStatus: active",
      noteCode: "rdap_fallback", summary: {status:["active"], nameservers:["ns.example.com"]},
    };
    evaluate(`window.__plan.push({data:${JSON.stringify(data)}})`);
    submit("example.com");
    waitFor("window.__completed === 1 && !document.querySelector('button[type=submit]').disabled");
    // The document language is the full BCP 47 tag (see getIntlLocale), not the registry key.
    assert.equal(evaluate("document.documentElement.lang"), "de-DE");
    assert.ok(evaluate("document.body.innerText.includes('WHOIS war nicht verfügbar.')"));
    browser("click", "button[aria-controls=whois-raw-result]");
    assert.equal(evaluate("document.querySelector('#whois-raw-result').textContent"), data.raw);
    assert.equal(evaluate("document.querySelector('button[aria-controls=whois-raw-result]').getAttribute('aria-expanded')"), "true");
    assertFits();
    assertHealthy();
  });

  const errors = browser("errors");
  assert.deepEqual(errors.errors ?? [], [], "No uncaught browser errors");
  writeFileSync(join(artifacts, "results.json"), JSON.stringify({baseUrl, passed, errors}, null, 2));
  console.log(`Browser verification: ${passed.length} checks passed. Evidence: ${artifacts}`);
} catch (error) {
  try { browser("screenshot", join(artifacts, "failure.png")); } catch { /* Keep the original failure. */ }
  console.error(`Browser evidence: ${artifacts}`);
  throw error;
} finally {
  browser("close");
}
