<template>
  <div
    class="w-full xl:max-w-[1160px] mx-auto mt-[64px] px-[20px] md:px-[40px] lg:px-[10px] xl:px-0 mb-[109px] md:mb-[100px] lg:mb-0">
    <h2 class="font-semibold text-[28px] text-left mb-[48px]">Create new airdrop</h2>

    <div class="flex flex-col lg:flex-row lg:justify-between">
      <main class="main">
        <div class="max-w-[660px] w-full">
          <h3 class="text-[24px] text-black font-medium mb-[16px]">General information</h3>

          <form class="form">
            <div class="w-full">
              <label class="form-label">Distribution token</label>
              <div class="relative">
                <multiselect v-model="token" placeholder="Select a token" label="label" track-by="label"
                  :options="tokenList" :option-height="104" :show-labels="false" @update:modelValue="onChange(token)" :taggable="true" @tag="addTag" :multiple="false">
                  <template v-slot:singleLabel="props"><img class="option__image pr-1 w-5 h-5" :src="props.option.icon"/>
                     <!-- :alt="props.option.label" />-->
                    <span class="option__desc">
                      <span class="option__title">{{ props.option.label }}</span>
                    </span></template>
                  <template v-slot:option="props"><img class="option__image pr-1 w-5 h-5" :src="props.option.icon"/>
                   <!--  :alt="props.option.label" />--> 
                    <div class="option__desc">
                      <span class="option__title">{{ props.option.label }}</span>
                    </div>
                  </template>
                </multiselect>
                <p class="form-dropdown-message">The token you are going to airdrop</p>
              </div>
            </div>

            <div class="w-full">
              <label for="airdropName" class="form-label">Airdrop name (optional)</label>
              <input v-model="airdropName" id="airdropName" class="form-text-input" :class="{ 'min-h-[43px]': !token }"
                type="text" name="airdropName" placeholder="Enter a name" />
            </div>
          </form>

          <form class="form">
            <div class="w-full">
              <label for="airdropName" class="form-label">Lock duration</label>
              <Datepicker v-model="airdropStore.lockDuration" inputClassName="dp-custom-input"
                placeholder="Date and time of unlock" :minDate="new Date()"
                :minTime="{ hours: new Date().getHours(), minutes: new Date().getMinutes() + 1 }"></Datepicker>
            </div>

            <div class="w-full">
              <div class="message text-[#4D4F55] bg-[#F0F1F5] border-[#C6C9CF] h-[40px] flex items-center pl-[12px]">
                <p>The tokens won’t be redeemed during this period.</p>
              </div>
            </div>
          </form>
        </div>

        <template v-if="token && airdropStore.step<2">
          <div class="mt-[48px] max-w-[660px]">
            <header>
              <h2 class="recipients-list-subtitle font-[500] leading-[28px]">Recipients list</h2>
              <div class="flex flex-col md:flex-row md:items-center md:justify-between mt-[8px]">
                <div class="flex space-x-[8px] sm:space-x-0 sm:justify-between md:justify-start md:space-x-[8px]">
                  <h3 class="text-[14px] font-pt_root">
                    Fill out the form manually or upload the CSV file.
                  </h3>

                  <span>
                    <InfoIcon title="Lorem  Ipsum, Lorem Ipsum" />
                  </span>
                </div>

                <div @click="downloadTemplate" class="flex items-center space-x-[6px] cursor-pointer">
                  <span class="downloadSign">
                    <DownloadIcon />
                  </span>
                  <p class="text-[#8B909A] text-sm font-pt_root font-medium">Download template</p>
                </div>
              </div>
            </header>

            <div ref="dropZoneRef" class="upload-file bg-[#ECF1FE] relative group mt-[20px]">
              <div class="w-[96px] h-[96px] bg-transparent group-hover:bg-[#B1C5FA] rounded-full absolute -top-6">
                <span class="upload-sign absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <UploadIcon v-if="!loading && !uploadSuccessful" />

                  <ProgressIcon v-else-if="loading" />

                  <SuccessIcon v-else />
                </span>
              </div>

              <input ref="file" @change="onFileChanged($event)" type="file" name="file" class="upload-csv"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                @click="$event.target.value = ''" />

              <div class="relative text-center mt-5" style="user-select: none; pointer-events: none;">
                <h2 class="upload-header" :class="{ 'text-[#398A39]': uploadSuccessful }">
                  {{
                      !loading && !uploadSuccessful
                        ? 'Click to upload or drag and drop'
                        : loading
                          ? `Checking the file ${fileName}...`
                          : uploadSuccessful
                            ? 'List has been successfully imported'
                            : ''
                  }}
                </h2>
                <h3 v-if="!loading && !uploadSuccessful" class="upload-subtitle">
                  Only CSV format is supported.
                </h3>
              </div>
            </div>
          </div>

          <div class="table w-full">
            <div class="desktop-table sm:block mt-[16px] mb-[40px] lg:mb-[100px] font-pt_root w-full">
              <div v-for="(item, i) in items" :key="i" @mouseover="hoverItem = i" @mouseleave="hoverItem = null"
                class="row grid grid-cols-[40px_1fr_1fr] md:grid-cols-[64px_1fr_1fr_70px] h-[40px] md:h-[44px] text-[14px]"
                :class="{ 'bg-[#F0F1F5] relative': hoverItem === i }">
                <div class="flex items-center px-[12px] border-t 
                border-l border-[#E4E5EA]" :class="{ 'border-b ': i + 1 === items.length }">{{
                    i + (recipientStore.itemsPerPage * (recipientStore.currentPage - 1)) + 1
                }}</div>

                <div class="px-[12px] py-[4px] flex items-center 
                justify-center border-t  border-[#E4E5EA]" :class="{ 'border-b ': i + 1 === items.length }">
                  <input v-model="item.address" class="h-full w-full px-[12px]" type="text" name="address"
                    placeholder="Recipient address" />
                </div>

                <div class="px-[12px] py-[4px] flex items-center 
                justify-center border-t border-r border-[#E4E5EA]" :class="{ 'border-b ': i + 1 === items.length }">
                  <input v-model="item.amount" type="number" name="amount" class="h-full w-full px-[12px]"
                    :placeholder="`Amount`" />
                </div>

                <div class="pl-2 bg-white absolute md:relative right-0 
                  bottom-10 md:bottom-0 shadow-[0px_3px_6px_rgba(0,0,0,0.16)] 
                  md:shadow-none border-[0.5px] md:border-0 border-[#E4E5EA]">
                  <div class="h-[40px] flex items-center justify-end px-[12px] 
                  space-x-[17px]">
                    <span v-if="hoverItem === i" @click="addItem(i)" class="plusSign 
                    cursor-pointer relative left-1">
                      <PlusIcon />
                    </span>

                    <span v-if="hoverItem === i && (items.length > 1)
                    || hoverItem === i && recipientStore.currentPage != 1" @click="removeItem(i)"
                      class="deleteSign cursor-pointer">
                      <TrashIcon />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            

            <!--PAGINATION component-->
            <div class="paginationToEdit justify-start lg:mt-[-80px] 
            lg:mb-[20px] mb-[40px]">
              <div>
                <AppPagination @submit="getRecipients" />
              </div>
            </div>

          </div>
        </template>

        <template v-else>
          <div class="mt-[48px] max-w-[660px]">
            <header>
              <h2 class="recipients-list-subtitle font-[500] leading-[28px]">Recipients list</h2>
              <div class="flex flex-col md:flex-row md:items-center md:justify-between mt-[8px]">
                <div class="flex space-x-[8px] sm:space-x-0 sm:justify-between md:justify-start md:space-x-[8px]">
                  <h3 class="text-[14px] font-pt_root">
                    Fill out the form manually or upload the CSV file.
                  </h3>

                  <span>
                    <InfoIcon title="Lorem  Ipsum, Lorem Ipsum" />
                  </span>
                </div>

                <div @click="downloadTemplate" class="flex items-center space-x-[6px] cursor-pointer">
                  <span class="downloadSign">
                    <DownloadIcon />
                  </span>
                  <p class="text-[#8B909A] text-sm font-pt_root font-medium">Download template</p>
                </div>
              </div>
            </header>

            <div ref="dropZoneRef" class="upload-file bg-[#ECF1FE] relative group mt-[20px]">
              <div class="w-[96px] h-[96px] bg-transparent group-hover:bg-[#B1C5FA] rounded-full absolute -top-6">
                <span class="upload-sign absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <UploadIcon v-if="!loading && !uploadSuccessful" />

                  <ProgressIcon v-else-if="loading" />

                  <SuccessIcon v-else />
                </span>
              </div>

              <input :disabled="true" ref="file" @change="onFileChanged($event)" type="file" name="file" class="upload-csv"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                @click="$event.target.value = ''" />

              <div class="relative text-center mt-5" style="user-select: none; pointer-events: none;">
                <h2 class="upload-header" :class="{ 'text-[#398A39]': uploadSuccessful }">
                  {{
                      !loading && !uploadSuccessful
                        ? 'Click to upload or drag and drop'
                        : loading
                          ? `Checking the file ${fileName}...`
                          : uploadSuccessful
                            ? 'List has been successfully imported'
                            : ''
                  }}
                </h2>
                <h3 v-if="!loading && !uploadSuccessful" class="upload-subtitle">
                  Only CSV format is supported.
                </h3>
              </div>
            </div>
          </div>

          <div class="table w-full">
            <div class="desktop-table sm:block mt-[16px] mb-[40px] lg:mb-[100px] font-pt_root w-full">
              <div v-for="(item, i) in items" :key="i" @mouseover="hoverItem = i" @mouseleave="hoverItem = null"
                class="row grid grid-cols-[40px_1fr_1fr] md:grid-cols-[64px_1fr_1fr_70px] h-[40px] md:h-[44px] text-[14px]"
                :class="{ 'bg-[#F0F1F5] relative': hoverItem === i }">
                <div class="flex items-center px-[12px] border-t 
                border-l border-[#E4E5EA]" :class="{ 'border-b ': i + 1 === items.length }">{{
                    i + (recipientStore.itemsPerPage * (recipientStore.currentPage - 1)) + 1
                }}</div>

                <div class="px-[12px] py-[4px] flex items-center 
                justify-center border-t  border-[#E4E5EA]" :class="{ 'border-b ': i + 1 === items.length }">
                  <input :disabled="true" v-model="item.address" class="h-full w-full px-[12px]" type="text" name="address"
                    placeholder="Recipient address" />
                </div>

                <div class="px-[12px] py-[4px] flex items-center 
                justify-center border-t border-r border-[#E4E5EA]" :class="{ 'border-b ': i + 1 === items.length }">
                  <input :disabled="true" v-model="item.amount" type="number" name="amount" class="h-full w-full px-[12px]"
                    :placeholder="`Amount`" />
                </div>

                <div class="pl-2 bg-white absolute md:relative right-0 
                  bottom-10 md:bottom-0 shadow-[0px_3px_6px_rgba(0,0,0,0.16)] 
                  md:shadow-none border-[0.5px] md:border-0 border-[#E4E5EA]">
                  <div class="h-[40px] flex items-center justify-end px-[12px] 
                  space-x-[17px]">
                    <span v-if="hoverItem === i" @click="addItem(i)" class="plusSign 
                    cursor-pointer relative left-1">
                   <!--  <PlusIcon />--> 
                    </span>

                    <span v-if="hoverItem === i && (items.length > 1)
                    || hoverItem === i && recipientStore.currentPage != 1" @click="removeItem(i)"
                      class="deleteSign cursor-pointer">
                     <!-- <TrashIcon /> -->
                    </span>
                  </div>
                </div>
              </div>
            </div>

            

            <!--PAGINATION component-->
            <div class="paginationToEdit justify-start lg:mt-[-80px] 
            lg:mb-[20px] mb-[40px]">
              <div>
                <AppPagination @submit="getRecipients" />
              </div>
            </div>

          </div>
        </template>
      </main>

      <TheSidebar
        :items="fullRecList"
        :token="token"
        :shareNetwork="{
          airdropName: airdropName,
        }"
      />
    </div>
  </div>
</template>

<script setup>
// PAGINATION Import //
import AppPagination from '@/components/Reusable/AppRecipientListPagination.vue';
import { useRecipientStore } from '@/stores/recipientStore';

import { ref, computed } from 'vue';
import { useDropZone } from '@vueuse/core';
// import { getCurrentInstance } from 'vue';
import recipientsList from '@/utils/recipients-list';
import tokensList from '@/utils/tokens-list';
import TheSidebar from '@/components/CreateAirdrop/TheSidebar.vue';
import PlusIcon from '@/components/icons/IconPlus.vue';
import TrashIcon from '@/components/icons/IconTrash.vue';
import DownloadIcon from '@/components/icons/IconDownload.vue';
import UploadIcon from '@/components/icons/Upload/IconUpload.vue';
import ProgressIcon from '@/components/icons/Upload/IconProgress.vue';
import SuccessIcon from '@/components/icons/Upload/IconSuccess.vue';
import InfoIcon from '@/components/icons/IconInfo.vue';
import Multiselect from 'vue-multiselect';
import { useAirdropStore } from '@/stores/airdrop';
import { fromNano } from '@/utils';
import axios from 'axios';
import { useWalletStore } from '@/stores/wallet';
import { ProviderRpcClient, Address } from 'everscale-inpage-provider';

// PAGINATION entities //
const recipientStore = useRecipientStore();

const rootAbi = {
  'ABI version': 2,
  version: '2.2',
  header: ['pubkey', 'time', 'expire'],
  functions: [
    {
      name: 'walletOf',
      inputs: [
        { name: 'answerId', type: 'uint32' },
        { name: 'walletOwner', type: 'address' }
      ],
      outputs: [
        { name: 'value0', type: 'address' }
      ]
    },
    {
      name: 'symbol',
      inputs: [
        { name: 'answerId', type: 'uint32' }
      ],
      outputs: [
        { name: 'value0', type: 'string' }
      ]
    },
    {
      name: 'decimals',
      inputs: [
        { name: 'answerId', type: 'uint32' }
      ],
      outputs: [
        { name: 'value0', type: 'uint8' }
      ]
    }
  ],
  data: [],
  events: []
}

const items = ref(recipientsList);
let fullRecList = ref(items.value.slice());
let numberPerPage = recipientStore.itemsPerPage;
const airdropName = ref(null);
const token = ref(null);
const tokenList = ref(tokensList);
const lockDuration = ref(null);
const hoverItem = ref(null);
const file = ref(null);
const fileName = ref(null);
const dropZoneRef = ref();
const loading = ref(false);
const uploadSuccessful = ref(false);
const airdropStore = useAirdropStore();
const walletStore = useWalletStore();
let counter=0;
/*const step = computed(() => {
  return airdropStore.step;
});*/
let tokenAddr;
// const app = getCurrentInstance();
// const addressFormat = app.appContext.config.globalProperties.$filters.addressFormat;
useDropZone(dropZoneRef, onDrop);
reset();
//addCustomTokens();
getBalances();
function addItem(index) {
  let blankItem = {
    address: null,
    amount: null,
  };
  let ipp = recipientStore.itemsPerPage;
  let pge = recipientStore.currentPage;
  fullRecList.value.splice(ipp * (pge - 1) + index + 1, 0, blankItem);
  getRecipients(ipp, pge);
}
function removeItem(index) {
  let ipp = recipientStore.itemsPerPage;
  let pge = recipientStore.currentPage;
  fullRecList.value.splice(ipp * (pge - 1) + index, 1);
  getRecipients(ipp, pge);

  // items.value.splice(index, 1);
  // fullRecList.value.splice(index, 1);
}
function onFileChanged($event) {
  const target = $event.target;
  if (target && target.files) {
    saveFile(target.files[0]);
  }
}
async function saveFile(value) {
  if (value) {
    try {
      fileName.value = value.name;
      loading.value = true;
      const data = await readFile(value);
      await CSVToJSON(data);
      loading.value = false;
      uploadSuccessful.value = true;
      setTimeout(() => {
        uploadSuccessful.value = false;
      }, 3000);
    } catch (error) {
      console.error(error);
    }
  }
}
function onDrop(files) {
  if (files) {
    saveFile(files[0]);
  }
}
function downloadTemplate() {
  window.open('example.csv');
}
function CSVToJSON(data, delimiter = ',') {
  items.value = [];
  return new Promise((resolve, reject) => {
    resolve(
      data.split(/\r\n|\n/).forEach((v) => {
        const values = v.split(delimiter);
        if (values[0]) {
          /* let decimals;
           if(token.value.label=='EVER')
           {
             console.log('Token: ', token.value);
             decimals = 9;
             console.log('Decimals: ', decimals);
           }
           else
           {
             console.log('Token: ', token.value);
             decimals = token.value.decimals;
             console.log('Decimals: ', decimals);
           }*/
          items.value.push({
            address: values[0].replace(/^"(.*)"$/, '$1'),
            // address: addressFormat(values[0]),
            amount: values[1].replace(/^"(.*)"$/, '$1'),
          });
          console.log(values[0]);
        }
      })
    );

    // Show or hide pagination
    const paginationEdit = document.querySelectorAll('.paginationToEdit');
    if (items.value.length != 0) {
      console.log('Display pagination: yes');
      paginationEdit[0].style.display = "flex";
    } else {
      console.log('Display pagination: no');
      paginationEdit[0].style.display = "none";
    }
    // Reset pagination for new file
    recipientStore.resetPagination();
    fullRecList.value = items.value.slice();
    // Get recipients per page, initial page "0" and 10 per page
    getRecipients(recipientStore.itemsPerPage, 1);

    reject('CSVToJSON(Something went wrong)');
  });
}
function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}
async function onChange(token) {
  await airdropStore.getExpectedAddress(token);
  await airdropStore.calculateFees("deploy", "giver", "EVER", "");
  console.log('Fee: ', airdropStore.fees);
  //airdropStore.step =1;
}

function reset() {
  airdropStore.address = '';
  airdropStore.step = 1;
  airdropStore.topUpRequiredAmount = 0;
  items.value.length = 10;
  airdropStore.currentBatch = 0;
  for (let i = 0; i < items.value.length; i++) {
    items.value[i].address = "";
    items.value[i].amount = "";
  }
  for(let i=0;i<fullRecList.value.length;i++)
  {
    fullRecList.value[i].address = "";
    fullRecList.value[i].amount = "";
  }
  //recipientsList=null;
  airdropStore.loopCount = 0;

  airdropStore.transactionId.giverContractId = "";
  airdropStore.transactionId.deployContractId = "";
  airdropStore.transactionId.amountContractId = "";
  airdropStore.transactionId.distributeContractId = "";
  airdropStore.transactionId.redeemContractId = "";
  airdropStore.fees = 0;
  airdropStore.airdropName="";
}

async function addCustomTokens() {
  var data = JSON.stringify({
    "ownerAddress": walletStore.profile.address,
    "limit": 100,
    "offset": 0,
    "ordering": "amountdescending"
  });

  var config = {
    method: 'post',
    url: 'https://tokens.everscan.io/v1/balances',
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  };


  return axios(config)
    .then(function (response) {
      //responseVar = response.data.balances;
      console.log('Response: ', response.data);
      console.log(JSON.stringify(response.data));
      tokenAddr = response.data;
      console.log(tokenAddr);
      //for(let i=0;i<response.data.balances.length;i++)
      //{
      // tokenAddr.push(response.data.balances[i].rootAddress);
      //const rootAcc = new ever.Contract(rootAbi, response.data.balances[i].rootAddress);
      //const decimal = rootAcc.methods.decimals({answerId: 1}).call();
      //console.log("decimals: ", decimal);
      //}
    })
    .catch(function (error) {
      console.log(error);
    });





  //const rootAcc = new ever.Contract(rootAbi, this.token.address);

}

async function getBalances() {
  const axiosRes = await addCustomTokens();
  console.log(axiosRes);
  // if(axiosRes.status == 200)
  //{//.then(function (response) { tokenAddr = response.data});
  //tokenAddr = axiosRes.data;
  // console.log('Token addr:', tokenAddr);
  const ever = new ProviderRpcClient();
  // console.log(tokenAddr.balances.length);
  let counter = 0;
  for (let i = 0; i < tokenAddr.balances.length; i++) {
    const rootAcc = new ever.Contract(rootAbi, tokenAddr.balances[i].rootAddress);
    const decimal = await rootAcc.methods.decimals({ answerId: 1 }).call();
    //  console.log("decimals: ", decimal);
    const token = tokensList.find(token => token.address == tokenAddr.balances[i].rootAddress);

    if (token == undefined) {
      counter++;
      //console.log('Usao u undefined');
      tokenList.value.push({ label: tokenAddr.balances[i].token, decimals: decimal.value0 * 1, address: tokenAddr.balances[i].rootAddress, icon: `/avatar/${counter}.svg` });
    }
  }
  //console.log(tokenList);
  //console.log('Avatar:',walletStore.profile.address.substr(
  //  walletStore.profile.address.length - 1,
  //  1
  //));

}/* const ever = new ProviderRpcClient();
  console.log(tokenAddr.length);
  for(let i=0;i<tokenAddr.length;i++)
{
   const rootAcc = new ever.Contract(rootAbi, tokenAddr[i]);
  const decimal = await rootAcc.methods.decimals({answerId: 1}).call();
  console.log("decimals: ", decimal);
}*/


// /////////////////////////////////////
// PAGINATION Functions 
// /////////////////////////////////////////////////////
let pages = [];
function getRecipients(num, page) {
  // Save the number of items to be shown per page
  recipientStore.setNumItemsPerPage(num);
  items.value = fullRecList.value.slice();

  // Create pages with the "num" number of items
  pages = [];
  let a = items.value;
  for (var i = 0; i < a.length; i++) {
    if (i % num == 0) pages.push([]);
    pages[Math.floor(i / num)].push(a[i]);
    // console.log(pages);
  }
  // console.log(`Number of items per page: ${num}`);
  // console.log(`Page num: ${page}`);

  let arr = fullRecList.value.slice();
  let begin = num * (page - 1);
  let end = page * num;
  arr = arr.slice(begin, end);

  // Change the list that is being shown
  items.value = arr;

  recipientStore.getRecipients(pages.length, page);
}

async function addTag(newTag)
{
  const ever = new ProviderRpcClient();
  //const token =  await airdropStore.getToken(newTag);
  const root = new ever.Contract(rootAbi, newTag);
  
    const decimal = await root.methods.decimals({answerId: 1}).call();
    console.log(decimal);
    const label = await root.methods.symbol({answerId: 1}).call();
    console.log(label);
    const token = tokensList.find(token=>token.address == newTag);
   console.log('If token', token);
          if(token==undefined)
          {
            tokenList.value.push({label: label.value0, decimals: decimal.value0*1, address: newTag, icon:`/avatar/${counter++}.svg`});
            console.log('Usao');
          }
    
    }
    //tokensList.push({label: label.value0, decimals: decimal.value0*1, address: newTag, icon:`/avatar/5.svg`});
  //  console.log('Tokens list: ', tokensList);
  //  console.log('Props value:', tokenList.value);
   // airdropStore.tokensList.push({label: label.value0, decimals: decimal.value0*1, address: tokenAddr, icon:`/avatar/5.svg`});
    //console.log('Tokens list: ', tokensList);
  //console.log('Token: ', token);
  /*const tag = {
    label:'New token',
    decimals:9,
    address: newTag,
    icon: ''

  }
  tokenList.value.push(tag);*/


</script>