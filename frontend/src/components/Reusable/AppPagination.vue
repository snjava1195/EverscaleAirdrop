<template>
  <div class="flex items-center space-x-[20px]">
    <div class="itemsPerPage">
      <select v-model="itemsPerPage" class="dropdown">
        <option v-for="n in 50" :key="n" :value="n">{{ n }}</option>
      </select>
      <span> items on page of ... </span>
    </div>

    <div class="pageNumber">
      <input
        v-model="walletStore.currentPage"
        class="border w-[56px] h-[36px] flex justify-center items-center text-center"
        type="text"
        name="currentPage"
        disabled
      />
      <span> page of ... </span>
    </div>

    <div class="paginationBtns">
      <button :disabled="walletStore.currentPage === 1" @click="onPrevPage">
        <div class="leftBtn">
          <LeftArrowIcon />
        </div>
      </button>

      <button
        :disabled="walletStore.profile.transactions.continuation === undefined"
        @click="onNextPage"
      >
        <div class="rightBtn">
          <RightArrowIcon />
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useWalletStore } from '@/stores/wallet';
const emit = defineEmits(['submit']);
import LeftArrowIcon from '@/components/icons/IconLeftArrow.vue';
import RightArrowIcon from '@/components/icons/IconRightArrow.vue';

const walletStore = useWalletStore();

const itemsPerPage = ref(10);

watch(itemsPerPage, () => {
  walletStore.resetPagination();
  emit('submit', itemsPerPage.value, walletStore.currentPage);
});

function onNextPage() {
  emit('submit', itemsPerPage.value, walletStore.nextPage);
}

function onPrevPage() {
  emit('submit', itemsPerPage.value, walletStore.prevPage);
}
</script>
