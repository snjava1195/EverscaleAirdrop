<template>
  <div class="main-content-create-airdrop">
    <h2 class="title-airdrops text-[28px] text-left">Create new airdrop</h2>

    <div class="flex justify-between">
      <main class="w-[660px]">
        <h3 class="text-[24px] text-black text-medium">General information</h3>

        <div class="form">
          <div class="w-[318px]">
            <div>
              <label class="text-[#2B63F1] font-medium font-pt_root">Distribution token</label>
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
              <p class="text-[12px] text-[#A6AAB2] font-medium font-pt_root">
                The token you are going to airdrop
              </p>
            </div>
          </div>

          <div class="w-[318px]">
            <label for="airdropName" class="text-black font-medium font-pt_root"
              >Airdrop name (optional)</label
            >
            <input
              v-model="airdropName"
              id="airdropName"
              class="name-text-input"
              type="text"
              name="airdropName"
              placeholder="Enter a name"
            />
          </div>
        </div>

        <template v-if="token">
          <div class="mt-[48px] w-full z-20">
            <header class="flex items-end justify-between">
              <div>
                <h2 class="text-[24px] font-medium">Recipients list</h2>
                <div class="flex items-end space-x-2">
                  <h3 class="text-[14px] font-pt_root">
                    Fill out the form manually or upload the CSV file.
                  </h3>

                  <span>
                    <InfoIcon title="Lorem  Ipsum, Lorem Ipsum" />
                  </span>
                </div>
              </div>

              <div @click="downloadTemplate" class="flex items-center space-x-[8px] cursor-pointer">
                <span>
                  <DownloadIcon />
                </span>
                <span>
                  <p class="text-[#8B909A] font-medium text-[14px]">Download template</p>
                </span>
              </div>
            </header>

            <div
              ref="dropZoneRef"
              class="w-full h-[124px] border border-dashed border-[#B1C5FA] flex flex-col justify-center items-center mt-2 bg-[#F9FAFF] relative"
            >
              <span
                class="w-[44px] h-[44px] rounded-full bg-[#DAE4FD] flex items-center justify-center"
              >
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

              <h2
                class="font-bold text-[#2B63F1] font-pt_root"
                :class="{ 'text-[#398A39]': uploadSuccessful }"
              >
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
              <h3
                v-if="!loading && !uploadSuccessful"
                class="text-[#2B63F1] text-[12px] font-pt_root"
              >
                Only CSV format is supported.
              </h3>
            </div>
          </div>

          <div class="select_list w-full mt-[16px] mb-[98px]">
            <table class="w-full border border-[#E4E5EA] text-[14px] text-[#B7BAC2]">
              <tbody>
                <tr
                  v-for="(item, i) in items"
                  :key="i"
                  @mouseover="hoverItem = i"
                  @mouseleave="hoverItem = null"
                >
                  <td
                    class="w-[64px] text-black font-pt_root pl-[12px] border-b border-[#E4E5EA]"
                    :class="{ 'bg-[#F0F1F5]': hoverItem === i }"
                  >
                    {{ i + 1 }}
                  </td>

                  <td
                    class="h-[44px] py-[4px] px-[12px] border-b border-[#E4E5EA]"
                    :class="{ 'bg-[#F0F1F5]': hoverItem === i }"
                  >
                    <input
                      v-model="item.address"
                      class="placeholder:text-[#B7BAC2] placeholder:font-pt_root bg-white w-full h-full pl-[12px]"
                      type="text"
                      name="address"
                      placeholder="Recipient address"
                    />
                  </td>

                  <td
                    class="h-[44px] py-[4px] px-[12px] border-b border-[#E4E5EA]"
                    :class="{ 'bg-[#F0F1F5]': hoverItem === i }"
                  >
                    <input
                      v-model="item.amount"
                      class="placeholder:text-[#B7BAC2] placeholder:font-pt_root bg-white w-full h-full pl-[12px]"
                      type="text"
                      name="amount"
                      :placeholder="`Amount, ${token.label}`"
                    />
                  </td>

                  <td
                    class="flex items-center justify-end h-[44px] border-b border-[#E4E5EA] min-w-[100px]"
                  >
                    <span v-if="hoverItem === i" @click="addItem" class="plusSign cursor-pointer">
                      <PlusIcon />
                    </span>

                    <span
                      v-if="hoverItem === i && items.length > 1"
                      @click="removeItem(i)"
                      class="ereseSign ml-[17px] mr-[17px] cursor-pointer"
                    >
                      <TrashIcon />
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
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
const itemsDefault = {
  address: null,
  amount: null,
};
const file = ref(null);
const fileName = ref(null);
const dropZoneRef = ref();
const loading = ref(false);
const uploadSuccessful = ref(false);
// const app = getCurrentInstance();
// const addressFormat = app.appContext.config.globalProperties.$filters.addressFormat;
useDropZone(dropZoneRef, onDrop);

function addItem() {
  items.value.push(itemsDefault);
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

<style src="vue-multiselect/dist/vue-multiselect.css"></style>

<style>
.multiselect__single {
  display: flex;
}
.multiselect__option {
  display: flex;
  align-items: center;
}
</style>
