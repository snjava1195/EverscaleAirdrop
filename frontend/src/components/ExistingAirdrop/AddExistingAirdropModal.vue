<template>
<!-- Main modal -->
  <div v-if="show" aria-hidden="true" class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 p-4 w-full md:inset-0 h-modal md:h-full main_modal">
    <div class="relative w-full max-w-md h-full md:h-auto">
      <!-- Modal content -->
      <div class="relative bg-white shadow dark:bg-gray-700" ref="target">
        <button @click="$emit('close-add-existing-airdrop-modal')" type="button" class="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900  text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white" data-modal-toggle="authentication-modal">
          <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
          <span class="sr-only">Close modal</span>
        </button>
        <div class="py-6 px-6 lg:px-8">
          <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white font-faktum">Add existing airdrop</h3>
          <form class="space-y-6" action="#">
              <div >
                <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white modal_label">Airdrop address</label>
                <div class="custom-input-wrap">
                  <input v-model="airdropAddress" type="airdropAddress" name="airdropAddress" id="airdropAddress" class="custom-input bg-gray-50 border border-gray-300 text-gray-900 text-sm  focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-black modal_input" required>
                  <button @click.prevent="pasteText()" class="custom-input-button">Paste</button>
                </div>
                
              </div>
              <button @click.prevent="goToExistingAirdrop()" type="submit" class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium  text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Add airdrop</button>
          </form>
        </div>
      </div>
    </div>
  </div> 
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router'
import { validateAirdropAddress } from '@/utils';
import airdrop2Tvc from '../../../../build/Airdrop.base64?raw';
import { ProviderRpcClient } from 'everscale-inpage-provider';
import { useWalletStore } from '@/stores/wallet';
import { notify } from '@kyvg/vue3-notification';
import { onClickOutside } from '@vueuse/core';

const router = useRouter();
const emit = defineEmits(['close-add-existing-airdrop-modal']);
const airdropAddress = ref('');
const target = ref(null);

onClickOutside(target, () => {
  emit('close-add-existing-airdrop-modal');
});

const props = defineProps({
  show: {
    type: Boolean,
  }
});

async function goToExistingAirdrop() {
  console.log('go to existing airdrop');
  if (!validateAirdropAddress(airdropAddress.value)) {
    return;
  }

  const ever = new ProviderRpcClient();
  const fullState = await ever.getFullContractState({address: airdropAddress.value});
  const walletStore = useWalletStore();
  const codeEver = await ever.splitTvc(airdrop2Tvc);
  const hashEver = await ever.setCodeSalt({ code: codeEver.code, salt: { structure: [{ name: 'ownerAddress', type: 'address' }], data: { ownerAddress: walletStore.profile.address } } });
  const bocHashEver = await ever.getBocHash(hashEver.code);
  if ((fullState.state.codeHash == undefined || fullState.state.codeHash == null) || (fullState.state.codeHash != bocHashEver)) {
    notify({
      text: 'It seems that this is not valid airdrop',
      type: 'error',
    });
    return;
  }
  
  emit('close-add-existing-airdrop-modal');
  router.push({ name: 'ExistingAirdrop', params: { address: airdropAddress.value } });
}

function pasteText()
{
  navigator.clipboard.readText().then((clipText) => airdropAddress.value = clipText);
}
</script>