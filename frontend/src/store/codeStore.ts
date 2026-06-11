import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { codeService } from '@/services';
import * as codeEnums from '@/utils/enums/codeEnums';

import type { Ref } from 'vue';
import type { Code, CodeTableName } from '@/types';

const codeNames = Object.keys(codeEnums) as CodeTableName[];
type CodeMap = Record<CodeTableName, Code[]>;

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
    codeList: computed<Record<CodeTableName, string[]>>(() =>
      codeNames.reduce(
        (acc, name) => {
          acc[name] = state.codes.value[name].map((r) => r.code);
          return acc;
        },
        {} as Record<CodeTableName, string[]>
      )
    ),
    // List of objects for display purposes, { code, display }
    codeDisplay: computed<Record<CodeTableName, Record<string, string>>>(() =>
      codeNames.reduce(
        (acc, name) => {
          acc[name] = state.codes.value[name].reduce(
            (e, { code, display }) => {
              e[code] = display;
              return e;
            },
            {} as Record<string, string> // nosonar
          );
          return acc;
        },
        {} as Record<CodeTableName, Record<string, string>>
      )
    ),
    // List of objects for definition purposes, { code, definition }
    codeDefinition: computed<Record<CodeTableName, Record<string, string>>>(() =>
      codeNames.reduce(
        (acc, name) => {
          acc[name] = state.codes.value[name].reduce(
            (e, { code, definition }) => {
              if (definition) {
                e[code] = definition;
              }
              return e;
            },
            {} as Record<string, string> // nosonar
          );
          return acc;
        },
        {} as Record<CodeTableName, Record<string, string>>
      )
    ),
    // Option objects for primevue select inputs
    options: computed<Record<CodeTableName, { value: string; label: string }[]>>(() =>
      codeNames.reduce(
        (acc, name) => {
          acc[name] = state.codes.value[name].map((r) => ({
            value: r.code,
            label: r.display
          }));
          return acc;
        },
        {} as Record<CodeTableName, { value: string; label: string }[]>
      )
    )
  };

  // Actions
  function setCode(name: CodeTableName, rows: Code[]) {
    state.codes.value[name] = rows;
  }

  function setCodes(data: CodeMap) {
    Object.entries(data).forEach(([k, v]) => setCode(k as CodeTableName, v as Code[])); // nosonar
  }

  async function init(): Promise<void> {
    const codeTableData = await codeService.getCodeTables();

    setCodes(codeTableData);
  }

  return {
    // State
    ...state,

    // Getters
    ...getters,

    // Actions
    init
  };
});

export default useCodeStore;
