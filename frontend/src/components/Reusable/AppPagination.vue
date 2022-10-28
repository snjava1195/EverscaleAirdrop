<template>
  <div class="w-full font-pt_root text-[14px]">
    <div class="flex items-center justify-end space-x-[20px]">
<<<<<<< HEAD
      <div class="hidden md:flex items-center space-x-[6px]">
        <form>
          <select v-model="walletStore.itemsPerPage" class="pagination-dropdown">
            <option v-for="n in 50" :key="n" :value="n">{{ n }}</option>
=======
      <div class="hidden md:flex items-center space-x-[6px] ">
        <form class="inline-block relative space-x-3 w-[62px]">
          <select v-model="itemsPerPage" class="pagination-dropdown block appearance-none">
            <option v-for="n in 50" :key="n" :value="n">{{ n }}</option>   
>>>>>>> a0e61c756377729f9fd9caef3bbdd32a6879043b
          </select>
          <div class="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2">
            <svg  width="10" height="5" viewBox="0 0 10 5" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 5L0 0H10L5 5Z" fill="#B7BAC2"/>
            </svg>         
          </div>
        </form>
        <span> items on page </span>
        <!--        <span> items on page of ... </span>-->
      </div>

      <div class="pageNumber">
        <form>
          <input
            v-model="walletStore.currentPage"
            class="border w-[56px] h-[36px] flex justify-center items-center text-center"
            type="text"
            name="currentPage"
            disabled
          />
        </form>
        <span> page </span>
        <!--        <span> page of ... </span>-->
      </div>

      <div class="paginationBtns">
        <button :disabled="walletStore.currentPage === 1" @click="onPrevPage">
          <div class="leftBtn w-[36px] h-[36px] flex items-center justify-center bg-[#ECF1FE] hover:bg-blue-100">
            <LeftArrowIcon />
          </div>
        </button>

        <button
          :disabled="airdropStore.airdrops ? airdropStore.airdrops.continuation === undefined : false"
          @click="onNextPage"
        >
          <div class="rightBtn w-[36px] h-[36px] flex items-center justify-center bg-[#ECF1FE] hover:bg-blue-100">
            <RightArrowIcon />
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useWalletStore } from '@/stores/wallet';
import { useAirdropStore } from '@/stores/airdrop';
const emit = defineEmits(['submit']);
import LeftArrowIcon from '@/components/icons/IconLeftArrow.vue';
import RightArrowIcon from '@/components/icons/IconRightArrow.vue';

const walletStore = useWalletStore();
const airdropStore = useAirdropStore();
//const itemsPerPage = computed(() => {
  //return walletStore.itemsPerPage;
//}); //ref(10);
const { itemsPerPage } = storeToRefs(walletStore);

watch( itemsPerPage, () => {
  walletStore.resetPagination();
  //walletStore.itemsPerPage = itemsPerPage;
  emit('submit', walletStore.itemsPerPage, walletStore.currentPage);
});

function onNextPage() {
  emit('submit', walletStore.itemsPerPage, walletStore.nextPage);
}
function onPrevPage() {
  emit('submit', walletStore.itemsPerPage, walletStore.prevPage);
}
</script>
