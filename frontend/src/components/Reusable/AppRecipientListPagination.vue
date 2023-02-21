<template>
  <div class="w-full font-pt_root text-[14px]">
    <div class="flex items-center justify-end space-x-[20px]">
      <div class="hidden md:flex items-center space-x-[6px]">
        <form>
          <select v-model="itemsPerPage" class="pagination-dropdown">
            <option v-for="n in [5, 10, 20, 50, 100]" :key="n" :value="n">{{ n }}</option>
          </select>
        </form>
        <span> items on page </span>
        <!--        <span> items on page of ... </span>-->
      </div>

      <div class="pageNumber">
        <form>
          <input
            v-model="recipientStore.currentPage"
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
        <button @click="onPrevPage">
          <div class="leftBtn w-[36px] h-[36px] flex items-center justify-center bg-[#ECF1FE]">
            <LeftArrowIcon />
          </div>
        </button>

        <button @click="onNextPage">
          <div class="rightBtn w-[36px] h-[36px] flex items-center justify-center bg-[#ECF1FE]">
            <RightArrowIcon />
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRecipientStore } from '@/stores/recipientStore';

const emit = defineEmits(['submit']);
import LeftArrowIcon from '@/components/icons/IconLeftArrow.vue';
import RightArrowIcon from '@/components/icons/IconRightArrow.vue';

const recipientStore = useRecipientStore();
const itemsPerPage = ref(10);

watch(itemsPerPage, () => {
  recipientStore.resetPagination();
  emit('submit', itemsPerPage.value, recipientStore.currentPage);
});

function onNextPage() {
  emit('submit', itemsPerPage.value, recipientStore.nextPage);
}
function onPrevPage() {
  emit('submit', itemsPerPage.value, recipientStore.prevPage);
}
</script>
