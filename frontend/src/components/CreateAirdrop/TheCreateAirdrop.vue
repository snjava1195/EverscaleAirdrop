<template>
  <div
    class="w-full xl:max-w-[1160px] mx-auto mt-[64px] px-[20px] md:px-[40px] lg:px-[10px] xl:px-0 mb-[109px] md:mb-[100px] lg:mb-0"
  >
    <h2 class="font-semibold text-[28px] text-left mb-[48px]">Create new airdrop</h2>

    <div class="flex flex-col lg:flex-row lg:justify-between">
      <main class="main">
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
              type="text"
              name="airdropName"
              placeholder="Enter a name"
            />
          </div>
        </form>

        <template v-if="token">
          <div class="mt-[48px]">
            <header>
              <h2 class="recipients-list-subtitle">Recipients list</h2>
              <div class="flex flex-col md:flex-row md:items-center md:justify-between">
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
                  @click="downloadTemplate"
                  class="flex items-center space-x-[6px] cursor-pointer"
                >
                  <span class="downloadSign">
                    <DownloadIcon />
                  </span>
                  <p class="text-[#8B909A]">Download template</p>
                </div>
              </div>
            </header>

            <div ref="dropZoneRef" class="upload-file bg-[#ECF1FE] relative">
              <span class="upload-sign">
                <UploadIcon v-if="!loading && !uploadSuccessful" />

                <ProgressIcon v-else-if="loading" />

                <SuccessIcon v-else />
              </span>

              <input
                ref="file"
                @change="onFileChanged($event)"
                type="file"
                name="file"
                class="upload-csv"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                @click="$event.target.value = ''"
              />

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

          <div class="table w-full">
            <div
              class="desktop-table sm:block mt-[16px] mb-[40px] lg:mb-[100px] border-[#E4E5EA] font-pt_root"
            >
              <div
                v-for="(item, i) in items"
                :key="i"
                @mouseover="hoverItem = i"
                @mouseleave="hoverItem = null"
                class="row grid grid-cols-2 md:grid-cols-[64px_1fr_1fr_68px] h-[90px] md:h-[44px] text-[14px] border border-b-[#E4E5EA]]"
                :class="{ 'bg-[#F0F1F5]': hoverItem === i }"
              >
                <div class="h-full w-full flex items-center px-[12px]">{{ i + 1 }}</div>

                <div
                  class="h-full w-full flex items-center justify-end px-[12px] space-x-[17px] md:order-4 md:bg-white"
                >
                  <span v-if="hoverItem === i" @click="addItem" class="plusSign cursor-pointer">
                    <PlusIcon />
                  </span>

                  <span
                    v-if="hoverItem === i && items.length > 1"
                    @click="removeItem(i)"
                    class="deleteSign cursor-pointer"
                  >
                    <TrashIcon />
                  </span>
                </div>

                <div class="h-full w-full px-[12px] py-[4px] flex items-center justify-center">
                  <input
                    v-model="item.address"
                    class="h-full w-full px-[12px]"
                    type="text"
                    name="address"
                    placeholder="Recipient address"
                  />
                </div>

                <div class="h-full w-full px-[12px] py-[4px] flex items-center justify-center">
                  <input
                    v-model="item.amount"
                    type="number"
                    name="amount"
                    class="h-full w-full px-[12px]"
                    :placeholder="`Amount, ${token.label}`"
                  />
                </div>
              </div>
            </div>
          </div>
        </template>
      </main>

      <TheSidebar :items="items" :tokenName="token ? token.label : 'WEVER'" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
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

const items = ref(recipientsList);
const airdropName = ref(null);
const token = ref(null);
const tokenList = ref(tokensList);
const hoverItem = ref(null);
const file = ref(null);
const fileName = ref(null);
const dropZoneRef = ref();
const loading = ref(false);
const uploadSuccessful = ref(false);
// const app = getCurrentInstance();
// const addressFormat = app.appContext.config.globalProperties.$filters.addressFormat;
useDropZone(dropZoneRef, onDrop);

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
</script>
