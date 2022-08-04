<template>
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>{{ title }}</title>
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM8.875 7.25V5H11.125V7.25H8.875ZM8.875 15.625V8.875H11.125V15.625H8.875Z"
      fill="#C6C9CF"
    />
  </svg>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
});
</script>
