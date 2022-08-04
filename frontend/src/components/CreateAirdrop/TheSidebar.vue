<template>
  <aside class="w-[312px] text-[14px] font-pt_root">
    <header class="space-y-[8px] border-b border-[#EAEBF0] pb-[24px] mb-[24px]">
      <div class="flex justify-between">
        <div class="flex items-end space-x-[6px]">
          <span> Smart contract address </span>
          <span>
            <InfoIcon title="Lorem  Ipsum, Lorem Ipsum" />
          </span>
        </div>

        <div class="flex items-center space-x-[10px]">
          <a class="text-[#2B63F1]">{{ $filters.addressFormat(walletStore.profile.address) }}</a>

          <span @click="copy(walletStore.profile.address)" class="cursor-pointer">
            <CopyIcon />
          </span>
        </div>
      </div>

      <div class="flex justify-between">
        <span>Recipients number</span>
        <span>{{ recipientsList.length }}</span>
      </div>

      <div class="flex justify-between">
        <span>Estimated gas fee</span>
        <span>0 EVER</span>
      </div>

      <div class="flex justify-between items-center font-bold text-black">
        <span>Total tokens</span>
        <span
          ><span class="text-[20px]">{{ totalTokens }}</span> {{ tokenName }}</span
        >
      </div>
    </header>

    <main>
      <form>
        <ul class="space-y-[16px]">
          <!-- Step 1 -->
          <li class="flex items-center" :class="{ 'justify-between': step > 1 }">
            <div class="flex items-center">
              <span
                class="w-[20px] h-[20px] rounded-full flex justify-center items-center mr-[20px]"
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
                >Top-up 20 EVER</a
              >
            </div>

            <a v-if="step > 1" class="flex items-center">
              <span class="text-[#2B63F1] mr-[6px]">{{
                $filters.addressFormat(walletStore.profile.address)
              }}</span>

              <span @click="copy(walletStore.profile.address)" class="cursor-pointer">
                <CopyIcon />
              </span>
            </a>
          </li>
          <!-- Step 2 -->
          <li class="flex items-center" :class="{ 'justify-between': step > 2 }">
            <div class="flex items-center">
              <span
                class="w-[20px] h-[20px] rounded-full flex justify-center items-center mr-[20px]"
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

            <a v-if="step > 2" class="flex items-center">
              <span class="text-[#2B63F1] mr-[6px]">{{
                $filters.addressFormat(walletStore.profile.address)
              }}</span>

              <span @click="copy(walletStore.profile.address)" class="cursor-pointer">
                <CopyIcon />
              </span>
            </a>
          </li>
          <!-- Step 3 -->
          <li class="flex items-center" :class="{ 'justify-between': step > 3 }">
            <div class="flex items-center">
              <span
                class="w-[20px] h-[20px] rounded-full flex justify-center items-center mr-[20px]"
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
                >Top-up {{ totalTokens }} {{ tokenName }}</a
              >
            </div>

            <a v-if="step > 3" class="flex items-center">
              <span class="text-[#2B63F1] mr-[6px]">{{
                $filters.addressFormat(walletStore.profile.address)
              }}</span>

              <span @click="copy(walletStore.profile.address)" class="cursor-pointer">
                <CopyIcon />
              </span>
            </a>
          </li>
          <!-- Step 4 -->
          <li class="flex items-center" :class="{ 'justify-between': step > 4 }">
            <div class="flex items-center">
              <span
                class="w-[20px] h-[20px] rounded-full flex justify-center items-center mr-[20px]"
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
                class="ml-5"
                :class="!error ? 'text-[#8B909A]' : 'text-[#D83F5A]'"
                >128 / 200</span
              >
            </div>

            <a v-if="step > 4" class="flex items-center">
              <span class="text-[#2B63F1] mr-[6px]">{{
                $filters.addressFormat(walletStore.profile.address)
              }}</span>

              <span @click="copy(walletStore.profile.address)" class="cursor-pointer">
                <CopyIcon />
              </span>
            </a>
          </li>
          <!-- Step 5 -->
          <li class="flex items-center" :class="{ 'justify-between': step > 5 }">
            <div class="flex items-center">
              <span
                class="w-[20px] h-[20px] rounded-full flex justify-center items-center mr-[20px]"
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

            <a v-if="step > 5" class="flex items-center">
              <span class="text-[#2B63F1] mr-[6px]">{{
                $filters.addressFormat(walletStore.profile.address)
              }}</span>

              <span @click="copy(walletStore.profile.address)" class="cursor-pointer">
                <CopyIcon />
              </span>
            </a>
          </li>
        </ul>

        <!-- Step 1 -->
        <button
          v-if="step === 1"
          @click="onTopUpEver"
          type="button"
          class="w-full h-[46px] text-white text-base font-medium flex justify-center items-center mt-[24px]"
          :class="!recipientsList.length ? 'bg-[#DAE4FD]' : 'bg-[#2B63F1]'"
          :disabled="!recipientsList.length"
        >
          Top-up {{ gasFee }} EVER
        </button>
        <!-- Step 2 -->
        <template v-if="step === 2">
          <div
            class="message py-[12px] pl-[16px] pr-[12px] bg-[#FEF2CD] text-[#7E5E01] text-[12px] border-l-4 border-[#E6AC00] mt-[25px] mb-[8px]"
          >
            <p>The form will not be edited after deployment.</p>
          </div>

          <button
            @click="onDeployContract"
            type="button"
            class="w-full h-[46px] text-white text-base font-medium bg-[#2B63F1] flex justify-center items-center"
          >
            Deploy contract
          </button>
        </template>
        <!-- Step 3 -->
        <button
          v-if="step === 3 || (step === 4 && loading)"
          @click="onTopUpToken"
          type="button"
          class="w-full h-[46px] text-white text-base font-medium bg-[#2B63F1] flex justify-center items-center mt-[24px] relative"
          :class="{ 'is-loading': loading }"
        >
          Top-up {{ totalTokens }} {{ tokenName }}
        </button>
        <!-- Step 4 -->
        <template v-if="step === 4 && error">
          <div
            class="message py-[12px] pl-[16px] pr-[12px] bg-[#F7D7DD] text-[#762331] text-[12px] border-l-4 border-[#EB4361] mt-[25px] mb-[8px]"
          >
            <p>The airdrop hasn't completed. Error: ${someError}</p>
          </div>

          <button
            @click="onResumeAirdrop"
            class="w-full h-[46px] text-white text-base font-medium bg-[#2B63F1] flex justify-center items-center"
          >
            Resume airdrop
          </button>
        </template>
        <!-- Step 5 -->
        <button
          v-if="step === 5"
          @click="onRedeemFunds"
          class="w-full h-[46px] text-white text-base font-medium bg-[#2B63F1] flex justify-center items-center mt-[24px]"
        >
          Redeem funds
        </button>

        <ShareAirdrop v-if="step === 5 || step === 6" />
      </form>
    </main>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useWalletStore } from '@/stores/wallet';
import { useClipboard } from '@vueuse/core';
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
});

const walletStore = useWalletStore();
const { copy } = useClipboard();
const gasFee = ref(null);
const step = ref(1);
const loading = ref(false);
const error = ref(false);

const recipientsList = computed(() => {
  return props.items.filter((item) => item.address && item.amount);
});
const totalTokens = computed(() => {
  return recipientsList.value.reduce((accumulator, object) => {
    return accumulator + Number(object.amount);
  }, 0);
});

async function onTopUpEver() {
  console.log('onTopUpEver');
  step.value = 2;
}
async function onDeployContract() {
  console.log('onDeployContract');
  step.value = 3;
}
async function onTopUpToken() {
  step.value = 4;
  console.log('onTopUpToken');
  loading.value = true;
  const validation = true;
  if (!validation) return;
  setTimeout(() => {
    console.log('setTimeout');
    loading.value = false;
    error.value = true;
  }, 3000);
}
async function onResumeAirdrop() {
  console.log('onResumeAirdrop');
  step.value = 5;
}
async function onRedeemFunds() {
  console.log('onRedeemFunds');
  step.value = 6;
}
</script>
