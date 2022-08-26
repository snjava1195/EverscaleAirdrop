<template>
  <div class="table w-full">
    <!--Mobile-->
    <!-- <div
      class="mobTable lg:hidden w-full border border-[#E4E5EA] px-[12px] divide-y divide-[#E4E5EA] mt-[16px] mb-[310px] font-pt_root"
    >
      <div v-for="(item, i) in transactions.transactions" :key="i" class="space-y-[8px] py-[16px]">
        <div class="flex items-center justify-between">
          <h3>Some unique name</h3>

          <span class="px-[8px] py-[4px] bg-[#DEF1DE] text-[#398A39] rounded-full text-[12px]">
            Executed
          </span>
        </div>
        <div class="flex items-center space-x-[8px]">
          <EverIcon />
          <h2>{{ everDivider(item) }} EVER</h2>
        </div>

        <div class="flex items-center justify-between">
          <p class="text-[14px] text-[#A6AAB2]">Receipents number</p>
          <p>{{ item.id.lt }}</p>
        </div>

        <div class="flex items-start justify-between">
          <p class="text-[14px] text-[#A6AAB2]">Date</p>
          <div class="text-right">
            <p class="text-[14px]">{{ createdAt(item) }}</p>
            <p class="text-[12px] text-[#6C7078]">Created</p>
          </div>
        </div>
      </div>
    </div> -->

    <!--Desktop-->
    <!-- <table
      class="desktopTable w-full mx-auto hidden lg:block border border-[#E4E5EA] text-[14px] mt-[17px] lg:mb-[100px] xl:mb-0 font-pt_root"
    >
      <thead>
        <ItemBoxHeading />
      </thead>

      <tbody>
        <tr v-for="(item, i) in transactions.transactions" :key="i">
          <td class="h-[58px] pl-[12px] border-[#E4E5EA] border-t">
            <div>
              Some unique name
              <span
                class="py-[4px] px-[8px] bg-[#E4E5EA] text-[#6C7078] rounded-full text-[12px] font-medium ml-[6px]"
                >Preparing</span
              >
            </div>
          </td>

          <td class="h-[58px] pl-[12px] border-[#E4E5EA] border-t flex items-center">
            <span class="mr-[6px]">
              <EverIcon />
            </span>
            {{ everDivider(item) }} EVER
          </td>

          <td class="h-[58px] pl-[20px] border-[#E4E5EA] border-t text-right pr-[12px]">
            {{ item.id.lt }}
          </td>
          <td class="h-[58px] pr-[12px] border-[#E4E5EA] border-t text-right">
            <p>{{ createdAt(item) }}</p>
            <p class="text-[#6C7078] text-[12px]">Created</p>
          </td>
        </tr>
      </tbody>
    </table> -->
    <table
      class="desktopTable w-full mx-auto hidden lg:block border border-[#E4E5EA] text-[14px] mt-[17px] lg:mb-[100px] xl:mb-0 font-pt_root"
    >
      <thead>
        <ItemBoxHeading />
      </thead>

      <tbody>
        <tr v-for="(airdrop, i) in airdrops" :key="i">
          <td class="h-[58px] pl-[12px] border-[#E4E5EA] border-t">
            <div>
              {{ airdrop.name }}
              <span
                class="py-[4px] px-[8px] bg-[#E4E5EA] text-[#6C7078] rounded-full text-[12px] font-medium ml-[6px]"
                >{{ airdrop.status }}</span
              >
            </div>
          </td>

          <td class="h-[58px] pl-[12px] border-[#E4E5EA] border-t flex items-center">
            <span class="mr-[6px]">
              <EverIcon />
            </span>
            {{ airdrop.amount }} EVER
          </td>

          <td class="h-[58px] pl-[20px] border-[#E4E5EA] border-t text-right pr-[12px]">
           {{ airdrop.recipientsNumber }}
          </td>
          <td class="h-[58px] pr-[12px] border-[#E4E5EA] border-t text-right">
            <!-- <p>{{ createdAt(airdrop) }}</p> -->
            <p>{{ airdrop.createdAt }}</p>
            <p class="text-[#6C7078] text-[12px]">Created</p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import dayjs from 'dayjs';
// import { useWalletStore } from '@/stores/wallet';
import { useAirdropStore } from '@/stores/airdrop';
import { toNano } from '@/utils';
import EverIcon from '@/components/icons/IconEver.vue';
import ItemBoxHeading from '@/components/Main/ItemBoxHeading.vue';

// const walletStore = useWalletStore();

// const transactions = computed(() => {
//   return walletStore.profile.transactions;
// });

const airdropStore = useAirdropStore();

const airdrops = computed(() => {
  return airdropStore.airdropsList;
});

function everDivider(item) {
  return item.outMessages.length ? Number(item.outMessages[0].value) / toNano(1) : 0;
}

function createdAt(item) {
  let date = item.createdAt;
  return dayjs.unix(date).format('DD MMM YYYY');
}
</script>
