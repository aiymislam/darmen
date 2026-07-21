import { SHOP_PRICE } from '../lib/shop'
import type { Inventory, ShopItemId } from '../lib/shop'

type Props = {
  inventory: Inventory
  open: boolean
  onBuy: (item: ShopItemId) => void
  onClose: () => void
}

const items: Array<{ id: ShopItemId; icon: string; name: string; description: string }> = [
  { id: 'diamond-gun', icon: '💎', name: 'Diamond Gun', description: 'A permanent monster-stunning weapon.' },
  { id: 'respawn-potion', icon: '❤️', name: 'Respawn Potion', description: 'Automatically revives you when caught.' },
  { id: 'invisibility-potion', icon: '👻', name: 'Invisibility Potion', description: 'Hides you from the monster for 10 seconds.' },
]

export function GameShop({ inventory, open, onBuy, onClose }: Props) {
  if (!open) return null
  return <div className="overlay shop-overlay"><section className="shop-card">
    <button className="shop-close" onClick={onClose} aria-label="Close shop">×</button>
    <p className="kicker">SUPPLY SHOP</p>
    <h2>Spend your coins</h2>
    <p className="shop-balance">🪙 {inventory.coins} coins</p>
    <div className="shop-grid">{items.map((item) => {
      const owned = item.id === 'diamond-gun' && inventory.diamondGun
      return <article className="shop-item" key={item.id}>
        <span className="shop-icon">{item.icon}</span><h3>{item.name}</h3><p>{item.description}</p>
        <button disabled={owned || inventory.coins < SHOP_PRICE} onClick={() => onBuy(item.id)}>
          {owned ? 'OWNED' : `BUY · ${SHOP_PRICE} 🪙`}
        </button>
      </article>
    })}</div>
  </section></div>
}
