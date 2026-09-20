# TT Timer

A hand stopwatch for rowing time trials, built to be used on a phone at the
water's edge by one person timing a field of crews.

Live at **https://tt.pengelly.co.nz**

## What it does

- Tap a crew's card to send it away; tap it again to stop it.
- The next crew and the crews on the course show as large cards; the queue
  and the finished crews sit below as small rows.
- Finished crews sort themselves into finishing order as they come in.
- A stroke rate pad across the bottom: tap on each catch, and it shows a
  rolling average over the last five strokes.
- Results screen with each crew's time away, time back and elapsed, and a
  CSV you can send through the phone's share sheet.

## Built to survive the day

- Every start and stop is written to local storage the instant it happens,
  and the race is rebuilt from that log on load. A refresh, a crash or a
  flat battery loses nothing.
- Times come from `performance.now()` measured against a single epoch
  recorded at load, anchored to the wall clock so they survive a reload.
- One `requestAnimationFrame` loop renders every clock on screen.
- The screen is kept awake while crews are on the course.
- Installs to the home screen and runs with no connectivity at all.

## Mis-tap protection

A crew card both starts and stops, so a stray tap would cost a time. Guards:

- The timestamp is taken when you press, but the action only commits when
  you lift, and only if your finger has not travelled — so a scroll that
  starts on a card cannot fire it.
- Every card is dead for 450 ms after any start or stop, because the cards
  reflow and the follow-up tap would otherwise land on a neighbour.
- Undo takes two taps and names what it is about to reverse.

## Stack

Vanilla JavaScript. No framework, no build step, no dependencies, and no web
fonts — it has to work with no signal, so there is nothing to fetch.

MIT licensed.
