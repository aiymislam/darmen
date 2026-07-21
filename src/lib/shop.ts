export type ShopItemId = 'diamond-gun' | 'respawn-potion' | 'invisibility-potion'

export type Inventory = {
  coins: number
  diamondGun: boolean
  respawnPotions: number
  invisibilityPotions: number
}

export const SHOP_PRICE = 90
export const LEVEL_REWARD = 10

export const emptyInventory: Inventory = {
  coins: 0,
  diamondGun: false,
  respawnPotions: 0,
  invisibilityPotions: 0,
}

export const loadInventory = (): Inventory => {
  try {
    const saved = localStorage.getItem('labyrinth-inventory')
    return saved ? { ...emptyInventory, ...JSON.parse(saved) as Partial<Inventory> } : emptyInventory
  } catch {
    return emptyInventory
  }
}

export const buyItem = (inventory: Inventory, item: ShopItemId): Inventory => {
  if (inventory.coins < SHOP_PRICE || (item === 'diamond-gun' && inventory.diamondGun)) return inventory
  const purchased = { ...inventory, coins: inventory.coins - SHOP_PRICE }
  if (item === 'diamond-gun') purchased.diamondGun = true
  if (item === 'respawn-potion') purchased.respawnPotions += 1
  if (item === 'invisibility-potion') purchased.invisibilityPotions += 1
  return purchased
}
