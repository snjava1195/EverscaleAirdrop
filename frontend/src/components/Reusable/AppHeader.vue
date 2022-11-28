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
      <button
      @click="onChange()"
      class="py-[8px] px-[12px] bg-[#ECF1FE] hover:bg-blue-100 ml-[16px]"
      href="javascript:void(0)"
      >
      <!--<SwitchIcon />-->
     <img class="option__image pr-1 w-4 h-4" src="/avatar/7f56a5f7df1ce514936b6ae80a3f873d.svg"/>
      </button>
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

function onChange()
{
  walletStore.logout();
  walletStore.login();
}
</script>
