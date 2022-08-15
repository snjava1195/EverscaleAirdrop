<template>
  <tr>
    <td class="tbody-cell w-[579px]">
      <div class="flex items-center space-x-[8px]">
        <span>Some unique name</span>
        <span class="status bg-[#E4E5EA] text-[#6C7078]"> Preparing </span>
      </div>
    </td>
    <td class="tbody-cell">
      <div class="flex items-center space-x-[8px]">
        <span>
          <EverIcon />
        </span>
        <span> {{ everDivider }} EVER </span>
      </div>
    </td>
    <td class="tbody-cell pr-[12px] text-right">{{ item.id.lt }}</td>
    <td class="tbody-cell pr-[12px] text-right">
      <p>{{ createdAt }}</p>
      <p class="text-[12px]">Created</p>
    </td>
  </tr>
</template>

<script setup>
import { computed } from 'vue';
import dayjs from 'dayjs';
import { toNano } from '@/utils';
import EverIcon from '@/components/icons/IconEver.vue';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const createdAt = computed(() => {
  let date = props.item.createdAt;
  return dayjs.unix(date).format('DD MMM YYYY');
});

const everDivider = computed(() => {
  return props.item.outMessages.length ? props.item.outMessages[0].value / toNano(1) : 0;
});
</script>
