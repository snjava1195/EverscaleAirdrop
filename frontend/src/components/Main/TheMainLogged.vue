<template>
  <div class="px-[20px] md:px-[40px] lg:px-[10px]">
    <header class="flex flex-col items-center mt-[64px] md:mt-[96px] relative z-10">
      <h1 class="main-title">
        The simplest way<br class="lg:hidden" />
        to airdrop tokens
      </h1>
    </header>

    <main class="w-full xl:max-w-[1160px] mx-auto">
      <div
        class="flex flex-col md:flex-row md:justify-between md:items-center space-y-[16px] md:space-y-0 mt-[64px]"
      >
        <h2 class="text-[24px] font-medium">Your airdrops</h2>
        <div
          class="flex flex-col md:flex-row md:items-center md:space-x-[12px] space-y-[8px] md:space-y-0"
        >
          <router-link to="/create-airdrop" custom v-slot="{ navigate }">
            <button
              @click="navigate"
              @keypress.enter="navigate"
              role="link"
              class="create-airdrop-btn hover:bg-blue-700"
            >
              Create new airdrop
            </button>
          </router-link>
          <button class="add-airdrop-btn hover:bg-blue-100">Add existing airdrop</button>
        </div>
      </div>

      <template
        v-if="transactions && transactions.length && !airdropStore.airdropsLoading" 
      >
        <ItemBox />

        <div class="hidden xl:flex items-center justify-between mt-[16px] mb-[100px]">
          <ExportItems />
          <AppPagination @submit="getTransactions" />
        </div>
      </template>

      <ItemLoading v-else-if="airdropStore.airdropsLoading" />

      <EmptyItemBox v-else />
    </main>
  </div>
</template>
<script setup>
import { computed } from 'vue';
import { useWalletStore } from '@/stores/wallet';
import ItemBox from '@/components/Main/ItemBox.vue';
import EmptyItemBox from '@/components/Main/EmptyItemBox.vue';
import ItemLoading from '@/components/Main/ItemLoading.vue';
import AppPagination from '@/components/Reusable/AppPagination.vue';
import ExportItems from '@/components/Main/ExportItems.vue';
import { useAirdropStore } from '@/stores/airdrop';

const walletStore = useWalletStore();
const airdropStore = useAirdropStore();
getTransactions(10, 1);
const transactions = computed(() => {
  return airdropStore.airdropData;
});

function getTransactions(value, page) {
  console.log(`Usao u get trx: ${value} ${page}`);
  airdropStore.getAirdropTransactions(value, page);
}
</script>
