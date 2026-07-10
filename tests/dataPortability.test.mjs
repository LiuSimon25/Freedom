import assert from "node:assert/strict";
import {
  buildExportPayload,
  normalizeImportPayload,
} from "../src/utils/dataPortability.js";

const exported = buildExportPayload({
  ledgerRecords: [{ id: "record-1" }],
  assets: [{ id: "asset-1" }],
  assetSnapshots: [{ id: "snapshot-1" }],
  policies: [{ id: "policy-1" }],
});

assert.equal(exported.app, "Freedom");
assert.equal(exported.version, 1);
assert.deepEqual(exported.data.ledgerRecords, [{ id: "record-1" }]);
assert.deepEqual(exported.data.assets, [{ id: "asset-1" }]);
assert.deepEqual(exported.data.assetSnapshots, [{ id: "snapshot-1" }]);
assert.deepEqual(exported.data.policies, [{ id: "policy-1" }]);

const normalized = normalizeImportPayload({
  app: "Freedom",
  version: 1,
  data: {
    ledgerRecords: [{ id: "record-2" }],
    assets: [{ id: "asset-2" }],
    assetSnapshots: "bad",
    policies: [{ id: "policy-2" }],
  },
});

assert.deepEqual(normalized, {
  ledgerRecords: [{ id: "record-2" }],
  assets: [{ id: "asset-2" }],
  assetSnapshots: [],
  policies: [{ id: "policy-2" }],
});

assert.throws(() => normalizeImportPayload({ app: "Other", data: {} }), /不是 Freedom/);
