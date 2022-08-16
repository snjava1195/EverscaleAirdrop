<template>
  <div class="w-full flex flex-col items-center text-center">
    <div class="w-[65px] h-[65px] mb-[16px]">
      <slot name="icon"></slot>
    </div>
    <h3>
      <slot name="heading"></slot>
    </h3>
  </div>
</template>
