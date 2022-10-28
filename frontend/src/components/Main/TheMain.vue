<template>
  <div>
    <TheMainNotLogged v-if="!walletStore.isLogged" />

    <main v-if="walletStore.isLogged">
      <TheMainLogged />
    </main>
  </div>
</template>

<script setup>
import { useWalletStore } from '@/stores/wallet';
import TheMainNotLogged from '@/components/Main/TheMainNotLogged.vue';
import TheMainLogged from '@/components/Main/TheMainLogged.vue';

const walletStore = useWalletStore();
</script>
