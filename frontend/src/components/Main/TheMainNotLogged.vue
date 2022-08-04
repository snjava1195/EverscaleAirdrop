<template>
  <header class="main-header">
    <h1 class="title-welcome">The simplest way to airdrop tokens</h1>

    <p class="subtitle">Connect your wallet to create EVERs and tokens airdrop</p>

    <button @click="onLogin()" class="main-header-btn">Connect wallet</button>
  </header>

  <div class="main-content-welcome">
    <WelcomeMainItem>
      <template #icon>
        <CircleIcon />
      </template>
      <template #heading
        >Distribution of EVER and any<br />
        TIP-3.1 tokens</template
      >
    </WelcomeMainItem>

    <WelcomeMainItem>
      <template #icon>
        <CircleIcon />
      </template>
      <template #heading
        >Resume in case of<br />
        interruption</template
      >
    </WelcomeMainItem>

    <WelcomeMainItem>
      <template #icon>
        <CircleIcon />
      </template>
      <template #heading>Redeem unused funds</template>
    </WelcomeMainItem>

    <WelcomeMainItem>
      <template #icon>
        <CircleIcon />
      </template>
      <template #heading
        >Send multiple amounts to<br />
        same addresses</template
      >
    </WelcomeMainItem>
  </div>
</template>

<script setup>
import { useWalletStore } from '@/stores/wallet';
import WelcomeMainItem from '@/components/Main/WelcomeMainItem.vue';
import CircleIcon from '@/components/icons/IconCircle.vue';

const walletStore = useWalletStore();

function onLogin() {
  walletStore.login();
}
</script>
