<template>
  <div
    class="container font-faktum"
    :class="{ 'relative md:after:topGradient': $route.name === 'Main' }"
  >
    <AppHeader />

    <RouterView />

    <notifications position="bottom right" />
  </div>
  <AppFooter />
</template>

<script setup>
import { useWalletStore } from '@/stores/wallet';
import AppHeader from '@/components/Reusable/AppHeader.vue';
import AppFooter from '@/components/Reusable/AppFooter.vue';

const walletStore = useWalletStore();
</script>
