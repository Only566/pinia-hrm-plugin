<script setup lang="ts">
import { useCounterStore } from './counter'
import { storeToRefs } from 'pinia'

const counterStore = useCounterStore()
const { count } = storeToRefs(counterStore)
</script>

<template>
  <h1>Hello {{count}}</h1>
  <button>
    <span @click="counterStore.increment">Increment</span>
  </button>
  <button>
    <span @click="counterStore.throwError">Throw Error</span>
  </button>
</template>
