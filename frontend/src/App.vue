<template>
  <div class="font-faktum h-full xl:h-screen flex flex-col"
      :class="{ 'relative md:after:topGradient': $route.name === 'Main' }"  
  >
    <AppHeader />

    <div class="container xl:flex-1">

      <RouterView />

      <notifications position="bottom right" />
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { useWalletStore } from '@/stores/wallet';
import AppHeader from '@/components/Reusable/AppHeader.vue';
import AppFooter from '@/components/Reusable/AppFooter.vue';

const walletStore = useWalletStore();
</script>
