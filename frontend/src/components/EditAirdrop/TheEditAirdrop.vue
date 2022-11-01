<template>
  <div
    class="w-full xl:max-w-[1160px] mx-auto mt-[64px] px-[20px] md:px-[40px] lg:px-[10px] xl:px-0 mb-[109px] md:mb-[100px] lg:mb-0"
  >
    <h2 class="font-semibold text-[28px] text-left mb-[48px]">{{airdropName}}</h2>

    <div class="flex flex-col lg:flex-row lg:justify-between">
      <main class="main">
        <div class="max-w-[660px] w-full">
        <h3 class="text-[24px] text-black font-medium mb-[16px]">General information</h3>

        <form class="form">
          <div class="w-full">
            <label class="form-label">Distribution token</label>
            <div class="relative">
              <multiselect
                v-model="token"
                placeholder="Select a token"
                label="label"
                track-by="label"
                :options="tokenList"
                :option-height="104"
                :show-labels="false"
                @update:modelValue="onChange(token)"
              >
                <template v-slot:singleLabel="props"
                  ><img
                    class="option__image pr-1 w-5 h-5"
                    :src="props.option.icon"
                    :alt="props.option.label"
                  />
                  <span class="option__desc">
                    <span class="option__title">{{ props.option.label }}</span>
                  </span></template
                >
                <template v-slot:option="props"
                  ><img
                    class="option__image pr-1 w-5 h-5"
                    :src="props.option.icon"
                    :alt="props.option.label"
                  />
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
            <input
              v-model="airdropName"
              id="airdropName"
              class="form-text-input"
              :class="{ 'min-h-[43px]': !token }"
              type="text"
              name="airdropName"
              placeholder="Enter a name"
            />
          </div>
        </form>

        <form class="form">
          <div class="w-full">
            <label for="airdropName" class="form-label">Lock duration</label>
            <Datepicker
              v-model="airdropStore.lockDuration"
              inputClassName="dp-custom-input"
              placeholder="Date and time of unlock"
              :minDate="new Date()"
              :minTime="{ hours: new Date().getHours(), minutes: new Date().getMinutes() + 1 }"
            ></Datepicker>
          </div>

          <div class="w-full">
            <div class="message text-[#4D4F55] bg-[#F0F1F5] border-[#C6C9CF] h-[40px] flex items-center pl-[12px]">
              <p>The tokens won’t be redeemed during this period.</p>
            </div>
          </div>
        </form>
        </div>

        <template v-if="token">
          <div class="mt-[48px] max-w-[660px]">
            <header>
              <h2 class="recipients-list-subtitle font-[500] leading-[28px]">Recipients list</h2>
              <div class="flex flex-col md:flex-row md:items-center md:justify-between mt-[8px]">
                <div
                  class="flex space-x-[8px] sm:space-x-0 sm:justify-between md:justify-start md:space-x-[8px]"
                >
                  <h3 class="text-[14px] font-pt_root">
                    Fill out the form manually or upload the CSV file.
                  </h3>

                  <span>
                    <InfoIcon title="Lorem  Ipsum, Lorem Ipsum" />
                  </span>
                </div>

                <div
                  @click="downloadTemplate" :disabled="true"
                  class="flex items-center space-x-[6px] cursor-pointer"
                >
                  <span class="downloadSign">
                    <DownloadIcon :disabled="true"/>
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
              <input
                :disabled="true"
                ref="file"
                @change="onFileChanged($event)"
                type="file"
                name="file"
                class="upload-csv"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                @click="$event.target.value = ''"
              />

              <div class="relative text-center mt-5">
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
            <div
              class="desktop-table sm:block mt-[16px] mb-[40px] lg:mb-[100px] font-pt_root w-full"
            >
              <div
                v-for="(item, i) in items"
                :key="i"
                @mouseover="hoverItem = i"
                @mouseleave="hoverItem = null"
                class="row grid grid-cols-[40px_1fr_1fr] md:grid-cols-[64px_1fr_1fr_70px] h-[40px] md:h-[44px] text-[14px]"
                :class="{ 'bg-[#F0F1F5]': hoverItem === i }"
              >
              <div class="flex items-center px-[12px] border-t border-l border-[#E4E5EA]"
                :class="{'border-b ': i + 1  === items.length}"
                >{{ i + 1 }}</div>

              <div class="px-[12px] py-[4px] flex items-center justify-center border-t  border-[#E4E5EA]"
                    :class="{'border-b ': i + 1  === items.length}"
                >
                  <input
                    :disabled="true" 
                    v-model="item.address"
                    class="h-full w-full px-[12px]"
                    type="text"
                    name="address"
                    placeholder="Recipient address"
                  />
                </div>

                <div class="px-[12px] py-[4px] flex items-center justify-center border-t border-r border-[#E4E5EA]"
                     :class="{'border-b ': i + 1  === items.length}"
                >
                  <input
                  :disabled="true" 
                    v-model="item.amount"
                    type="number"
                    name="amount"
                    class="h-full w-full px-[12px]"
                    :placeholder="`Amount`"
                  />
                </div>
                <div
                  class="pl-2 bg-white absolute md:relative right-0 bottom-10 md:bottom-0 shadow-[0px_3px_6px_rgba(0,0,0,0.16)] md:shadow-none border-[0.5px] md:border-0 border-[#E4E5EA]"
                >
                  <div class="h-[40px] flex items-center justify-end px-[12px] space-x-[17px]">
                    <span v-if="hoverItem === i" @click="addItem" :disabled="true" class="plusSign cursor-pointer relative left-1">
                      <PlusIcon />
                    </span>
  
                    <span
                      v-if="hoverItem === i && items.length > 1"
                      :disabled="true"
                      @click="removeItem(i)"
                      
                      class="deleteSign cursor-pointer"
                    >
                      <TrashIcon :disabled="true"/>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </main>

      <TheSidebar
        :items="items"
        :token="token"
        :shareNetwork="{
          airdropName: airdropName,
        }"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useDropZone } from '@vueuse/core';
// import { getCurrentInstance } from 'vue';
import recipientsList from '@/utils/recipients-list';
import tokensList from '@/utils/tokens-list';
import { fromNano } from '@/utils';
import TheSidebar from '@/components/CreateAirdrop/TheSidebar.vue';
import PlusIcon from '@/components/icons/IconPlus.vue';
import TrashIcon from '@/components/icons/IconTrash.vue';
import DownloadIcon from '@/components/icons/IconDownload.vue';
import UploadIcon from '@/components/icons/Upload/IconUpload.vue';
import ProgressIcon from '@/components/icons/Upload/IconProgress.vue';
import SuccessIcon from '@/components/icons/Upload/IconSuccess.vue';
import InfoIcon from '@/components/icons/IconInfo.vue';
import Multiselect from 'vue-multiselect';
import airdrop2Abi from '../../../../build/Airdrop.abi.json';
import { useAirdropStore } from '@/stores/airdrop';
import { useRoute } from 'vue-router';
import { ProviderRpcClient } from 'everscale-inpage-provider';
import dayjs from 'dayjs';

const ever = new ProviderRpcClient();
const items = ref(recipientsList);
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
// const app = getCurrentInstance();
// const addressFormat = app.appContext.config.globalProperties.$filters.addressFormat;
useDropZone(dropZoneRef, onDrop);

getAirdrop();
function addItem() {
  items.value.push({
    address: null,
    amount: null,
  });
}
function removeItem(index) {
  items.value.splice(index, 1);
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
          items.value.push({
            address: values[0].replace(/^"(.*)"$/, '$1'),
            // address: addressFormat(values[0]),
            amount: values[1].replace(/^"(.*)"$/, '$1'),
          });
        }
      })
    );
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
}

async function getAirdrop()
{
  const route = useRoute();
  token.value = tokensList.find(token=>token.label=='EVER');
  const address = route.params.address;
  const contract = new ever.Contract(airdrop2Abi, address);
          airdropStore.address = address;
          airdropStore.abi = airdrop2Abi;
          const tokenAddress = await contract.methods.tokenRootAddress({}).call();
          //console.log('Token address value: ', tokenAddress.tokenRootAddress);
          if(tokenAddress.tokenRootAddress._address=="0:0000000000000000000000000000000000000000000000000000000000000000")
          {
            token.value = tokensList.find(token=>token.label=='EVER');
            airdropStore.token = token.value;
          }
          else{
          token.value = tokensList.find(token=>token.address == tokenAddress.tokenRootAddress);
          airdropStore.token = token.value;
          }
          console.log('Airdrop store token: ', airdropStore.token);
          console.log('Token: ', token.value);
          const name = await contract.methods.contract_notes({}).call();
          //console.log('Name: ', name);
          airdropName.value = name.contract_notes;
          //console.log('Name: ', airdropName.value);
          
          const refundDuration = await contract.methods.getRefundLockDuration({}).call();
          airdropStore.lockDuration = dayjs.unix(refundDuration.value0).format('ddd MMM DD YYYY HH:mm:ss');

          console.log('Lock duration: ', airdropStore.lockDuration);
          const status = await contract.methods.status({}).call();
          console.log(status);

         // const balance = await contract.methods.balanceWallet({}).call();
         // console.log(balance);
          if(status.status == "Deployed")
          {
            airdropStore.step = 3;
          }

          if(status.status == "Executed")
          {
            airdropStore.step=5;
          }
          if(status.status == "Redeemed")
          {
            airdropStore.step = 6;
          }
          if(status.status.includes('Executing'))
          {
            airdropStore.step = 4;
          }
          for(let i=0;i<airdropStore.airdropData.length;i++)
          {
            if(airdropStore.airdropData[i].address==address)
            {

              if(airdropStore.airdropData[i].status == "Preparing")
              {
                airdropStore.step = 4;
              }
              /*else if(airdropStore.airdropData[i].status == "Redeemed")
              {
                airdropStore.step = 6;
              }
              else if(airdropStore.airdropData[i].status.includes('Executing'))
              {
                airdropStore.step=4;
              }*/
            }
            
          }
          


          const recipientsNr = await contract.methods.recipientNumber({}).call();
          const totalAmount = await contract.methods.totalAmount({}).call();
          airdropStore.topUpRequiredAmount = fromNano(totalAmount.totalAmount,9);
          const date = await contract.methods.creationDate({}).call();
          const batches = await contract.methods.batches({}).call();
          const distributed = await contract.methods.getDistributedContracts({}).call();
          const deployed = await contract.methods.getDeployedContracts({}).call();
          const recipients = await contract.methods.allRecipients({}).call();
          const transactionHashes = await contract.methods.transactionHashes({}).call();
          //console.log(recipients.allRecipients);
          const zaAirdrop=[];
         
          const amounts = await contract.methods.allAmounts({}).call();

          for(let i=0;i<transactionHashes.transactionHashes.length;i++)
          {
            if(transactionHashes.transactionHashes.length<3)
            {
              airdropStore.transactionId.giverContractId = transactionHashes.transactionHashes[0];
              airdropStore.transactionId.deployContractId = transactionHashes.transactionHashes[1];
            }
            else if(transactionHashes.transactionHashes.length<4)
            {
              airdropStore.transactionId.giverContractId = transactionHashes.transactionHashes[0];
              airdropStore.transactionId.deployContractId = transactionHashes.transactionHashes[1];
              airdropStore.transactionId.amountContractId = transactionHashes.transactionHashes[2];
            }
            else if(transactionHashes.transactionHashes.length<5)
            {
              airdropStore.transactionId.giverContractId = transactionHashes.transactionHashes[0];
              airdropStore.transactionId.deployContractId = transactionHashes.transactionHashes[1];
              airdropStore.transactionId.amountContractId = transactionHashes.transactionHashes[2];
              airdropStore.transactionId.distributeContractId = transactionHashes.transactionHashes[3];
            }
            else {
              airdropStore.transactionId.giverContractId = transactionHashes.transactionHashes[0];
              airdropStore.transactionId.deployContractId = transactionHashes.transactionHashes[1];
              airdropStore.transactionId.amountContractId = transactionHashes.transactionHashes[2];
              airdropStore.transactionId.distributeContractId = transactionHashes.transactionHashes[3];
              airdropStore.transactionId.redeemContractId = transactionHashes.transactionHashes[4];
            }
          }
          //console.log(amounts);
          if(items.value.length != amounts.allAmounts.length )
          {
            if(amounts.allAmounts.length<=10)
            {
          for(let i=0;i<amounts.allAmounts.length;i++)
          {
            //console.log('Za airdrop: ', recipients.allRecipients[i]._address)
           // zaAirdrop.push(recipients.allRecipients[i]._address);
           /* items.value.push({
    address: recipients.allRecipients[i]._address,
    amount: fromNano(amounts.allAmounts[i],9),
  });*/
    items.value[i].address = recipients.allRecipients[i]._address;
    items.value[i].amount = fromNano(amounts.allAmounts[i], airdropStore.token.decimals);
          }
          //console.log(zaAirdrop);
        }
          
          else{
            for(let i=0;i<10;i++)
          {
            //console.log('Za airdrop: ', recipients.allRecipients[i]._address)
            zaAirdrop.push(recipients.allRecipients[i]._address);
           /* items.value.push({
    address: recipients.allRecipients[i]._address,
    amount: fromNano(amounts.allAmounts[i],9),
  });*/
    items.value[i].address = recipients.allRecipients[i]._address;
    items.value[i].amount = fromNano(amounts.allAmounts[i], airdropStore.token.decimals);
          }
          for(let i=10;i<recipients.allRecipients.length;i++)
          {
            items.value.push({address: recipients.allRecipients[i]._address, amount: fromNano(amounts.allAmounts[i], airdropStore.token.decimals)});
          }
        }
      }
         //console.log('Items: ', items.value);
         
          airdropStore.loopCount = batches.batches;
          airdropStore.currentBatch = distributed.value0.length;
          airdropStore.maxBatches = batches.batches;
          return Promise.resolve(refundDuration);
}
</script>
