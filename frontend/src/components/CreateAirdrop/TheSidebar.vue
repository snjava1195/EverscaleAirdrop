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
          <a class="text-[#2B63F1]" target="_blank" :href="`https://everscan.io/accounts/${airdropStore.address}`">{{ $filters.addressFormat(airdropStore.address) }}</a>

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
        <span>{{ airdropStore.fees }} EVER</span>
      </div>

      <div class="flex justify-between items-center font-bold text-black">
        <span>Total tokens</span>
        <span
          ><span class="text-[20px]">{{ totalTokens }}</span> {{ token ? token.label : 'EVER' }}</span
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
              >Top up {{(token == null || token.label == 'EVER') ? topUpValue+0.5 + " EVER" : topUpValue+1.5 +" "+ " EVER"}}</a
            >
          </div>

          <div v-if="step > 1" class="flex items-center space-x-[6px]">
            <a class="text-[#2B63F1]" target="_blank" :href="`https://everscan.io/transactions/${transactionId.giverContractId}`">{{
              $filters.addressFormat(transactionId.giverContractId)
            }}</a>
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
            <a class="text-[#2B63F1]" target="_blank" :href="`https://everscan.io/transactions/${transactionId.deployContractId}`">{{
              $filters.addressFormat(transactionId.deployContractId)
            }}</a>

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
              >Top-up {{ totalTokens }} {{ token ? token.label : 'EVER' }}</a
            >
          </div>

          <div v-if="step > 3" class="flex items-center space-x-[6px]">
            <!-- <a class="text-[#2B63F1]" :href="`https://everscan.io/transactions/${transactionId.amountContractId}`">{{ -->
              <!-- $filters.addressFormat(transactionId.amountContractId) -->
            <!-- }}</a> -->
            <a class="text-[#2B63F1]" target="_blank" :href="`https://everscan.io/transactions/${transactionId.amountContractId}`">{{
               $filters.addressFormat(transactionId.amountContractId) 
             }}</a> 
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
          </div>

          <div v-if="step > 4" class="flex items-center space-x-[6px]">
            <a class="text-[#2B63F1]" target="_blank" :href="`https://everscan.io/transactions/${transactionId.distributeContractId}`">{{
              $filters.addressFormat(transactionId.distributeContractId)
            }}</a>
            <span @click="copy(transactionId.distributeContractId)" class="cursor-pointer">
              <CopyIcon />
            </span>
          </div>
        </li>
        <span
          v-if="step === 4"
          class="ml-[32px]"
          :class="!error ? 'text-[#8B909A]' : 'text-[#D83F5A]'"
          >Batches: {{ currentBatch }} / {{ maxBatches }}</span
        >

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
            <a class="text-[#2B63F1]" target="_blank" :href="`https://everscan.io/transactions/${transactionId.redeemContractId}`">{{
              $filters.addressFormat(transactionId.redeemContractId)
            }}</a>
            <span @click="copy(transactionId.redeemContractId)" class="cursor-pointer">
              <CopyIcon />
            </span>
          </div>
        </li>
        <a
          v-if="!redeemExpired"
          class="ml-8 text-sm"
          :class="
            !recipientsList.length
              ? 'text-[#A6AAB2]'
              : step === 5
              ? 'text-black'
              : step > 5
              ? 'text-[#4AB44A] font-medium'
              : ''
          "
          >Available {{ reedemText }}</a
        >
      </ul>

      <!-- Step 1 -->
      <button
        v-if="step === 1"
        @click="onTopUpEver"
        type="button"
        class="aside-btn"
        :class="[
          !recipientsList.length ? 'bg-[#DAE4FD]' : 'bg-[#2B63F1] hover:bg-blue-700',
          { 'is-loading': loading },
        ]"
        :disabled="!recipientsList.length"
      >
      Top up {{((token == null  || !recipientsList)|| token.label == 'EVER') ? topUpValue+0.5 + " EVER" : topUpValue+1.5 +" "+ " EVER"}}
      </button>

      <!-- Step 2 -->
      <template v-if="step === 2">
        <div class="message text-[#7E5E01] bg-[#FEF2CD]">
          <p>The form will not be edited after deployment.</p>
        </div>

        <button
          @click="onDeployContract"
          type="button"
          class="aside-btn bg-[#2B63F1] text-white mt-[8px] hover:bg-blue-700"
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
        class="aside-btn bg-[#2B63F1] text-white mt-[24px] hover:bg-blue-700"
        :class="{ 'is-loading': loading }"
      >
        Top-up {{ totalTokens }} {{ token ? token.label : 'EVER' }}
      </button>

      <!-- Step 4 -->
      <template v-if="step === 4">
        <button
          v-if="!error"
          @click="onResumeAirdrop(false)"
          type="button"
          class="aside-btn bg-[#2B63F1] text-white mt-[24px] hover:bg-blue-700"
          :class="{ 'is-loading': loading }"
        >
          Run airdrop
        </button>
        <button
          v-else
          @click="onResumeAirdrop(true)"
          type="button"
          class="aside-btn bg-[#2B63F1] text-white mt-[24px] hover:bg-blue-700"
          :class="{ 'is-loading': loading }"
        >
          Resume airdrop
        </button>
      </template>

      <!-- Step 5 -->
      <button
        v-if="step === 5"
        @click="onRedeemFunds"
        type="button"
        class="aside-btn bg-[#2B63F1] text-white mt-[24px]"
        :class="{ 'is-loading': loading, 'bg-[#DAE4FD] hover:bg-blue-700': !redeemExpired }"
        :disabled="!redeemExpired"
      >
        Redeem funds
      </button>

      <div v-if="errors.error" class="message bg-[#F7D7DD] text-[#762331]">
        <p>{{ errors.message }}</p>
      </div>

      <ShareAirdrop
        v-if="step === 5 || step === 6"
        :shareNetwork="{
          airdropName: airdropName,
          totalAmount: totalTokens,
          totalAddresses: recipientsList.length,
          contractAddress: airdropStore.address,
          tokenName: token.label,
        }"
      />
    </main>
  </aside>
</template>

<script setup>
import { ref, computed, onUnmounted, watch } from 'vue';
import { onBeforeRouteLeave } from 'vue-router'
import { useAirdropStore } from '@/stores/airdrop';
import { useWalletStore } from '@/stores/wallet';
import { useClipboard } from '@vueuse/core';
import dayjs from 'dayjs';
import { validateAddressAmountList, validateLockDuration, fromNano } from '@/utils';
import InfoIcon from '@/components/icons/IconInfo.vue';
import CopyIcon from '@/components/icons/IconCopy.vue';
import CheckIcon from '@/components/icons/IconCheck.vue';
import ShareAirdrop from '@/components/CreateAirdrop/ShareAirdrop.vue';
import relativeTime from 'dayjs/plugin/relativeTime';
import { getSeconds } from '@/utils';
import { ProviderRpcClient, Address } from 'everscale-inpage-provider';
dayjs.extend(relativeTime);

const props = defineProps({
  items: {
    type: Array,
  },
  token: {
    type: Object,
  },
  shareNetwork: {
    type: Object,
    required: true,
  },
});

// same as beforeRouteLeave option with no access to `this`
onBeforeRouteLeave((to, from) => {
  if (step.value < 3) {
    const answer = window.confirm(
      'Do you really want to leave? Airdrop contract will not be saved!'
    )
    // cancel the navigation and stay on the same page
    if (!answer) return false
  }
});

onUnmounted(() => clearInterval(redeemPolling.value));
//calculateInitialFees();
const airdropStore = useAirdropStore();

const walletStore = useWalletStore();
const { copy } = useClipboard();
//const step = ref(1);
const loading = ref(false);
const error = ref(false);
const errors = ref({
  error: false,
  message: null,
});
/*const transactionId = ref({
  giverContractId: null,
  deployContractId: null,
  amountContractId: null,
  distributeContractId: null,
  redeemContractId: null,
});*/
const redeemPolling = ref(null);
const reedemText = ref('');
const redeemRemainingSeconds = ref(null);
const airdropName = ref(null);

const step = computed(() => {
  return airdropStore.step;
});

const recipientsList = computed(() => {
  return props.items.filter((item) => item.address && item.amount);
});

const totalTokens = computed(() => {
  //if(recipientsList.value.)
  const totalRecipientsTokens = recipientsList.value.reduce((accumulator, object) => {
    return accumulator + Number(object.amount);
  }, 0);
//  console.log('TotalRecipientsTokens: ', totalRecipientsTokens);
  return totalRecipientsTokens>0.01 ? Number(Math.round(totalRecipientsTokens+'e2')+'e-2') : totalRecipientsTokens;//.toFixed(totalRecipientsTokens.toString().split('-')[1]);
});
const topUpValue = computed(() => {
  
  let loopCount = Math.floor(recipientsList.value.length / 99);
        if (recipientsList.value.length % 99 !== 0) {
          loopCount++;
        }
        let amountForSetting=0;
        
          if(recipientsList.value.length==1)
          {
            amountForSetting = 0.02;
            //console.log('Usao u jednog');
          }
          else 
          {
            amountForSetting = 0.02+((recipientsList.value.length*0.006)*2);
            //console.log('Usao u 99');
          }
          
        
        return recipientsList.value.length !=0 ? amountForSetting : 0;
});

const ever = new ProviderRpcClient();
const topUpRequiredAmount = computed(() => {
  calculateInitialFees();
  const tempTopUpRequiredAmount = recipientsList.value.length > 0 ? recipientsList.value.length + 1 : 0;
  console.log(airdropStore.topUpRequiredAmount);
  return airdropStore.topUpRequiredAmount === 0 ? tempTopUpRequiredAmount : airdropStore.topUpRequiredAmount;
})


const redeemExpired = computed(() => {
  redeemRemainingSeconds.value = getSeconds(airdropStore.lockDuration);
  if (redeemRemainingSeconds.value <= 0) {
    return true;
  }

  return false;
});
const currentBatch = computed(() => {
  return airdropStore.currentBatch;
});
const maxBatches = computed(() => {
  return airdropStore.maxBatches;
});

const transactionId = computed(() => {
  return airdropStore.transactionId;
})

watch(props.items, (newX) => {
  if(airdropStore.step<=3)
  {
    airdropStore.getRequiredAmount(totalTokens.value, recipientsList.value.length);
    console.log('Required amount: ', airdropStore.topUpRequiredAmount);
  }
})



function availableToRedeem() {
  redeemRemainingSeconds.value = getSeconds(airdropStore.lockDuration);
  if (redeemRemainingSeconds.value > 0) {
    reedemText.value = dayjs().to(airdropStore.lockDuration);
    return;
  }

  clearInterval(redeemPolling.value);
};

// airdropStore.getExpectedAddress(props.token);

async function onTopUpEver() {
 // if (!validateAddressAmountList(props.items, totalTokens.value)) return;
  loading.value = true;

  try {
    errors.value.error = false;
    const data = await airdropStore.getGiverContract2(props.token.label, recipientsList.value.length);
    console.log('Data id: ', data.id.hash);
    airdropStore.transactionId.giverContractId = data.id.hash;
    
    airdropStore.step = 2;
  } catch (e) {
    console.log('e: ', e);
    errors.value.error = true;
    errors.value.message = e.message;
  } finally {
    loading.value = false;
  }
}

async function onDeployContract() {
 // if (!validateAddressAmountList(props.items, totalTokens.value)) return;
  if (airdropStore.lockDuration==null) {
    const date = new Date(Date.now()+(3*60*1000));
    const lockDuration = date;//{ date: date, hours: new Date().getHours(), minutes: new Date().getMinutes() + 2 }
   // console.log('Date:', lockDuration);
    airdropStore.lockDuration = date;//Math.floor(lockDuration.getTime()/1000);
  //  console.log('Lock duration: ', airdropStore.lockDuration);
  }
  //console.log('Lock duration: ', airdropStore.lockDuration)
  loading.value = true;

  try {
    errors.value.error = false;
    airdropName.value = props.shareNetwork.airdropName ? props.shareNetwork.airdropName : 'Airdrop_' + Date.now();
   // console.log('airdropName:', airdropName.value);
    const data = await airdropStore.deployContract(airdropName.value, totalTokens.value, recipientsList.value.length, props.token);
   // const fees = await airdropStore.getEstimatedFee();
   airdropStore.transactionId.deployContractId = data.transaction.id.hash;
    console.log('Tr id:', airdropStore.transactionId.deployContractId);
    await airdropStore.setTransactionsHash(airdropStore.transactionId.giverContractId);
    await airdropStore.setTransactionsHash(airdropStore.transactionId.deployContractId);
    await airdropStore.setRecipients(recipientsList.value);
    await airdropStore.setAmounts(recipientsList.value);
    await airdropStore.calculateFees("topup", "giver", '', []);
    console.log('Fees calculated: ', airdropStore.fees);
    airdropStore.step = 3;
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
    //await airdropStore.calculateFees("distribute", "everAirdrop", '', recipientsList.value);
    errors.value.error = false;
    const data = await airdropStore.topUp();
    airdropStore.transactionId.amountContractId = data.id.hash;
    await airdropStore.setTransactionsHash(airdropStore.transactionId.amountContractId);
    airdropStore.step = 4;
    await airdropStore.calculateFees("distribute", "everAirdrop", props.token.label, recipientsList.value);
  } catch (e) {
    console.log('onTopUpToken e:', e);
    errors.value.error = true;
    errors.value.message = e.message;
  } finally {
    loading.value = false;
  }
}
async function onResumeAirdrop(isResumed) {
  loading.value = true;

  try {
    errors.value.error = false;
    error.value = false;
    console.log('Recipients list:', recipientsList.value);
    const data = await airdropStore.distribute(recipientsList.value, isResumed);
    airdropStore.transactionId.distributeContractId = data.id.hash;
    await airdropStore.setTransactionsHash(airdropStore.transactionId.distributeContractId);
    availableToRedeem();
    redeemPolling.value = setInterval(() => {
      console.log('interval');
      availableToRedeem();
    }, 1000);
    await airdropStore.calculateFees("redeem", "everAirdrop", '', []);
    airdropStore.step = 5;
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
    const lastTx = await ever.getTransactions({address: walletStore.profile.address, continuation: undefined, limit: 1});
    airdropStore.transactionId.redeemContractId =lastTx.transactions[0].id.hash;
    console.log('Last tx: ', lastTx);
    console.log('redeemed tx: ', airdropStore.transactionId.redeemContractId);
    await airdropStore.setTransactionsHash(airdropStore.transactionId.redeemContractId);
    const data = await airdropStore.redeemFunds();
    //transactionId.value.redeemContractId = data.id.hash;
    
    
    
  
    // error.value = true;
    airdropStore.step = 6;
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
