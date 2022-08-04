<template>
  <div class="main-content-airdrops">
    <h2 class="title-airdrops">The simplest way to airdrop tokens</h2>

    <header class="flex items-center justify-between mb-[21px]">
      <h3 class="text-[24px] font-medium">Your airdrops</h3>

      <div>
        <router-link to="/create-airdrop" custom v-slot="{ navigate }">
          <button @click="navigate" @keypress.enter="navigate" role="link" class="btn-create">
            Create new airdrop
          </button>
        </router-link>
        <button class="btn-add">Add existing airdrop</button>
      </div>
    </header>

    <table class="table">
      <thead class="thead">
        <tr>
          <th class="thead-cell w-[579px]">Airdrop</th>
          <th class="thead-cell">Amount</th>
          <th class="thead-cell text-right">Recipients number</th>
          <th class="thead-cell text-right pr-[12px]">Date</th>
        </tr>
      </thead>

      <tbody
        v-if="transactions && transactions.transactions.length && !walletStore.profile.loading"
      >
        <ItemBox v-for="(item, i) in transactions.transactions" :item="item" :key="i" />
      </tbody>

      <ItemLoading v-else-if="walletStore.profile.loading" />

      <EmptyItemBox v-else />
    </table>

    <div v-if="transactions && transactions.transactions.length" class="pagination">
      <ExportItems />

      <AppPagination @submit="getTransactions" />
    </div>
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

const walletStore = useWalletStore();

const transactions = computed(() => {
  return walletStore.profile.transactions;
});

function getTransactions(value, page) {
  walletStore.getTransactions(value, page);
}
</script>
