<template>
  <header class="header xl:py-5">
    <div class="logo font-faktum">
      <router-link to="/">
        <h2>EVER Drop</h2>
      </router-link>
    </div>

    <button v-if="!walletStore.isLogged" @click="onLogin()" class="header-btn hover:bg-blue-100">
      Connect wallet
    </button>

    <div v-if="walletStore.isLogged" class="right-menu">
      <img
        class="mr-[10px] w-6 h-6"
        :src="`/avatar/${walletStore.profile.address.substr(
          walletStore.profile.address.length - 1,
          1
        )}.svg`"
        alt="Avatar"
      />
      <ul class="leading-5">
        <li>
          <a class="text-[14px] text-black" href="javascript:void(0)">{{
            $filters.addressFormat(walletStore.profile.address)
          }}</a>
        </li>
        <li>
          <a class="text-[14px] text-[#A6AAB2]" href="javascript:void(0)"
            >{{ $filters.decimalFormat(walletStore.profile.balance, 4) }} EVER</a
          >
        </li>
      </ul>
      <!-- <button
        @click="onChange()"
        class="py-[8px] px-[12px] bg-[#ECF1FE] hover:bg-blue-100 ml-[16px]"
        href="javascript:void(0)"
      > -->
      <!--<SwitchIcon />-->
      <!-- <img class="option__image pr-1 w-4 h-4" src="/avatar/7f56a5f7df1ce514936b6ae80a3f873d.svg"/> -->

      <!-- <svg viewBox="0 0 255.82 251.08" class="swap-acc-icon">
      <path 
        d="M243.2,167.44c-11.77-.89-10.74-12.1-10.6-15.31-.29-77.95,
        9.08-80.32-48.89-79h-129L91.52,
        106.5l-15,15.11L12.82,62.67,68.3,2.88,83.1,
        17.69,51.39,52.2H211.92c23.43,0,41.9,
        16.91,41.9,40.49v64.08A10.64,
        10.64,0,0,1,243.2,167.44ZM23.32,104.57c1.57,
        79-11.89,85.86,49.28,83.84h135l-34.49-34.52,
        14.8-14.8,52.4,52.4-52.4,
        56.7-14.8-14.8,24.4-24H47.41c-2.24-.23-3.68.8-13.77-1.36C6.71,
        200.06.88,177.93,2.35,
        156.34c0-22.47,0-31.4,0-41.56C-1.17,
        86.44,23,91.37,23.32,104.57Z"
      />
    </svg>
     -->
      <!-- </button> -->
      <a
        @click="onLogout()"
        class="py-[8px] px-[12px] bg-[#ECF1FE] hover:bg-blue-100 ml-[16px]"
        href="javascript:void(0)"
      >
        <LogoutIcon />
      </a>
    </div>
  </header>
</template>

<script setup>
import { useWalletStore } from '@/stores/wallet';
import LogoutIcon from '../icons/IconLogout.vue';
import SwitchIcon from '../icons/IconSwitch.vue';
const walletStore = useWalletStore();

function onLogin() {
  walletStore.login();
  walletStore.getBalance();
}
function onLogout() {
  walletStore.logout();
}

function onChange() {
  walletStore.logout();
  walletStore.login();
}
</script>
