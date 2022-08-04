<template>
  <tbody>
    <tr>
      <td colspan="4" class="p-10">
        <div class="table-content">
          <h3 class="text-[18px] font-semibold">It seems you haven’t made any airdrop yet</h3>

          <p class="mt-[12px] mb-[24px]">Create your first airdrop or add existing one.</p>

          <div class="flex justify-between font-pt_root">
            <router-link to="/create-airdrop" custom v-slot="{ navigate }">
              <button
                @click="navigate"
                @keypress.enter="navigate"
                role="link"
                class="py-[12px] px-[38px] text-white bg-[#2B63F1]"
              >
                Create airdrop
              </button>
            </router-link>
            <button class="py-[12px] px-[16px] text-[#2B63F1] bg-[#ECF1FE]">
              Add existing airdrop
            </button>
          </div>
        </div>
      </td>
    </tr>
  </tbody>
</template>
