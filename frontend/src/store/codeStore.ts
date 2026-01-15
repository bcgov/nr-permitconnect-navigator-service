import { defineStore } from 'pinia';
import { computed, readonly, ref } from 'vue';

import { codeService } from '@/services';

import type { Ref } from 'vue';
import type { Code } from '@/types';

// Add new code tables here, name refers to returns from service call
const codeNames = [
  'ElectrificationProjectCategory',
  'ElectrificationProjectType',
  'EscalationType',
  'SourceSystem'
] as const;

export type CodeName = (typeof codeNames)[number];
export type CodeMap = Record<CodeName, Code[]>;

const initialCodeMap = codeNames.reduce<CodeMap>((acc, name) => {
  acc[name] = [];
  return acc;
}, {} as CodeMap);

export interface CodeStoreState {
  codes: Ref<CodeMap>;
}

export const useCodeStore = defineStore('code', () => {
  // State
  const state: CodeStoreState = {
    codes: ref(initialCodeMap)
  };

  // Getters
  const getters = {
    // List of codes for each code table
    codeList: computed<Record<CodeName, string[]>>(() =>
      codeNames.reduce(
        (acc, name) => {
          acc[name] = state.codes.value[name].map((r) => r.code);
          return acc;
        },
        {} as Record<CodeName, string[]>
      )
    ),
    // List of objects for display purposes, { code, display }
    codeDisplay: computed<Record<CodeName, Record<string, string>>>(() =>
      codeNames.reduce(
        (acc, name) => {
          acc[name] = state.codes.value[name].reduce(
            (e, { code, display }) => {
              e[code] = display;
              return e;
            },
            {} as Record<string, string>
          );
          return acc;
        },
        {} as Record<CodeName, Record<string, string>>
      )
    ),
    // Enum like objects for comparisons and validation
    enums: computed<Record<CodeName, Record<string, string>>>(() =>
      codeNames.reduce(
        (acc, name) => {
          acc[name] = state.codes.value[name].reduce(
            (e, { code }) => {
              e[code] = code;
              return e;
            },
            {} as Record<string, string>
          );
          return acc;
        },
        {} as Record<CodeName, Record<string, string>>
      )
    ),
    // Option objects for primevue select inputs
    options: computed<Record<CodeName, { value: string; label: string }[]>>(() =>
      codeNames.reduce(
        (acc, name) => {
          acc[name] = state.codes.value[name].map((r) => ({
            value: r.code,
            label: r.display
          }));
          return acc;
        },
        {} as Record<CodeName, { value: string; label: string }[]>
      )
    )
  };

  // Actions
  function setCode(name: CodeName, rows: Code[]) {
    state.codes.value[name] = rows;
  }

  function setCodes(data: CodeMap) {
    Object.entries(data).forEach(([k, v]) => setCode(k as CodeName, v as Code[]));
  }

  async function init(): Promise<void> {
    const codeTableData = (await codeService.getCodeTables()).data;

    setCodes(codeTableData);
  }

  return {
    // State
    state: readonly(state),

    // Getters
    ...getters,

    // Actions
    init
  };
});

export default useCodeStore;
