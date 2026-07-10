<script setup>
import { ArrowRight, BadgeCheck, Shield, Target } from "lucide-vue-next";

const cards = [
  {
    title: "为什么要财务规划",
    text: "财务规划可以帮助你明确目标、应对风险，让生活更有底气。",
    icon: Target,
  },
  {
    title: "财务规划的重要性",
    text: "良好的财务规划能帮助你更好地管理现金，实现财务自由。",
    icon: Shield,
  },
  {
    title: "网站各部分的意义",
    text: "记账明细记录收支，资产帮你了解现状，配置帮你规划未来。",
    icon: BadgeCheck,
  },
];
</script>

<template>
  <section class="home-page">
    <div class="hero-grid">
      <div class="hero-copy">
        <p class="section-kicker">Private finance system</p>
        <h1>Freedom</h1>
        <h2>您的私人财务助手</h2>
        <p class="subtitle">your personal financial assistant</p>
        <p class="hero-body">
          帮助你记录收支、管理资产、合理配置资金，让每一分钱都花得明白、存得安心、投得从容。
        </p>
      </div>

      <div class="finance-object" aria-label="黑金抽象金融视觉">
        <div class="spotlight"></div>
        <div class="gold-ring ring-back"></div>
        <div class="gold-ring ring-front"></div>
        <div class="metal-bar bar-one"></div>
        <div class="metal-bar bar-two"></div>
        <div class="metal-bar bar-three"></div>
        <div class="stone-plinth"></div>
        <div class="gold-sphere"></div>
        <div class="base-line"></div>
      </div>
    </div>

    <div class="info-grid">
      <article v-for="card in cards" :key="card.title" class="info-card">
        <div class="card-icon">
          <component :is="card.icon" :size="26" :stroke-width="1.8" aria-hidden="true" />
        </div>
        <h3>{{ card.title }}</h3>
        <p>{{ card.text }}</p>
        <a href="#" aria-label="查看说明" @click.prevent>
          <ArrowRight :size="18" :stroke-width="1.8" aria-hidden="true" />
        </a>
      </article>
    </div>
  </section>
</template>
