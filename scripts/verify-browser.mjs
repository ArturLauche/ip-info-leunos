/**
 * Production-browser regressions with deterministic API fixtures.
 * Install agent-browser outside this project, then run:
 *   node scripts/verify-browser.mjs http://localhost:3001
 * The API unit tests separately exercise the real server-side boundaries.
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
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
  assert.equal(evaluate(`(() => {
    const visible = (el) => {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    };
    return [...document.querySelectorAll('button,a[href],input,select,textarea')].filter(visible).filter((el) => el.getAttribute('aria-hidden') !== 'true').filter((el) => {
      const label = el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent?.trim();
      if (label) return false;
      if (el.id && document.querySelector('label[for="' + CSS.escape(el.id) + '"]')) return false;
      return !el.closest('label');
    }).length;
  })()`), 0);
}
function assertFits() {
  assert.equal(evaluate("document.documentElement.scrollWidth <= innerWidth"), true);
  assert.equal(evaluate("[...document.querySelectorAll('h1,h2')].filter(e=>e.getBoundingClientRect().width).every(e=>e.scrollWidth <= e.clientWidth + 1)"), true);
  assert.equal(evaluate("[...document.querySelectorAll('[data-slot=empty-state]')].every(e => e.scrollWidth <= e.clientWidth + 1)"), true);
  assert.equal(evaluate(`innerWidth > 639 || [...document.querySelectorAll('button,[role=tab]')].filter((el) => {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }).filter((el) => el.getAttribute('aria-hidden') !== 'true' && el.tabIndex !== -1 && el.dataset.slot !== 'switch').every((el) => {
    const rect = el.getBoundingClientRect();
    return rect.width >= 40 && rect.height >= 40;
  })`), true);
}
function installFixtures() {
  evaluate(`(() => {
    window.__calls = [];
    window.__completed = 0;
    window.__plan = [];
    window.__copied = null;
    Object.defineProperty(navigator, 'clipboard', {configurable:true,value:{writeText:async text=>{window.__copied=text;}}});
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
      } : url.startsWith('/api/asn') ? {
        found:false, asn:'AS13335', asnNumber:13335, name:'', country:'', registry:'',
        allocated:'', domain:'', type:'', numIps:null, prefixes4:[], prefixes6:[],
        prefixes4Total:0, prefixes6Total:0, peers:[], upstreams:[], downstreams:[],
        peersTotal:0, upstreamsTotal:0, downstreamsTotal:0, peeringdb:null,
        sources:{ipinfo:'unavailable',peeringdb:'error',ripestat:'available'}, warnings:[]
      } : url.startsWith('/api/cdn') ? {
        target, reachable:true, status:200, usesCdn:true, detectedCdn:'Cloudflare', confidence:'high',
        reason:'Edge signals matched.', matchedSignals:['cf-ray'], resolvedIps:['1.1.1.1'],
        cnameChain:['edge.example.net'], headers:[{key:'cf-ray',value:'fixture'}]
      } : url.startsWith('/api/reputation') ? {
        ip:target, score:0, rawScore:0, level:'low', headline:'no_malicious_activity', evidence:[],
        contributions:[], threatCategories:[], mailCategories:[], contextCategories:['benign_service'],
        networkContext:null, sources:[], coverage:{checkedCount:1,matchedCount:0,policyCount:1,cleanCount:1,unavailableCount:0,skippedCount:0},
        geo:null, network:null, checkedAt:new Date().toISOString()
      } : {};
      // Deliberately ignore AbortSignal: stale-result guards must work even
      // when the transport has already received/parsed a superseded response.
      return Response.json({ok:true,data:plan.data ?? data});
    };
  })()`);
}
function submit(query) {
  browser("fill", "[data-tool-query]", query);
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

  check("TXT chunks, filtered copy, and JSON download preserve the result", () => {
    clickRole("radio", "TXT");
    assert.ok(evaluate("document.body.innerText.includes('v=DKIM1; p=MIIBIjANBg')"));
    clickRole("button", "Copy");
    assert.equal(evaluate("window.__copied"), "TXT\tv=DKIM1; p=MIIBIjANBg");
    const path = join(artifacts, "dns.json");
    const snapshot = browser("snapshot", "-i");
    const download = Object.entries(snapshot.refs).find(([, entry]) => entry.role === "button" && entry.name === "Download JSON");
    assert.ok(download, "Download button has an accessible name");
    browser("download", `@${download[0]}`, path);
    const data = JSON.parse(readFileSync(path, "utf8"));
    assert.equal(data.target, "example.com");
    assert.equal(data.records.length, 1);
    assert.deepEqual(data.records[0].value, ["v=DKIM1; p=MIIB", "IjANBg"]);
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

  check("reduced motion avoids route snapshot cloning", () => {
    browser("set", "media", "light", "reduced-motion");
    evaluate(`(() => {
      window.__routeClones=0;
      const original=Element.prototype.cloneNode;
      Element.prototype.cloneNode=function(...args){
        if(this.classList.contains('tool-page-current')) window.__routeClones++;
        return original.apply(this,args);
      };
    })()`);
    browser("press", "Control+k");
    waitFor("document.activeElement?.getAttribute('role') === 'combobox'");
    browser("fill", "[role=combobox]", "dns");
    browser("press", "Enter");
    browser("wait", "--url", "**/dns");
    assert.equal(evaluate("window.__routeClones"), 0);
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
    waitFor("document.querySelector('[data-tool-query]')?.value === ''");
    assert.equal(evaluate("document.body.innerText.includes('DNS records for')"), false);
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

  check("CDN results read as one verdict surface with evidence", () => {
    open("/cdn");
    browser("snapshot", "-i");
    installFixtures();
    submit("example.com");
    waitFor("document.querySelector('h2')?.textContent.includes('Cloudflare')");
    assert.ok(evaluate("document.body.innerText.includes('Matched signals')"));
    assert.ok(evaluate("document.body.innerText.includes('CNAME chain')"));
    assertFits();
    assertHealthy();
  });

  check("reputation has a useful first-use example and a flat evidence layout", () => {
    open("/reputation");
    browser("snapshot", "-i");
    assert.equal(evaluate("document.querySelector('[data-tool-query]')?.value"), "");
    installFixtures();
    clickRole("button", "8.8.8.8");
    waitFor("document.body.innerText.includes('NO MALICIOUS ACTIVITY DETECTED')");
    assert.ok(evaluate("document.body.innerText.includes('SOURCES')"));
    assertFits();
    assertHealthy();
  });

  check("Ping begins without a misleading prefilled target and offers examples", () => {
    open("/ping");
    assert.equal(evaluate("document.querySelector('#ping-target')?.value"), "");
    assert.ok(evaluate("document.body.innerText.includes('example.com')"));
    clickRole("button", "example.com");
    assert.equal(evaluate("document.querySelector('#ping-target')?.value"), "example.com");
    assertFits();
    assertHealthy();
  });

  check("repeated ASN parameters use the first value without crashing", () => {
    browser("network", "route", "**/api/asn*", "--body", JSON.stringify({ ok: true, data: {
      found: false, asn: "AS1", asnNumber: 1, name: "", country: "", registry: "",
      allocated: "", domain: "", type: "", numIps: null, prefixes4: [], prefixes6: [],
      prefixes4Total: 0, prefixes6Total: 0, peers: [], upstreams: [], downstreams: [],
      peersTotal: 0, upstreamsTotal: 0, downstreamsTotal: 0, peeringdb: null,
      sources: { ipinfo: "unavailable", peeringdb: "error", ripestat: "available" }, warnings: []
    }}));
    open("/asn?q=AS1&q=AS2");
    waitFor("document.querySelector('[data-tool-query]')?.value === 'AS1'");
    assertHealthy();
    browser("network", "unroute");
  });

  check("ASN client validation stays associated with the input", () => {
    open("/asn");
    installFixtures();
    browser("fill", "[data-tool-query]", "not-an-asn");
    browser("click", "button[type=submit]");
    waitFor("!!document.querySelector('#asn-input-error')");
    assert.equal(evaluate("document.querySelector('[data-tool-query]')?.getAttribute('aria-invalid')"), "true");
    assert.equal(evaluate("document.querySelectorAll('[role=alert]').length"), 1);
    assertHealthy();
  });

  check("delayed DNS URL echoes preserve drafts; external navigation still resets them", () => {
    open("/dns");
    browser("snapshot", "-i");
    installFixtures();
    evaluate("window.__rscDelay=1500; window.__plan.push({delay:1800})");
    submit("submitted.example.com");
    clickRole("button", "Cancel");
    browser("fill", "[data-tool-query]", "draft.example.com");
    browser("wait", "--url", "**/dns?target=submitted.example.com");
    waitFor("window.__completed === window.__calls.length");
    assert.equal(evaluate("document.querySelector('[data-tool-query]').value"), "draft.example.com");
    assert.equal(evaluate("window.__calls.length"), 1);
    evaluate("window.__rscDelay=0");
    browser("press", "Control+k");
    waitFor("document.activeElement?.getAttribute('role') === 'combobox'");
    browser("fill", "[role=combobox]", "dns");
    browser("press", "Enter");
    browser("wait", "--url", "**/dns");
    waitFor("document.querySelector('[data-tool-query]')?.value === ''");
    browser("back");
    waitFor("document.querySelector('h2')?.textContent.includes('submitted.example.com')");
    assert.equal(evaluate("document.querySelector('[data-tool-query]').value"), "submitted.example.com");
    assert.equal(evaluate("window.__calls.length"), 2);
    assertHealthy();
  });

  check("Ping preserves explicitly edited preset ports and omits disabled credentials", () => {
    open("/ping");
    browser("snapshot", "-i");
    installFixtures();
    browser("fill", "#ping-target", "example.com");
    browser("fill", "#ping-port", "80");
    clickRole("tab", "UDP");
    assert.equal(evaluate("document.querySelector('#ping-port').value"), "80");
    clickRole("tab", "Database");
    browser("click", "#ping-use-auth");
    browser("fill", "#ping-username", "test-user");
    browser("fill", "#ping-password", "browser-test-secret");
    browser("click", "#ping-use-auth");
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
    browser("fill", "[data-tool-query]", "1.0.0.1");
    browser("wait", "--url", "**/check?q=8.8.8.8");
    waitFor("window.__completed === window.__calls.length");
    assert.equal(evaluate("window.__calls.length"), 1);
    assert.equal(evaluate("document.querySelector('[data-tool-query]').value"), "1.0.0.1");
    assert.equal(evaluate("document.body.innerText.includes('Queried IP address')"), false);
    assertHealthy();
  });

  check("repeated IP parameters render and repeat submissions rerun", () => {
    const ipData = {ipv4:'1.1.1.1',ipv6:null,ipVersion:4,country:'Australia',countryCode:'AU',region:'',regionName:'',city:'',zip:'',lat:0,lon:0,timezone:'',isp:'Cloudflare',org:'Cloudflare',as:'AS13335 Cloudflare',asname:'CLOUDFLARENET',reverse:'one.one.one.one',mobile:false,proxy:false,hosting:true,connectionType:'datacenter'};
    browser("network", "route", "**/api/ip*", "--body", JSON.stringify({ok:true,data:ipData}));
    open("/check?q=1.1.1.1&q=8.8.8.8");
    waitFor("document.querySelector('[data-tool-query]')?.value === '1.1.1.1'");
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
    clickRole("button", "Toggle theme");
    clickRole("menuitemradio", "Light");
    waitFor("document.documentElement.classList.contains('light')");
    assertFits();
    browser("screenshot", join(artifacts, "ip-mobile-light.png"));
    clickRole("button", "Menu");
    clickRole("link", "DNS Lookup");
    browser("wait", "--url", "**/dns");
    assertHealthy();
  });

  check("German WHOIS fallback notes, raw disclosure, copy, and export work", () => {
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
    assert.equal(evaluate("document.documentElement.lang"), "de");
    assert.ok(evaluate("document.body.innerText.includes('WHOIS war nicht verfügbar.')"));
    clickRole("button", "Kopieren");
    assert.equal(evaluate("window.__copied"), data.raw);
    browser("click", "button[aria-controls=whois-raw-result]");
    assert.equal(evaluate("document.querySelector('#whois-raw-result').textContent"), data.raw);
    assert.equal(evaluate("document.querySelector('button[aria-controls=whois-raw-result]').getAttribute('aria-expanded')"), "true");
    const snapshot = browser("snapshot", "-i");
    const download = Object.entries(snapshot.refs).find(([, entry]) => entry.role === "button" && entry.name === "JSON herunterladen");
    assert.ok(download);
    const path = join(artifacts, "whois.json");
    browser("download", `@${download[0]}`, path);
    assert.deepEqual(JSON.parse(readFileSync(path, "utf8")), data);
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
