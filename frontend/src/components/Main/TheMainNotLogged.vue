<template>
  <main class="flex-1 px-[20px]">
    <header class="flex flex-col items-center mt-[64px] md:mt-[96px]">
      <h1 class="main-title mb-[24px] md:mb-[36px] font-semibold">
        The simplest way<br class="lg:hidden" />
        to airdrop tokens
      </h1>
      <h2 class="subtitle">
        Connect your wallet to create<br class="sm:hidden" />
        EVERs<br class="hidden sm:block lg:hidden" />
        and tokens airdrop
      </h2>

      <button @click="onLogin()" class="bg-[#2B63F1] text-white w-[178px] h-[56px] font-pt_root">
        Connect wallet
      </button>
    </header>

    <main
      class="w-full xl:max-w-[1160px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[20px] mt-[80px] mb-[100px] lg:mb-[336px]"
    >
      <WelcomeMainItem>
        <template #icon>
          <DistributionIcon />
        </template>
        <template #heading>
          Distribution of EVER<br class="hidden sm:block md:hidden lg:block xl:hidden" />
          and<br class="block sm:hidden md:block lg:hidden xl:block" />
          any TIP-3.1<br class="hidden sm:block md:hidden" />
          tokens
        </template>
      </WelcomeMainItem>

      <WelcomeMainItem>
        <template #icon>
          <ResumeIcon />
        </template>
        <template #heading>
          Resume in case of<br class="sm:block" />
          interruption
        </template>
      </WelcomeMainItem>

      <WelcomeMainItem>
        <template #icon>
          <RedeemFundsIcon />
        </template>
        <template #heading>
          Redeem unused<br class="sm:block md:hidden" />
          funds
        </template>
      </WelcomeMainItem>

      <WelcomeMainItem>
        <template #icon>
          <SendMultipleAmountsIcon />
        </template>
        <template #heading>
          Send multiple<br class="hidden sm:block md:hidden" />
          amounts to<br class="hidden md:block" />
          same addresses
        </template>
      </WelcomeMainItem>
    </main>
  </main>
</template>

<script setup>
import { useWalletStore } from '@/stores/wallet';
import WelcomeMainItem from '@/components/Main/WelcomeMainItem.vue';
import DistributionIcon from '@/components/icons/IconDistribution.vue';
import ResumeIcon from '@/components/icons/IconResume.vue';
import RedeemFundsIcon from '@/components/icons/IconRedeemFunds.vue';
import SendMultipleAmountsIcon from '@/components/icons/IconSendMultipleAmounts.vue';

const walletStore = useWalletStore();

function onLogin() {
  walletStore.login();
}
</script>
