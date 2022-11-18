<template>
  <div>
    <table
      class="desktopTable w-full mx-auto sm:border border-[#E4E5EA] text-[14px] mt-[17px] mb-[67px] md:mb-[455px] lg:mb-[484px]"
    >
      <thead class="hidden lg:block font-pt_root">
        <ItemBoxHeading />
      </thead>

      <tbody>
        <tr>
          <td colspan="4" class="md:border-t border-[#E4E5EA]">
            <div
              class="w-full md:w-[375px] mx-auto text-center mt-[32px] mb-[20px] px-[20px] md:px-0"
            >
              <h3 class="text-[18px] font-semibold mb-[12px] font-faktum">
                It seems you haven’t made<br class="md:hidden" />
                any airdrop yet
              </h3>
              <p class="font-pt_root">
                Create your first airdrop or add<br class="md:hidden" />
                existing one.
              </p>

              <div
                class="flex flex-col md:flex-row md:justify-between mt-[24px] space-y-[16px] md:space-y-0 font-pt_root"
              >
                <router-link to="/create-airdrop" custom v-slot="{ navigate }">
                  <button
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                    class="bg-[#2B63F1] text-white w-full md:w-[180px] h-[46px]"
                  >
                    Create airdrop
                  </button>
                </router-link>

                <button class="bg-[#ECF1FE] text-[#2B63F1] w-full md:w-[177px] h-[46px]" @click="showAddExistingAirdropModal = true">
                  Add existing airdrop
                </button>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <AddExistingAirdropModal :show="showAddExistingAirdropModal" @close-add-existing-airdrop-modal="showAddExistingAirdropModal = false"></AddExistingAirdropModal>
</template>

<script setup>
import { ref } from 'vue';
import ItemBoxHeading from '@/components/Main/ItemBoxHeading.vue';
import AddExistingAirdropModal from '@/components/ExistingAirdrop/AddExistingAirdropModal.vue';

const showAddExistingAirdropModal = ref(false);
</script>
