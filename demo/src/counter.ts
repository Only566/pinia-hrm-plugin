import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const increment = () => {
    count.value += 1
  }
  const throwError = () => {
    throw new Error('Error from store')
  }

  return { count, increment, throwError }
})
