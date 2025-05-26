<script setup lang="ts">
import {useCounterStore, useCounterStore2} from './counter';
import { storeToRefs } from 'pinia'

const counterStore = useCounterStore()
const counterStore2 = useCounterStore2()
const { count } = storeToRefs(counterStore)
const { count: count2 } = storeToRefs(counterStore2)
</script>

<template>
  <h1>counter1 {{count}}</h1>
  <button>
    <span @click="counterStore.increment">Increment</span>
  </button>
  <button>
    <span @click="counterStore.throwError">Throw Error</span>
  </button>
  <h1>counter2 {{count2}}</h1>
  <button>
    <span @click="counterStore2.increment">Increment</span>
  </button>
  <button>
    <span @click="counterStore2.throwError">Throw Error</span>
  </button>
</template>
