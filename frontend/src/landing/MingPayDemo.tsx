import { Stage, Phone, Avatar, Bar, Button, Roll, States, type Act } from '../stageshow/kit'
import SpeechBubble from '@/components/SpeechBubble'
import './ming-pay-demo.css'

// DormMing's Home on a phone, for the landing page. One thing happens:
// Benzel owes Vince, taps Pay, the debt rolls to ₱0, and Ming goes from
// worried to celebrating. It plays once when scrolled into view and rests on
// the payoff (also the poster under reduced motion), so it never has to rewind.
//
// Real strings: the greeting, Ming's line, Vince, the label, the amount, Pay.
// The dorm name, section title and Sydney's row are filler bars.

type S = { paid: boolean; happy: boolean }

const START: S = { paid: false, happy: false }
const DONE: S = { paid: true, happy: true }

const script = async (a: Act<S>) => {
  await a.wait(1400)
  a.mark('tap')
  await a.click('pay')
  a.put({ paid: true })
  // Ming reacts a beat after the number settles, so the cause reads first
  await a.wait(900)
  a.mark('mood')
  a.put({ happy: true })
  await a.wait(600)
}

export default function MingPayDemo() {
  return (
    <Stage<S>
      width={460}
      height={460}
      compact={{ below: 460, width: 358, height: 440 }}
      initial={START}
      poster={DONE}
      script={script}
      play="once"
      accent="#3f7a3d"
      cursor={{ at: { wide: { x: 330, y: 420 }, compact: { x: 280, y: 400 } }, style: 'touch' }}
      className="mpd"
    >
      {(s, _rect, layout) => (
        // The fade-crop: the phone sinks into the page at its foot instead of being cut off
        <div className="mpd-mask">
        <Phone width={layout === 'compact' ? 300 : 350} className="mpd-phone">
          <div className="mpd-screen">
            <img src="/brand/dormming-logo.png" alt="" className="mpd-logo" />

            <div className="mpd-greeting">
              <span className="mpd-ming" aria-hidden>
                <img src="/brand/ming/bust-worried.png" alt="" data-on={!s.happy || undefined} />
                <img src="/brand/ming/bust-celebrating.png" alt="" data-on={s.happy || undefined} />
              </span>
              <div className="mpd-greeting__text">
                <Bar w={84} h={7} r={4} style={{ background: "rgb(255 255 255 / 0.4)" }} />
                <div className="mpd-hello">Good evening, Benzel!</div>
                <SpeechBubble className="mpd-bubble">
                  {/* States stacks both lines in one box sized to the longer, so nothing clips while the font loads */}
                  <States align="start" value={s.happy ? 'happy' : 'worried'} states={{ worried: 'You owe Vince.', happy: 'All square. Nice!' }} />
                </SpeechBubble>
              </div>
            </div>

            <Bar w={112} h={9} r={4} tone={2} className="mpd-section" />

            <div className="mpd-row" data-paid={s.paid || undefined}>
              <Avatar name="Vince" size={40} />
              <div className="mpd-row__who">
                <div className="mpd-row__name">Vince</div>
                <div className="mpd-row__sub"><States align="start" value={s.paid ? 'paid' : 'owe'} states={{ owe: 'You owe', paid: 'Settled' }} /></div>
              </div>
              <div className="mpd-row__amount"><Roll>{s.paid ? '₱0.00' : '₱400.00'}</Roll></div>
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
              <Bar w={56} h={10} r={4} tone={2} />
            </div>
          </div>
        </Phone>
        </div>
      )}
    </Stage>
  )
}
