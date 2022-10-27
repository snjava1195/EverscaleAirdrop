<template>
  <router-link @click="onExport" to="" class="text-[#2B63F1] font-medium font-pt_root"
    >Export</router-link
  >
</template>

<script setup>
import exportFromJSON from 'export-from-json';
import dayjs from 'dayjs';
import { useAirdropStore } from '@/stores/airdrop';
import { toNano } from '@/utils';
import { computed } from 'vue';

let airdropStore = useAirdropStore();
let transactions = computed(() => {
  return airdropStore.airdropData;
});
function onExport() {
  //const transactions = airdropStore.airdropData;
  console.log('Transactions: ', transactions.value);
  let data=[];
  let arr = transactions.value;
  for(let i=0;i<arr.length;i++)
  {
    data.push( {
      Airdrop: arr[i].airdropName,
      Amount: arr[i].amount + " " + arr[i].tokenLabel,
      'Recipients number': arr[i].recipientsNumber,
      Date: dayjs.unix(arr[i].dateCreated).format('DD MMM YYYY'),
    });
  }
  console.log('Data: ', data);
  /*const data = transactions.map((transaction) => {
    return {
      Airdrop: transaction.airdropName,
      Amount: transaction.amount + " " + transaction.tokenLabel,
      'Recipients number': transaction.recipientsNumber,
      Date: dayjs.unix(transaction.dateCreated).format('DD MMM YYYY'),
    };
  });*/

  const fileName = 'download';
  const exportType = exportFromJSON.types.csv;
  exportFromJSON({ data, fileName, exportType });
}
</script>
