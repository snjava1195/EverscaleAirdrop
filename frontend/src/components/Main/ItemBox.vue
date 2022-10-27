<template>
  <div class="table w-full">
    <!--Mobile-->
    <div
      class="mobTable lg:hidden w-full border border-[#E4E5EA] px-[12px] divide-y divide-[#E4E5EA] mt-[16px] mb-[310px] font-pt_root"
    >
      <div v-for="(item, i) in transactions" :key="i" class="space-y-[8px] py-[16px] cursor-pointer">
        <router-link :to="'/edit-airdrop/' + item.address" custom v-slot="{ navigate }">

        <div class="flex items-center justify-between" @click="navigate">
          <h3>{{item.airdropName}}</h3>

          <span class="px-[8px] py-[4px] bg-[#DEF1DE] text-[#398A39] rounded-full text-[12px]">
            {{item.status}}
          </span>
        </div>
        </router-link>
        <div class="flex items-center space-x-[8px]">
          <EverIcon />
          <h2>{{ item.amount }} {{item.tokenLabel}}</h2>
        </div>

        <div class="flex items-center justify-between">
          <p class="text-[14px] text-[#A6AAB2]">Receipents number</p>
          <p>{{ item.recipientsNumber }}</p>
        </div>

        <div class="flex items-start justify-between">
          <p class="text-[14px] text-[#A6AAB2]">Date</p>
          <div class="text-right">
            <p class="text-[14px]">{{ creationTime(item.dateCreated) }}</p>
            <p class="text-[12px] text-[#6C7078]">{{item.statusCreated}}</p>
          </div>
        </div>
      </div>
    </div>

    <!--Desktop-->
    <table
      class="desktopTable w-full mx-auto hidden lg:block border border-[#E4E5EA] text-[14px] mt-[17px] lg:mb-[100px] xl:mb-0 font-pt_root"
    >
      <thead>
        <ItemBoxHeading />
      </thead>

      <tbody>
        <tr v-for="(item, i) in transactions" :key="i" class="cursor-pointer">
          <router-link :to="'/edit-airdrop/' + item.address" custom v-slot="{ navigate }">

          <td class="h-[58px] pl-[12px] border-[#E4E5EA] border-t" @click="navigate">
            <p>{{ item.airdropName }}
              
            </p>
            <div>
              
              <span
                class="py-[4px] px-[8px] rounded-full text-[12px] font-medium ml-[6px]"
                :class="{ 'bg-[#DAE4FD]': item.status=='Deployed', 'text-[#214BB7]': item.status == 'Deployed',
                          'bg-[#DEF1DE]': item.status=='Executed', 'text-[#398A39]': item.status == 'Executed',
                          'bg-[#FEF2CD]': item.status=='Executing', 'text-[#B28501]': item.status == 'Executing',
                          'bg-[#E4E5EA]': item.status=='Preparing', 'text-[#6C7078]': item.status == 'Preparing',
                          'bg-[#DEF1DE]': item.status=='Redeemed', 'text-[#398A39]': item.status == 'Redeemed',


              }"
                
                >{{item.status}}</span
              >
            </div>
          </td>
        </router-link>
          <td class="h-[58px] pl-[12px] border-[#E4E5EA] border-t flex items-center">
            <span class="mr-[6px]">
              <img :src="item.tokenIcon" width="20" height="20"/>
              <!--<EverIcon />-->
            </span>
            {{ item.amount }} {{item.tokenLabel}}
          </td>
          
          <td class="h-[58px] pl-[20px] border-[#E4E5EA] border-t text-right pr-[12px]" >
            
              
            {{ item.recipientsNumber }}
          
          </td>
      
          <td class="h-[58px] pr-[12px] border-[#E4E5EA] border-t text-right">
            <p>{{ creationTime(item.dateCreated) }}</p>
            <p class="text-[#6C7078] text-[12px]">{{item.statusCreated}}</p>
          </td>
          
          
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import dayjs from 'dayjs';
import { useWalletStore } from '@/stores/wallet';
import { useAirdropStore } from '@/stores/airdrop';
import { toNano } from '@/utils';
import EverIcon from '@/components/icons/IconEver.vue';
import ItemBoxHeading from '@/components/Main/ItemBoxHeading.vue';

const walletStore = useWalletStore();
const airdropStore = useAirdropStore();
const transactions = computed(() => {
  return airdropStore.airdropData;
});

function everDivider(item) {
  return item.outMessages.length ? Number(item.outMessages[0].value) / toNano(1, 9) : 0;
}




function creationTime(date)
{
  //let date = walletStore.profile.creationTimes[i];
  console.log(date);
  //if(date==null)
  return dayjs.unix(date).format('DD MMM YYYY');
}


</script>
