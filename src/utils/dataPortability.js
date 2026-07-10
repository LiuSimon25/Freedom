export function buildExportPayload({ ledgerRecords, assets, assetSnapshots, policies }) {
  return {
    app: "Freedom",
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      ledgerRecords: Array.isArray(ledgerRecords) ? ledgerRecords : [],
      assets: Array.isArray(assets) ? assets : [],
      assetSnapshots: Array.isArray(assetSnapshots) ? assetSnapshots : [],
      policies: Array.isArray(policies) ? policies : [],
    },
  };
}

export function normalizeImportPayload(payload) {
  if (!payload || payload.app !== "Freedom" || !payload.data) {
    throw new Error("这不是 Freedom 的备份文件");
  }

  return {
    ledgerRecords: Array.isArray(payload.data.ledgerRecords) ? payload.data.ledgerRecords : [],
    assets: Array.isArray(payload.data.assets) ? payload.data.assets : [],
    assetSnapshots: Array.isArray(payload.data.assetSnapshots) ? payload.data.assetSnapshots : [],
    policies: Array.isArray(payload.data.policies) ? payload.data.policies : [],
  };
}
