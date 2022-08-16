<template>
  <div class="table w-full">
    <!--Mobile-->
    <div
      class="mobTable lg:hidden w-full border border-[#E4E5EA] p-[12px] space-y-[8px] mt-[16px] mb-[57px]"
    >
      <div v-for="n in 5" :key="n" :class="{ 'border-[#E4E5EA] border-b': n !== 5 }">
        <div class="w-[96px] tableGradient mb-[16px]"></div>

        <div class="flex space-x-[63px] mb-[8px]">
          <div class="w-full tableGradient"></div>
          <div class="w-full tableReverseGradient"></div>
        </div>
        <div class="flex space-x-[63px] mb-[16px]">
          <div class="w-full tableGradient"></div>
          <div class="w-full tableReverseGradient"></div>
        </div>
      </div>
    </div>

    <!--Desktop-->
    <table
      class="desktopTable w-full mx-auto hidden lg:block border border-[#E4E5EA] text-[14px] mt-[17px] mb-[100px] font-pt_root"
    >
      <thead>
        <ItemBoxHeading />
      </thead>

      <tbody>
        <tr v-for="n in 10" :key="n">
          <td class="h-[58px] pl-[12px] border-[#E4E5EA] border-t">
            <div class="w-[96px] tableGradient"></div>
          </td>
          <td class="h-[58px] pl-[12px] border-[#E4E5EA] border-t">
            <div class="w-[96px] tableGradient"></div>
          </td>
          <td class="h-[58px] pl-[20px] border-[#E4E5EA] border-t">
            <div class="w-[96px] tableGradient"></div>
          </td>
          <td class="h-[58px] pr-[12px] flex justify-end items-center border-[#E4E5EA] border-t">
            <div class="w-[96px] tableGradient"></div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup>
import ItemBoxHeading from '@/components/Main/ItemBoxHeading.vue';
</script>
