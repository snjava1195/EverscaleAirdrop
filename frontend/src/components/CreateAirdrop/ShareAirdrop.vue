<template>
  <div class="social flex justify-end w-full h-[128px] bg-[#0F2150] mt-8 relative">
    <div>
      <ShareCardIcon />

      <img class="absolute right-0 bottom-0" src="../../assets/img/Rectangle-1842.png" alt="" />
    </div>

    <h2 class="text-white font-medium absolute top-[16px] left-[16px]">
      Share this airdrop in<br />
      social networks
    </h2>

    <div class="icons flex space-x-[6px] absolute left-[16px] bottom-[16px]">
      <ShareNetwork
        network="twitter"
        :url="`https://everdrop.io/airdrops/${props.shareNetwork.contractAddress}`"
        :title="`We have successfully finished the airdrop ${props.shareNetwork.airdropName}, check your wallets!`"
        hashtags="vuejs,vite"
      >
        <a
          class="w-[36px] h-[36px] bg-[#2B63F1] flex justify-center items-center rounded-full"
          title="Twitter"
        >
          <TwitterIcon />
        </a>
      </ShareNetwork>

      <ShareNetwork
        network="telegram"
        :url="`https://everdrop.io/airdrops/${props.shareNetwork.contractAddress}`"
        :title="`We have successfully finished the airdrop ${props.shareNetwork.airdropName}, check your wallets!`"
      >
        <a
          class="w-[36px] h-[36px] bg-[#2B63F1] flex justify-center items-center rounded-full"
          title="Telegram"
        >
          <TelegramIcon />
        </a>
      </ShareNetwork>

      <a
        class="w-[36px] h-[36px] bg-[#2B63F1] flex justify-center items-center rounded-full"
        title="Discord"
      >
        <DiscordIcon />
      </a>

      <ShareNetwork
        network="facebook"
        :url="`https://everdrop.io/airdrops/${props.shareNetwork.contractAddress}`"
        :title="`We have successfully finished the airdrop ${props.shareNetwork.airdropName}, check your wallets!`"
        :description="`${props.shareNetwork.totalAmount} ${props.shareNetwork.tokenName} were distributed to ${props.shareNetwork.totalAddresses} addresses.`"
        hashtags="vuejs,vite"
      >
        <a
          class="w-[36px] h-[36px] bg-[#2B63F1] flex justify-center items-center rounded-full"
          title="Facebook"
        >
          <FacebookIcon />
        </a>
      </ShareNetwork>

      <ShareNetwork
        network="reddit"
        :url="`https://everdrop.io/airdrops/${props.shareNetwork.contractAddress}`"
        :title="`We have successfully finished the airdrop ${props.shareNetwork.airdropName}, check your wallets!`"
      >
        <a
          class="w-[36px] h-[36px] bg-[#2B63F1] flex justify-center items-center rounded-full"
          title="Reddit"
        >
          <RedditIcon />
        </a>
      </ShareNetwork>
    </div>

    <span class="absolute right-0 bottom-6">
      <img src="../../assets/img/Rectangle-1841.png" alt="" />
    </span>
  </div>
</template>

<script setup>
import ShareCardIcon from '@/components/icons/IconShareCard.vue';
import TwitterIcon from '@/components/icons/Social/IconTwitter.vue';
import TelegramIcon from '@/components/icons/Social/IconTelegram.vue';
import DiscordIcon from '@/components/icons/Social/IconDiscord.vue';
import FacebookIcon from '@/components/icons/Social/IconFacebook.vue';
import RedditIcon from '@/components/icons/Social/IconReddit.vue';

const props = defineProps({
  shareNetwork: {
    type: Object,
    required: true,
  },
});

console.log('Props: ', props.shareNetwork);
</script>
