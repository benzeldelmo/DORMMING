import { Stage, Phone, Avatar, Bar, Button, Roll, States, type Act } from '../stageshow/kit'
import SpeechBubble from '@/components/SpeechBubble'
import Ming from '@/components/Ming'
import './ming-pay-demo.css'

// DormMing's Home on a phone, for the landing page, drawn like the real app:
// the greeting, Ming standing on the green cutting-mat band with his speech bubble
// overlapping it, the two balance cards, then a dormmate you owe.
// One thing happens: Benzel taps Pay, Vince's row settles, the "You owe" card rolls
// to ₱0 a beat later, and Ming goes from worried to celebrating. It plays once when
// scrolled into view and rests on the payoff (also the poster under reduced motion).
//
// Real strings: the greeting, Ming's line, the two card labels and amounts, Vince, Pay.
// The date line, dorm name and the last row are filler bars.

type S = { paid: boolean; total: boolean; happy: boolean }

const START: S = { paid: false, total: false, happy: false }
const DONE: S = { paid: true, total: true, happy: true }

const script = async (a: Act<S>) => {
  await a.wait(1400)
  a.mark('tap')
  await a.click('pay')
  a.put({ paid: true })
  // The total it feeds rolls a beat later, then Ming reacts: the cause reads first
  await a.wait(450)
  a.put({ total: true })
  await a.wait(700)
  a.mark('mood')
  a.put({ happy: true })
  await a.wait(600)
}

export default function MingPayDemo() {
  return (
    <Stage<S>
      width={460}
      height={540}
      compact={{ below: 460, width: 358, height: 500 }}
      initial={START}
      poster={DONE}
      script={script}
      play="once"
      accent="#3f7a3d"
      cursor={{ at: { wide: { x: 330, y: 500 }, compact: { x: 280, y: 470 } }, style: 'touch' }}
      className="mpd"
    >
      {(s, _rect, layout) => (
        // The fade-crop: the phone sinks into the page at its foot instead of being cut off
        <div className="mpd-mask">
          <Phone width={layout === 'compact' ? 304 : 356} className="mpd-phone">
            <div className="mpd-screen">
              <header className="mpd-head">
                <Bar w={96} h={7} r={4} tone={3} />
                <div className="mpd-hello">Good evening, Benzel!</div>
                <Bar w={70} h={8} r={4} tone={2} />
              </header>

              {/* The app's GreetingCard: band at the bottom, Ming on it, bubble overlapping its top */}
              <div className="mpd-greet">
                <div className="mpd-band cutting-mat" aria-hidden />
                <span className="mpd-ming" aria-hidden>
                  <span data-on={!s.happy || undefined}><Ming mood="WORRIED" /></span>
                  <span data-on={s.happy || undefined}><Ming mood="CELEBRATING" /></span>
                </span>
                <SpeechBubble tail="left" className="mpd-bubble">
                  <span className="mpd-bubble__who">Ming</span>
                  {/* States stacks both lines in one box sized to the longer, so nothing clips */}
                  <States align="start" value={s.happy ? 'happy' : 'worried'} states={{ worried: 'You owe Vince. Settle up?', happy: 'All square. Nice one!' }} />
                </SpeechBubble>
              </div>

              <div className="mpd-cards">
                <div className="mpd-card mpd-card--olive">
                  <span className="mpd-card__label">Owed to you</span>
                  <span className="mpd-card__amount">₱1,000</span>
                </div>
                <div className="mpd-card mpd-card--orange" data-clear={s.total || undefined}>
                  <span className="mpd-card__label">You owe</span>
                  <span className="mpd-card__amount"><Roll>{s.total ? '₱0' : '₱400'}</Roll></span>
                </div>
              </div>

              <div className="mpd-row" data-paid={s.paid || undefined}>
                <Avatar name="Vince" size={40} />
                <div className="mpd-row__who">
                  <div className="mpd-row__name">Vince</div>
                  <div className="mpd-row__sub"><States align="start" value={s.paid ? 'paid' : 'owe'} states={{ owe: 'You owe ₱400', paid: 'Settled' }} /></div>
                </div>
                <Button variant="primary" size="large" data-target="pay" data-cursor="pointer" className="mpd-pay">
                  {s.paid ? 'Paid' : 'Pay'}
                </Button>
              </div>

              <div className="mpd-row mpd-row--filler">
                <Avatar name="Sydney" size={40} />
                <div className="mpd-row__who">
                  <Bar w={64} h={9} r={4} tone={2} />
                  <Bar w={44} h={6} r={3} tone={3} />
                </div>
              </div>

              {/* Recent expenses, as filler: the phone fades out over them */}
              <Bar w={120} h={9} r={4} tone={2} className="mpd-section" />
              {[0, 1].map((i) => (
                <div key={i} className="mpd-row mpd-row--filler">
                  <span className="mpd-icon" />
                  <div className="mpd-row__who">
                    <Bar w={i ? 70 : 90} h={9} r={4} tone={2} />
                    <Bar w={110} h={6} r={3} tone={3} />
                  </div>
                </div>
              ))}
            </div>
          </Phone>
        </div>
      )}
    </Stage>
  )
}
