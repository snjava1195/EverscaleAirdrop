<template>
  <router-link @click="onExport" to="" class="text-[#2B63F1]">Export</router-link>
</template>

<script setup>
import exportFromJSON from 'export-from-json';
import dayjs from 'dayjs';
import { useWalletStore } from '@/stores/wallet';

const walletStore = useWalletStore();
function onExport() {
  const transactions = walletStore.profile.transactions.transactions;

  const data = transactions.map((transaction) => {
    let divider = 1000000000;
    return {
      Airdrop: 'Some unique name',
      Amount: transaction.outMessages.length ? transaction.outMessages[0].value / divider : 0,
      'Recipients number': 'Recipients number',
      Date: dayjs.unix(transaction.createdAt).format('DD MMM YYYY'),
    };
  });

  const fileName = 'download';
  const exportType = exportFromJSON.types.csv;
  exportFromJSON({ data, fileName, exportType });
}
</script>
