<template>
  <div class="container">
    <AppHeader />

    <RouterView />

    <AppFooter />
    <notifications position="bottom right" />
  </div>
</template>

<script setup>
import AppHeader from '@/components/Reusable/AppHeader.vue';
import AppFooter from '@/components/Reusable/AppFooter.vue';
</script>
