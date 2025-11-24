import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WarehouseStore {
  selectedWarehouseId: string
  setSelectedWarehouseId: (id: string) => void
}

export const useWarehouseStore = create<WarehouseStore>()(
  persist(
    (set) => ({
      selectedWarehouseId: '',
      setSelectedWarehouseId: (id: string) => set({ selectedWarehouseId: id }),
    }),
    {
      name: 'warehouse-storage',
    }
  )
)