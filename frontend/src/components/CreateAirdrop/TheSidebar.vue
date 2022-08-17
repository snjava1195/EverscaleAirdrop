<template>
  <aside class="aside">
    <header class="aside-header">
      <div class="flex justify-between">
        <div class="flex items-end space-x-[6px]">
          <span class="text-[#8B909A]"> Smart contract address </span>
          <span>
            <InfoIcon title="Lorem  Ipsum, Lorem Ipsum" />
          </span>
        </div>

        <div class="flex items-center space-x-[10px]">
          <a class="text-[#2B63F1]">{{ $filters.addressFormat(airdropStore.address) }}</a>

          <span @click="copy(airdropStore.address)" class="cursor-pointer">
            <CopyIcon />
          </span>
        </div>
      </div>

      <div class="flex justify-between">
        <span class="text-[#8B909A]">Creation date & time</span>
        <span>{{ dayjs(new Date()).format('DD.MM.YYYY, HH:mm') }}</span>
      </div>

      <div class="flex justify-between">
        <span class="text-[#8B909A]">Recipients number</span>
        <span>{{ recipientsList.length }}</span>
      </div>

      <div class="flex justify-between">
        <span class="text-[#8B909A]">Estimated gas fee</span>
        <span>{{ 0.1 * recipientsList.length }} EVER</span>
      </div>

      <div class="flex justify-between items-center font-bold text-black">
        <span>Total tokens</span>
        <span
          ><span class="text-[20px]">{{ totalTokens }}</span> {{ tokenName }}</span
        >
      </div>
    </header>

    <main>
      <ul class="aside-main">
        <!-- Step 1 -->
        <li class="flex items-center" :class="{ 'justify-between': step > 1 }">
          <div class="flex items-center">
            <span
              class="list-number"
              :class="
                !recipientsList.length
                  ? 'bg-[#E4E5EA] text-[#6C7078]'
                  : step === 1
                  ? 'bg-[#2B63F1] text-white'
                  : step > 1
                  ? 'bg-[#4AB44A] text-white'
                  : ''
              "
            >
              <span v-if="step <= 1">1</span>
              <CheckIcon v-else />
            </span>
            <a
              :class="
                !recipientsList.length
                  ? 'text-[#A6AAB2]'
                  : step === 1
                  ? 'text-black'
                  : step > 1
                  ? 'text-[#4AB44A] font-medium'
                  : ''
              "
              >Top-up 1 EVER</a
            >
          </div>

          <div v-if="step > 1" class="flex items-center space-x-[6px]">
            <span class="text-[#2B63F1]">{{
              $filters.addressFormat(transactionId.giverContractId)
            }}</span>
            <span @click="copy(transactionId.giverContractId)" class="cursor-pointer">
              <CopyIcon />
            </span>
          </div>
        </li>

        <!-- Step 2 -->
        <li class="flex items-center" :class="{ 'justify-between': step > 2 }">
          <div class="flex items-center">
            <span
              class="list-number"
              :class="
                !recipientsList.length || step === 1
                  ? 'bg-[#E4E5EA] text-[#6C7078]'
                  : step === 2
                  ? 'bg-[#2B63F1] text-white'
                  : step > 2
                  ? 'bg-[#4AB44A] text-white'
                  : ''
              "
            >
              <span v-if="step <= 2">2</span>
              <CheckIcon v-else />
            </span>

            <a
              :class="
                !recipientsList.length
                  ? 'text-[#A6AAB2]'
                  : step === 2
                  ? 'text-black'
                  : step > 2
                  ? 'text-[#4AB44A] font-medium'
                  : ''
              "
              >Deploy contract</a
            >
          </div>

          <div v-if="step > 2" class="flex items-center space-x-[6px]">
            <span class="text-[#2B63F1]">{{
              $filters.addressFormat(transactionId.deployContractId)
            }}</span>

            <span @click="copy(transactionId.deployContractId)" class="cursor-pointer">
              <CopyIcon />
            </span>
          </div>
        </li>

        <!-- Step 3 -->
        <li class="flex items-center" :class="{ 'justify-between': step > 3 }">
          <div class="flex items-center">
            <span
              class="list-number"
              :class="
                !recipientsList.length || step === 1 || step === 2
                  ? 'bg-[#E4E5EA] text-[#6C7078]'
                  : step === 3
                  ? 'bg-[#2B63F1] text-white'
                  : step > 3
                  ? 'bg-[#4AB44A] text-white'
                  : ''
              "
            >
              <span v-if="step <= 3">3</span>
              <CheckIcon v-else />
            </span>
            <a
              :class="
                !recipientsList.length
                  ? 'text-[#A6AAB2]'
                  : step === 3
                  ? 'text-black'
                  : step > 3
                  ? 'text-[#4AB44A] font-medium'
                  : ''
              "
              >Top-up {{ totalTokens + 1 }} {{ tokenName }}</a
            >
          </div>

          <div v-if="step > 3" class="flex items-center space-x-[6px]">
            <span class="text-[#2B63F1]">{{
              $filters.addressFormat(transactionId.amountContractId)
            }}</span>
            <span @click="copy(transactionId.amountContractId)" class="cursor-pointer">
              <CopyIcon />
            </span>
          </div>
        </li>

        <!-- Step 4 -->
        <li class="flex items-center" :class="{ 'justify-between': step > 4 }">
          <div class="flex items-center">
            <span
              class="list-number"
              :class="
                !recipientsList.length || step === 1 || step === 2 || step === 3
                  ? 'bg-[#E4E5EA] text-[#6C7078]'
                  : step === 4 && !error
                  ? 'bg-[#2B63F1] text-white'
                  : step > 4
                  ? 'bg-[#4AB44A] text-white'
                  : step === 4 && error
                  ? 'bg-[#D83F5A] text-white'
                  : ''
              "
            >
              <span v-if="step <= 4">4</span>
              <CheckIcon v-else />
            </span>
            <a
              :class="
                !recipientsList.length
                  ? 'text-[#A6AAB2]'
                  : step === 4 && !error
                  ? 'text-black'
                  : step > 4
                  ? 'text-[#4AB44A] font-medium'
                  : step === 4 && error
                  ? 'text-[#D83F5A]'
                  : ''
              "
              >Run airdrop</a
            >
            <span
              v-if="step === 4"
              class="ml-[12px]"
              :class="!error ? 'text-[#8B909A]' : 'text-[#D83F5A]'"
              >128 / {{ recipientsList.length }}</span
            >
          </div>

          <div v-if="step > 4" class="flex items-center space-x-[6px]">
            <span class="text-[#2B63F1]">{{
              $filters.addressFormat(transactionId.distributeContractId)
            }}</span>
            <span @click="copy(transactionId.distributeContractId)" class="cursor-pointer">
              <CopyIcon />
            </span>
          </div>
        </li>

        <!-- Step 5 -->
        <li class="flex items-center" :class="{ 'justify-between': step > 5 }">
          <div class="flex items-center">
            <span
              class="list-number"
              :class="
                !recipientsList.length || step === 1 || step === 2 || step === 3 || step === 4
                  ? 'bg-[#E4E5EA] text-[#6C7078]'
                  : step === 5
                  ? 'bg-[#2B63F1] text-white'
                  : step > 5
                  ? 'bg-[#4AB44A] text-white'
                  : ''
              "
            >
              <span v-if="step <= 5">5</span>
              <CheckIcon v-else />
            </span>
            <a
              :class="
                !recipientsList.length
                  ? 'text-[#A6AAB2]'
                  : step === 5
                  ? 'text-black'
                  : step > 5
                  ? 'text-[#4AB44A] font-medium'
                  : ''
              "
              >Redeem unused funds</a
            >
          </div>

          <div v-if="step > 5" class="flex items-center space-x-[6px]">
            <span class="text-[#2B63F1]">{{
              $filters.addressFormat(transactionId.redeemContractId)
            }}</span>
            <span @click="copy(transactionId.redeemContractId)" class="cursor-pointer">
              <CopyIcon />
            </span>
          </div>
        </li>
      </ul>

      <!-- Step 1 -->
      <button
        v-if="step === 1"
        @click="onTopUpEver"
        type="button"
        class="aside-btn"
        :class="[
          !recipientsList.length ? 'bg-[#DAE4FD]' : 'bg-[#2B63F1]',
          { 'is-loading': loading },
        ]"
        :disabled="!recipientsList.length"
      >
        Top-up 1 EVER
      </button>

      <!-- Step 2 -->
      <template v-if="step === 2">
        <div class="message text-[#7E5E01] bg-[#FEF2CD]">
          <p>The form will not be edited after deployment.</p>
        </div>

        <button
          @click="onDeployContract"
          type="button"
          class="aside-btn bg-[#2B63F1] text-white mt-[8px]"
          :class="{ 'is-loading': loading }"
        >
          Deploy contract
        </button>
      </template>

      <!-- Step 3 -->
      <button
        v-if="step === 3"
        @click="onTopUpToken"
        type="button"
        class="aside-btn bg-[#2B63F1] text-white mt-[24px]"
        :class="{ 'is-loading': loading }"
      >
        Top-up {{ totalTokens }} {{ tokenName }}
      </button>

      <!-- Step 4 -->
      <template v-if="step === 4">
        <button
          @click="onResumeAirdrop"
          type="button"
          class="aside-btn bg-[#2B63F1] text-white mt-[24px]"
          :class="{ 'is-loading': loading }"
        >
          {{ !error ? 'Run airdrop' : 'Resume airdrop' }}
        </button>
      </template>

      <!-- Step 5 -->
      <button
        v-if="step === 5"
        @click="onRedeemFunds"
        type="button"
        class="aside-btn bg-[#2B63F1] text-white mt-[24px]"
        :class="{ 'is-loading': loading }"
      >
        Redeem funds
      </button>

      <div v-if="errors.error" class="message bg-[#F7D7DD] text-[#762331]">
        <p>{{ errors.message }}</p>
      </div>

      <ShareAirdrop
        v-if="step === 5 || step === 6"
        :shareNetwork="{
          airdropName: props.shareNetwork.airdropName,
          totalAmount: totalTokens,
          totalAddresses: recipientsList.length,
          contractAddress: airdropStore.address,
          tokenName: tokenName,
        }"
      />
    </main>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAirdropStore } from '@/stores/airdrop';
import { useClipboard } from '@vueuse/core';
import dayjs from 'dayjs';
import { validateAddressAmountList } from '@/utils';
import InfoIcon from '@/components/icons/IconInfo.vue';
import CopyIcon from '@/components/icons/IconCopy.vue';
import CheckIcon from '@/components/icons/IconCheck.vue';
import ShareAirdrop from '@/components/CreateAirdrop/ShareAirdrop.vue';

const props = defineProps({
  items: {
    type: Array,
  },
  tokenName: {
    type: String,
  },
  shareNetwork: {
    type: Object,
    required: true,
  },
});

const airdropStore = useAirdropStore();
const { copy } = useClipboard();
const step = ref(1);
const loading = ref(false);
const error = ref(false);
const errors = ref({
  error: false,
  message: null,
});
const transactionId = ref({
  giverContractId: null,
  deployContractId: null,
  amountContractId: null,
  distributeContractId: null,
  redeemContractId: null,
});

const recipientsList = computed(() => {
  return props.items.filter((item) => item.address && item.amount);
});
const totalTokens = computed(() => {
  return recipientsList.value.reduce((accumulator, object) => {
    return accumulator + Number(object.amount);
  }, 0);
});

airdropStore.getExpectedAddress();

async function onTopUpEver() {
  if (!validateAddressAmountList(props.items, totalTokens.value)) return;
  loading.value = true;

  try {
    errors.value.error = false;
    const data = await airdropStore.getGiverContract();
    transactionId.value.giverContractId = data.id.hash;
    step.value = 2;
  } catch (e) {
    console.log('e: ', e);
    errors.value.error = true;
    errors.value.message = e.message;
  } finally {
    loading.value = false;
  }
}
async function onDeployContract() {
  if (!validateAddressAmountList(props.items, totalTokens.value)) return;
  loading.value = true;

  try {
    errors.value.error = false;
    const data = await airdropStore.deployContract(recipientsList.value);
    transactionId.value.deployContractId = data.transaction.id.hash;
    step.value = 3;
  } catch (e) {
    errors.value.error = true;
    errors.value.message = e.message;
  } finally {
    loading.value = false;
  }
}
async function onTopUpToken() {
  loading.value = true;

  try {
    errors.value.error = false;
    const data = await airdropStore.topUp();
    transactionId.value.amountContractId = data.id.hash;
    step.value = 4;
  } catch (e) {
    console.log('onTopUpToken e:', e);
    errors.value.error = true;
    errors.value.message = e.message;
  } finally {
    loading.value = false;
  }
}
async function onResumeAirdrop() {
  loading.value = true;

  try {
    errors.value.error = false;
    error.value = false;
    const data = await airdropStore.distribute();
    transactionId.value.distributeContractId = data.id.hash;
    step.value = 5;
  } catch (e) {
    console.log('onResumeAirdrop e:', e);
    errors.value.error = true;
    error.value = true;
    errors.value.message = e.message;
  } finally {
    loading.value = false;
    // error.value = true;
  }
}
async function onRedeemFunds() {
  loading.value = true;

  try {
    errors.value.error = false;
    const data = await airdropStore.redeemFunds();
    transactionId.value.redeemContractId = data.id.hash;
    // error.value = true;
    step.value = 6;
  } catch (e) {
    console.log('onRedeemFunds e:', e);
    errors.value.error = true;
    errors.value.message = e.message;
  } finally {
    loading.value = false;
    // error.value = true;
  }
}
</script>
