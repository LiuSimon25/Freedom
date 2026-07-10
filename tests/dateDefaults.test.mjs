import assert from "node:assert/strict";
import { toLocalDateInputValue, toLocalMonthInputValue } from "../src/utils/dateDefaults.js";

const date = new Date(2026, 6, 10, 21, 30);

assert.equal(toLocalDateInputValue(date), "2026-07-10");
assert.equal(toLocalMonthInputValue(date), "2026-07");

console.log("dateDefaults tests passed");
