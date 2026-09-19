/**
 * Parity check for the event lifecycle ported into main.js.
 *
 * This site is vanilla JS with no test runner, and the lifecycle logic here is
 * a hand port of STATION8/lib/event-lifecycle.ts, which does have one. Two
 * copies of date logic in two languages will drift, and the drift is invisible:
 * an event on the wrong side of "today" still renders a perfectly good card.
 *
 * So this runs the ported functions against the same cases the TypeScript
 * original is tested on. No dependencies, no runner:
 *
 *   node website/js/__tests__/event-lifecycle.check.mjs
 *
 * Run it after touching either copy. It exits non-zero on a mismatch.
 */
// Pull the ported functions out of main.js and run them against the same cases
// the TypeScript original is tested on, so the two cannot quietly diverge.
import { readFileSync } from "node:fs";
const src = readFileSync(new URL("../main.js", import.meta.url), "utf8");
const start = src.indexOf("const PAST_EVENT_GRACE_DAYS");
const end = src.indexOf("function parseCSV(csv) {");
const body = src.slice(start, end);
const fn = new Function(body + "\nreturn { classifyEvents, monthIndex, PAST_EVENT_GRACE_DAYS, NO_YEAR_LOOKAHEAD_DAYS };");
const { classifyEvents, monthIndex, PAST_EVENT_GRACE_DAYS, NO_YEAR_LOOKAHEAD_DAYS } = fn();

const NOW = new Date("2026-09-18T19:00:00Z");
const ev = (month, day, title = "x", year = "") => ({ month, day, title, description: "", url: "", year });
let failed = 0;
const check = (name, actual, expected) => {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a !== e) { console.log(`  FAIL ${name}\n    got ${a}\n    want ${e}`); failed++; }
  else console.log(`  ok   ${name}`);
};

check("grace window is 60", PAST_EVENT_GRACE_DAYS, 60);
check("month names", [monthIndex("APRIL"), monthIndex("Sept"), monthIndex("Dec."), monthIndex("Ma"), monthIndex("Smarch")], [3, 8, 11, null, null]);
check("month numbers", [monthIndex("1"), monthIndex("01"), monthIndex("10"), monthIndex("12"), monthIndex("0"), monthIndex("13")], [0, 0, 9, 11, null, null]);
check("month label is canonical however typed",
  classifyEvents([ev("10","1","digits"), ev("Oct","2","short"), ev("OCTOBER","3","long")], NOW).map(e => e.monthLabel),
  ["OCTOBER","OCTOBER","OCTOBER"]);
check("upcoming + past states",
  classifyEvents([ev("OCTOBER","3","Future"), ev("SEPTEMBER","1","Gone")], NOW).map(e => [e.title, e.state]),
  [["Future","upcoming"],["Gone","past"]]);
check("today counts as upcoming", classifyEvents([ev("SEPTEMBER","18")], NOW)[0].state, "upcoming");
check("60 days kept", classifyEvents([ev("JULY","20")], NOW).length, 1);
check("61 days dropped", classifyEvents([ev("JULY","19")], NOW).length, 0);
check("ordering",
  classifyEvents([ev("SEPTEMBER","5","PastOld"), ev("DECEMBER","1","UpLate"), ev("SEPTEMBER","16","PastNew"), ev("OCTOBER","2","UpSoon")], NOW).map(e => e.title),
  ["UpSoon","UpLate","PastNew","PastOld"]);
check("stale April dropped, not resurrected", classifyEvents([ev("APRIL","1")], NOW).length, 0);
check("Year column respected", classifyEvents([ev("JANUARY","10","x","2027")], NOW).map(e => e.state), ["upcoming"]);
check("lookahead window is 120", NO_YEAR_LOOKAHEAD_DAYS, 120);
const DEC = new Date("2026-12-20T19:00:00Z");
check("Jan typed in Dec rolls to next year, no Year column",
  classifyEvents([ev("JANUARY","10")], DEC).map(e => [e.state, new Date(e.timestamp).getUTCFullYear()]),
  [["upcoming", 2027]]);
check("stale June still dropped when read in Dec", classifyEvents([ev("JUNE","5")], DEC).length, 0);
check("wrap-forward edge: 19 Apr in, 20 Apr out",
  [classifyEvents([ev("APRIL","19")], DEC).length, classifyEvents([ev("APRIL","20")], DEC).length], [1, 0]);
check("explicit Year beats the inference", classifyEvents([ev("APRIL","1","x","2027")], NOW).length, 1);
check("Feb 30 dropped", classifyEvents([ev("FEBRUARY","30","x","2027")], NOW).length, 0);
check("leap day ok in 2028", classifyEvents([ev("FEBRUARY","29","x","2028")], NOW).length, 1);
check("leap day refused in 2027", classifyEvents([ev("FEBRUARY","29","x","2027")], NOW).length, 0);
check("bad year dropped", classifyEvents([ev("OCTOBER","3","x","next")], NOW).length, 0);
check("California day, not UTC", classifyEvents([ev("SEPTEMBER","18")], new Date("2026-09-19T02:00:00Z"))[0].state, "upcoming");

console.log(failed === 0 ? "\nALL PASS: the JS port matches the TypeScript original" : `\n${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
