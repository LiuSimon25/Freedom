<script setup>
import { computed, ref } from "vue";
import { ChartNoAxesCombined, Download, Home, Landmark, NotebookTabs, Trash2, Upload, X } from "lucide-vue-next";
import HomePage from "./pages/HomePage.vue";
import LedgerPage from "./pages/LedgerPage.vue";
import AssetsPage from "./pages/AssetsPage.vue";
import ConfigPage from "./pages/ConfigPage.vue";
import { clearFreedomData, exportFreedomData, importFreedomData } from "./utils/storage";

const navItems = [
  { id: "home", label: "首页", icon: Home },
  { id: "ledger", label: "记账", icon: NotebookTabs },
  { id: "assets", label: "资产", icon: Landmark },
  { id: "config", label: "配置", icon: ChartNoAxesCombined },
];

const activePage = ref("home");
const clearConfirmOpen = ref(false);

const activeTitle = computed(() => {
  const item = navItems.find((navItem) => navItem.id === activePage.value);
  return item ? item.label : "首页";
});

function exportData() {
  const payload = exportFreedomData();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `freedom-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

async function importData(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  const confirmed = window.confirm("导入会覆盖当前所有本地数据，确定继续吗？");
  if (!confirmed) {
    event.target.value = "";
    return;
  }

  try {
    const text = await file.text();
    importFreedomData(JSON.parse(text));
    window.location.reload();
  } catch (error) {
    window.alert(error instanceof Error ? error.message : "导入失败，请检查 JSON 文件。");
    event.target.value = "";
  }
}

function confirmClearData() {
  clearFreedomData();
  clearConfirmOpen.value = false;
  window.dispatchEvent(new CustomEvent("freedom-data-cleared"));
}
</script>

<template>
  <div class="app-frame">
    <aside class="sidebar" aria-label="主导航">
      <a class="brand" href="#" aria-label="Freedom 首页" @click.prevent="activePage = 'home'">
        <span class="brand-mark" aria-hidden="true">
          <span></span>
        </span>
        <span class="brand-name">Freedom</span>
      </a>

      <nav class="nav-list">
        <button
          v-for="item in navItems"
          :key="item.id"
          class="nav-item"
          :class="{ active: activePage === item.id }"
          type="button"
          @click="activePage = item.id"
        >
          <component :is="item.icon" :size="18" :stroke-width="1.8" aria-hidden="true" />
          <span>{{ item.label }}</span>
        </button>
      </nav>

      <div class="data-actions">
        <button type="button" @click="clearConfirmOpen = true">
          <Trash2 :size="16" :stroke-width="1.8" aria-hidden="true" />
          <span>清空数据</span>
        </button>
        <button type="button" @click="exportData">
          <Download :size="16" :stroke-width="1.8" aria-hidden="true" />
          <span>导出数据</span>
        </button>
        <label>
          <Upload :size="16" :stroke-width="1.8" aria-hidden="true" />
          <span>导入数据</span>
          <input type="file" accept="application/json" @change="importData" />
        </label>
      </div>
    </aside>

    <main class="main-shell" :aria-label="activeTitle">
      <HomePage v-if="activePage === 'home'" />
      <LedgerPage v-else-if="activePage === 'ledger'" />
      <AssetsPage v-else-if="activePage === 'assets'" />
      <ConfigPage v-else-if="activePage === 'config'" />
      <section v-else class="page-placeholder">
        <p class="section-kicker">即将开发</p>
        <h1>{{ activeTitle }}</h1>
        <p>首页验收后，将按顺序开发这个页面。</p>
      </section>
    </main>

    <div v-if="clearConfirmOpen" class="modal-backdrop" @click.self="clearConfirmOpen = false">
      <section class="modal-card confirm-modal" role="dialog" aria-modal="true" aria-labelledby="clear-data-title">
        <button class="modal-close" type="button" aria-label="关闭" @click="clearConfirmOpen = false">
          <X :size="18" aria-hidden="true" />
        </button>
        <h2 id="clear-data-title">确认清空所有数据？</h2>
        <p>此操作会删除所有记账、资产、配置和保单数据，清空后无法恢复。</p>
        <div class="modal-actions">
          <button class="secondary-button" type="button" @click="clearConfirmOpen = false">取消</button>
          <button class="primary-button danger-button" type="button" @click="confirmClearData">确认清空</button>
        </div>
      </section>
    </div>
  </div>
</template>
