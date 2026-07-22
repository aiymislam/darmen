export type ShopItemId = 'diamond-gun' | 'respawn-potion' | 'invisibility-potion'

export type Inventory = {
  coins: number
  diamondGun: boolean
  respawnPotions: number
  invisibilityPotions: number
  starterCoinsGranted: boolean
}

export const SHOP_PRICE = 90
export const LEVEL_REWARD = 10
export const STARTER_COINS = 90

export const emptyInventory: Inventory = {
  coins: STARTER_COINS,
  diamondGun: false,
  respawnPotions: 0,
  invisibilityPotions: 0,
  starterCoinsGranted: true,
}

export const loadInventory = (): Inventory => {
  try {
    const saved = localStorage.getItem('labyrinth-inventory')
    if (!saved) return emptyInventory
    const inventory = JSON.parse(saved) as Partial<Inventory>
    if (!inventory.starterCoinsGranted) {
      return {
        ...emptyInventory,
        ...inventory,
        coins: (inventory.coins ?? 0) + STARTER_COINS,
        starterCoinsGranted: true,
      }
    }
    return { ...emptyInventory, ...inventory }
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
