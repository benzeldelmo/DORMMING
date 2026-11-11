import { isoInDays } from '@/lib/dates'
import { Stage, Window } from '../stageshow/kit'
import { ArrowDownLeft, ArrowUpRight, CalendarDays, CreditCard, House, MessageCircleHeart, Plus, ReceiptText, Wallet } from 'lucide-react'
import GreetingCard from '@/components/GreetingCard'
import QuickActions from '@/components/QuickActions'
import { BalanceCard } from '@/components/BalanceCard'
import { BillRow } from '@/components/Rows'
import MingBust from '@/components/MingBust'

// A still of the desktop dashboard, built from the app's own components with demo data.
const ME = { displayName: 'Benzel', mingName: 'Ming' }
const BANNER = { text: 'Your Internet is due tomorrow!', myShareCentavos: 50000 }
const BILLS = [
  { id: 'i', name: 'Internet', category: 'INTERNET_LOAD', amountCentavos: 150000, dueDate: isoInDays(1), myShareCentavos: 50000, overdue: false },
  { id: 'w', name: 'Water', category: 'RENT_UTILITIES', amountCentavos: 100000, dueDate: '2026-11-17', myShareCentavos: 33334, overdue: false },
]
const SPEND = [['Food & Groceries', 470000, 'bg-olive'], ['Internet & Load', 150000, 'bg-orange'], ['Rent & Utilities', 100000, 'bg-[#e9b949]']] as const
const NAV = [[House, 'Home'], [ReceiptText, 'Expenses'], [CalendarDays, 'Bills'], [Wallet, 'Balances'], [MessageCircleHeart, 'Ask Ming'], [CreditCard, 'My card']] as const

export default function DesktopDemo() {
  return (
    <Stage width={960} height={540} compact={{ below: 560, width: 358, height: 420 }} initial={{}} className="dm-desk">
      {(_s, _rect, layout) => (
        <Window url="dormming.app/home" className="dm-desk__win" style={{ position: 'absolute', left: layout === 'compact' ? -230 : 32, top: 28, width: 1040, height: 640 }}>
          <div className="flex h-full bg-[#f6f6f3] text-[15px]">
            <aside className="flex w-[200px] shrink-0 flex-col gap-1 border-r border-black/5 bg-white px-3 py-4">
              <img src="/brand/dormming-logo.png" alt="" className="mb-3 ml-1 h-7 w-auto self-start" />
              <span className="mb-2 flex h-9 items-center justify-center gap-1.5 rounded-xl bg-olive text-[13px] font-semibold text-white"><Plus size={16} />New record</span>
              {NAV.map(([I, l], i) => (
                <span key={l} className={`flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-semibold ${i === 0 ? 'bg-olive-soft text-olive' : 'text-foreground/65'}`}><I size={16} />{l}</span>
              ))}
              <span className="mt-auto flex items-end gap-2 overflow-hidden rounded-xl bg-olive-soft px-2 pt-2"><MingBust className="w-12" /><span className="pb-2 text-[12px] font-bold">Mabini Hall 3B</span></span>
            </aside>
            <div className="min-w-0 flex-1 space-y-4 p-5">
              <GreetingCard me={ME} dormName="Mabini Hall 3B" mood="WORRIED" banner={BANNER} moodLine="" />
              <QuickActions />
              <div className="grid grid-cols-[1fr_300px] gap-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <BalanceCard tone="olive" icon={ArrowDownLeft} label="Owed to you" centavos={100000} caption="To collect" to="/signup" />
                    <BalanceCard tone="orange" icon={ArrowUpRight} label="You Owe" centavos={90000} caption="To repay" to="/signup" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="px-1 text-[15px] font-bold">Upcoming bills</p>
                  {BILLS.map((b) => <BillRow key={b.id} bill={b} />)}
                </div>
              </div>
              <div className="card-surface w-[56%] p-4">
                <p className="text-[12px] font-semibold text-muted-foreground">Dorm spent in November</p>
                <p className="text-[26px] font-extrabold">₱7,200.00</p>
                {SPEND.map(([l, v, c]) => (
                  <div key={l} className="mt-2"><div className="flex justify-between text-[12px]"><span>{l}</span><span className="font-semibold">₱{(v / 100).toLocaleString('en-US')}.00</span></div>
                    <div className="mt-1 h-1.5 rounded-full bg-secondary"><div className={`h-full rounded-full ${c}`} style={{ width: `${(v / 720000) * 100}%` }} /></div></div>
                ))}
              </div>
            </div>
          </div>
        </Window>
      )}
    </Stage>
  )
}
