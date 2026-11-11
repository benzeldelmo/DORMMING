import { Stage, Phone, Notification, Roll, type Act } from '../stageshow/kit'
import { ArrowDownLeft, ArrowUpRight, BellRing, CalendarDays, Check, CreditCard, House, Plus, ReceiptText, Wallet, WalletCards, Wifi } from 'lucide-react'
import './hero-demo.css'

// DormMing's landing hero, phone only. Story in four beats:
// Home with Ming and the two balance cards (context), the Add expense quick action,
// a shared ₱300 expense is added for Benzel and Vince (action), and back on Home
// "Owed to you" rolls up while Ming celebrates (payoff). The loop resets with a
// cause: Vince pays his ₱150 back, a banner says so, and the card rolls down.
// Real strings: Hi, Benzel!, the bill banner, Owed to you / You Owe and their
// amounts, Add a record, Add expense, ₱300, Save, the payment banner.

type Screen = 'home' | 'add'
type S = { screen: Screen; sheet: boolean; amount: string; owed: number; toast: boolean; paid: boolean; mood: 'HAPPY' | 'CELEBRATING' }

const START: S = { screen: 'home', sheet: false, amount: '', owed: 1000, toast: false, paid: false, mood: 'HAPPY' }
const REST = { x: 300, y: 470 }

const script = async (a: Act<S>) => {
  await a.wait(1200)
  a.mark('open')
  await a.click('quick-add')
  a.put({ screen: 'add' })
  await a.wait(700)
  a.mark('type')
  await a.click('amount')
  await a.type('amount', '300', { interval: 160 })
  await a.wait(600)
  await a.click('save')
  a.mark('payoff')
  a.put({ screen: 'home', toast: true })
  await a.wait(500)
  a.put({ owed: 1150, mood: 'CELEBRATING' })
  await a.wait(2600)
  a.put({ toast: false })
  await a.move(REST)
  await a.wait(500)
  a.mark('reset')
  a.put({ paid: true })
  await a.wait(900)
  a.put({ owed: 1000, mood: 'HAPPY' })
  await a.wait(1800)
  a.put({ paid: false })
  await a.wait(700)
  await a.snap({ amount: '' })
}

const peso = (n: number) => n.toLocaleString('en-US')

function HomeScreen({ s }: { s: S }) {
  return (
    <div className="dm-home" data-back={s.screen !== 'home' || undefined}>
      <div className="dm-gcard">
        <img src="/brand/ming-bust.png" alt="" className={`dm-gcard__ming ming-${s.mood}`} />
        <div className="dm-gcard__body">
          <div className="dm-gcard__dorm">Mabini Hall 3B</div>
          <div className="dm-gcard__hi">Good evening, Benzel!</div>
          <div className="dm-bubble">
            <span className="dm-bubble__who">MING</span>
            <span className="dm-bubble__text">Your Internet is due tomorrow!</span>
            <span className="dm-bubble__sub">Your share: ₱500.00</span>
          </div>
        </div>
      </div>
      <div className="dm-quick">
        {[{ i: CreditCard, l: 'Add expense' }, { i: WalletCards, l: 'Record payment' }, { i: BellRing, l: 'Bill reminder' }, { i: ReceiptText, l: 'Split receipt' }].map(({ i: I, l }) => (
          <span key={l} className="dm-quick__tile" data-target={l === 'Add expense' ? 'quick-add' : undefined}><span className="dm-quick__icon"><I size={17} /></span>{l}</span>
        ))}
      </div>
      <div className="dm-cards">
        <div className="dm-card dm-card--olive">
          <span className="dm-card__label"><span className="dm-dot"><ArrowDownLeft size={12} strokeWidth={2.6} /></span>Owed to you</span>
          <span className="dm-card__amount"><span className="dm-peso">₱</span><Roll>{peso(s.owed)}</Roll></span>
        </div>
        <div className="dm-card dm-card--orange">
          <span className="dm-card__label"><span className="dm-dot dm-dot--orange"><ArrowUpRight size={12} strokeWidth={2.6} /></span>You Owe</span>
          <span className="dm-card__amount"><span className="dm-peso">₱</span>900</span>
        </div>
      </div>
      <div className="dm-section">Upcoming bills</div>
      <div className="dm-bill">
        <span className="dm-bill__icon"><Wifi size={18} /></span>
        <span className="dm-bill__text"><span className="dm-bill__name">Internet</span><span className="dm-line" style={{ width: 58 }} /></span>
        <span className="dm-bill__amt">₱1,500</span>
      </div>
      <div className="dm-bill dm-bill--quiet">
        <span className="dm-bill__icon" />
        <span className="dm-bill__text"><span className="dm-line" style={{ width: 70, height: 9 }} /><span className="dm-line" style={{ width: 96 }} /></span>
        <span className="dm-line" style={{ width: 52, height: 10 }} />
      </div>
    </div>
  )
}

function AddScreen({ s }: { s: S }) {
  return (
    <div className="dm-add" data-show={s.screen === 'add' || undefined}>
      <div className="dm-add__title">Add expense</div>
      <div className="dm-label">Amount</div>
      <div className="dm-amount" data-target="amount" data-cursor="ibeam">
        <span className="dm-amount__peso">₱</span>
        <span className="dm-amount__value">{s.amount || <span className="dm-amount__ph">0.00</span>}</span>
        {s.screen === 'add' && <span className="dm-caret" />}
      </div>
      <div className="dm-label">Split with</div>
      <div className="dm-chips">
        <span className="dm-chip" data-on><Check size={14} strokeWidth={3} />Me</span>
        <span className="dm-chip" data-on><Check size={14} strokeWidth={3} />Vince</span>
        <span className="dm-chip">Sydney</span>
      </div>
      <div className="dm-each">₱150.00 each</div>
      <div className="dm-save" data-target="save">Save expense</div>
    </div>
  )
}

export default function HeroDemo() {
  return (
    <Stage<S>
      width={420}
      height={560}
      compact={{ below: 420, width: 358, height: 520 }}
      initial={START}
      poster={{ ...START, owed: 1150, toast: true, mood: 'CELEBRATING' }}
      script={script}
      cursor={{ at: REST, style: 'touch' }}
      className="dm-stage"
    >
      {(s, _rect, layout) => (
        <Phone width={layout === 'compact' ? 330 : 360} className="dm-phone">
          <div className="dm-screen">
            <HomeScreen s={s} />
            <AddScreen s={s} />

            <div className="dm-scrim" data-show={s.sheet || undefined} />
            <div className="dm-sheet" data-show={s.sheet || undefined}>
              <div className="dm-sheet__title">Add a record</div>
              <div className="dm-action" data-target="add-expense">
                <span className="dm-action__icon"><CreditCard size={18} /></span>
                <span className="dm-action__text"><span className="dm-action__name">Add expense</span><span className="dm-line dm-line--olive" style={{ width: 120 }} /></span>
              </div>
              {[96, 110].map((w, i) => (
                <div key={i} className="dm-action dm-action--quiet">
                  <span className="dm-action__icon" />
                  <span className="dm-action__text"><span className="dm-line dm-line--olive" style={{ width: w, height: 10 }} /><span className="dm-line dm-line--olive" style={{ width: w + 20 }} /></span>
                </div>
              ))}
            </div>

            <div className="dm-toast" data-show={s.toast || undefined}><Check size={14} strokeWidth={3} />Expense saved</div>
            <div className="dm-notif" data-show={s.paid || undefined}>
              <Notification banner icon={<img src="/brand/icon.png" alt="" className="dm-notif__icon" />} title="DormMing" body="Vince paid you ₱150.00" />
            </div>

            <nav className="dm-nav" data-hide={s.screen !== 'home' || undefined}>
              <House size={20} className="dm-nav__on" />
              <ReceiptText size={20} />
              <span className="dm-plus" data-target="plus"><Plus size={22} strokeWidth={2.6} /></span>
              <CalendarDays size={20} />
              <Wallet size={20} />
            </nav>
          </div>
        </Phone>
      )}
    </Stage>
  )
}
