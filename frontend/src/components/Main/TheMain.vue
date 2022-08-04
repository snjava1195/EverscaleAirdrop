<template>
  <TheMainNotLogged v-if="!walletStore.isLogged" />

  <main v-if="walletStore.isLogged" class="main">
    <TheMainLogged />
  </main>
</template>

<script setup>
import { useWalletStore } from '@/stores/wallet';
import TheMainNotLogged from '@/components/Main/TheMainNotLogged.vue';
import TheMainLogged from '@/components/Main/TheMainLogged.vue';

const walletStore = useWalletStore();
</script>
