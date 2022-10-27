import BigNumber from 'bignumber.js';
import { notify } from '@kyvg/vue3-notification';
import { useWalletStore } from '@/stores/wallet';
import dayjs from 'dayjs';
const addressRegex = '^(0|-1):[0-9a-fA-F]{64}$';
const amountRegex = '^\\d+(\\.\\d+)?$';

export const toNano = (amount, decimals) => new BigNumber(amount).shiftedBy(decimals).toFixed(0);
export const fromNano = (amount, decimals) => parseInt(amount) / Math.pow(10, decimals);

export const addressReg = new RegExp(addressRegex);
export const amountReg = new RegExp(amountRegex);

export const getRandomNonce = () => (Math.random() * 64000) | 0;

export const getSeconds = (date) => {
  const d = dayjs(date);
  return d.diff(dayjs(), 's');
};

export const validateAddressAmountList = (arr, totalTokens) => {
  const walletStore = useWalletStore();
  if (arr.length > 0) {
    for (let i = 0; i < arr.length; i++) {
      const row = arr[i];
      if (!row.amount && row.address) {
        notify({
          text: `Missing amount in row: ${i + 1}`,
          type: 'error',
        });
        return false;
      }
      if (/*!amountReg.test(row.amount) &&*/ row.address) {
        notify({
          text: `Incorrect amount format in row: ${i + 1}'`,
          type: 'error',
        });
        return false;
      }
      if (!row.address && row.amount) {
        notify({
          text: `Missing address in row: ${i + 1}`,
          type: 'error',
        });
        return false;
      }
      if (!addressReg.test(row.address) && row.amount) {
        notify({
          text: `Incorrect address format in row: ${i + 1}`,
          type: 'error',
        });
        return false;
      }
    }
  } else {
    notify({
      text: 'Please enter transfer data',
      type: 'error',
    });
    return false;
  }
  if (totalTokens > walletStore.profile.balance) {
    notify({
      text: 'Insufficient funds',
      type: 'error',
    });
    return false;
  }
  return true;
};

export const validateLockDuration = (lockDuration) => {
  if (lockDuration === null) {
    notify({
      text: 'Please select lock duration',
      type: 'error',
    });
    return false;
  }

  if (getSeconds(lockDuration) <= 0) {
    notify({
      text: 'Duration expired, please select new',
      type: 'error',
    });
    return false;
  }
  return true;
}

export const chunk = (array, chunkSize) => { 
  // Create a plain object for housing our named properties: row1, row2, ...rowN
  let output=[];
  // Cache array.length
  let arrayLength = array.length;
  // Loop variables
  let arrayIndex = 0, chunkOrdinal = 1;
  // Loop over chunks
  while (arrayIndex < arrayLength) {
    // Use slice() to select a chunk. Note the incrementing operations.
    output.push([chunkOrdinal++, array.slice(arrayIndex, arrayIndex += chunkSize)]);
  }
  return output;
}