/**
 * shot.mjs - full-page screenshots of the running dev server.
 *
 * Why this exists: `chrome --headless --screenshot` captures only the window,
 * and enlarging the window to capture more also enlarges `vh`, so a `100vh`
 * hero grows to fill whatever you asked for and you photograph the hero five
 * times. The only way to get a true full-page shot at a REAL viewport size is
 * Page.captureScreenshot with captureBeyondViewport, which is CDP-only.
 *
 * CDP is WebSocket-only and this project has no ws dependency (and Node 20 has
 * no global WebSocket), so there is a ~70-line RFC6455 client below. It speaks
 * just enough of the protocol for this job: masked text frames out, fragmented
 * binary/text frames in, 64-bit lengths for the multi-megabyte screenshots.
 *
 * Two modes:
 *   fullPage=1        one tall image of the whole document
 *   fullPage=<sel>    scroll that selector into view and shoot the viewport
 *
 * The second mode matters here: the page reveals most of its content through
 * GSAP ScrollTriggers, which never fire during a beyond-viewport capture because
 * nothing below the fold is ever "scrolled into" anything. Shooting a scrolled
 * viewport is what a visitor actually sees.
 *
 *   node scripts/shot/shot.mjs <url> <out.png> [width] [height] [fullPage|selector]
 */
import net from 'node:net'
import crypto from 'node:crypto'
import fs from 'node:fs'
import { execFileSync } from 'node:child_process'

const CHROME =
  process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const [url, out, w = '1440', h = '900', full = '1'] = process.argv.slice(2)
if (!url || !out) {
  console.error('usage: shot.mjs <url> <out.png> [w] [h] [fullPage 0|1]')
  process.exit(1)
}

const PORT = 9222 + (process.pid % 500)

// ---------------------------------------------------------------------------
// Minimal RFC6455 client
// ---------------------------------------------------------------------------
class WS {
  constructor(sock) {
    this.sock = sock
    this.buf = Buffer.alloc(0)
    this.frag = []
    this.handlers = []
    sock.on('data', (d) => this.onData(d))
  }

  static connect(wsUrl) {
    const u = new URL(wsUrl)
    return new Promise((resolve, reject) => {
      const sock = net.connect(Number(u.port), u.hostname, () => {
        const key = crypto.randomBytes(16).toString('base64')
        sock.write(
          `GET ${u.pathname}${u.search} HTTP/1.1\r\n` +
            `Host: ${u.host}\r\n` +
            `Upgrade: websocket\r\nConnection: Upgrade\r\n` +
            `Sec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\n\r\n`
        )
        const onHandshake = (d) => {
          const s = d.toString('latin1')
          const end = s.indexOf('\r\n\r\n')
          if (end < 0) return
          if (!/101/.test(s.slice(0, 20))) return reject(new Error('no upgrade: ' + s.slice(0, 80)))
          sock.removeListener('data', onHandshake)
          const ws = new WS(sock)
          // Anything Chrome pipelined after the handshake belongs to the socket.
          const rest = d.subarray(end + 4)
          if (rest.length) ws.onData(rest)
          resolve(ws)
        }
        sock.on('data', onHandshake)
      })
      sock.on('error', reject)
    })
  }

  send(obj) {
    const payload = Buffer.from(JSON.stringify(obj))
    const len = payload.length
    // Client frames must be masked.
    let head
    if (len < 126) head = Buffer.from([0x81, 0x80 | len])
    else if (len < 65536) {
      head = Buffer.alloc(4)
      head[0] = 0x81; head[1] = 0x80 | 126; head.writeUInt16BE(len, 2)
    } else {
      head = Buffer.alloc(10)
      head[0] = 0x81; head[1] = 0x80 | 127
      head.writeBigUInt64BE(BigInt(len), 2)
    }
    const mask = crypto.randomBytes(4)
    const masked = Buffer.from(payload)
    for (let i = 0; i < len; i++) masked[i] ^= mask[i % 4]
    this.sock.write(Buffer.concat([head, mask, masked]))
  }

  onData(d) {
    this.buf = Buffer.concat([this.buf, d])
    for (;;) {
      if (this.buf.length < 2) return
      const b0 = this.buf[0], b1 = this.buf[1]
      const fin = (b0 & 0x80) !== 0
      const op = b0 & 0x0f
      let len = b1 & 0x7f
      let off = 2
      if (len === 126) {
        if (this.buf.length < 4) return
        len = this.buf.readUInt16BE(2); off = 4
      } else if (len === 127) {
        if (this.buf.length < 10) return
        len = Number(this.buf.readBigUInt64BE(2)); off = 10
      }
      if (this.buf.length < off + len) return
      const payload = this.buf.subarray(off, off + len)
      this.buf = this.buf.subarray(off + len)
      if (op === 8) { this.sock.end(); return }        // close
      if (op === 9) continue                            // ping: Chrome doesn't need a pong here
      this.frag.push(Buffer.from(payload))
      if (!fin) continue
      const msg = Buffer.concat(this.frag).toString('utf8')
      this.frag = []
      try { this.handlers.forEach((fn) => fn(JSON.parse(msg))) } catch { /* non-JSON */ }
    }
  }
}

// ---------------------------------------------------------------------------
const chrome = execFileSync('bash', ['-c',
  `"${CHROME}" --headless=new --no-sandbox --hide-scrollbars --disable-lcd-text \
   --disable-gpu-vsync --remote-debugging-port=${PORT} --user-data-dir=$(mktemp -d) \
   about:blank > /dev/null 2>&1 & echo $!`]).toString().trim()

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function version() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`)
      if (r.ok) return await r.json()
    } catch { /* not up yet */ }
    await sleep(250)
  }
  throw new Error('Chrome never opened its debugging port')
}

try {
  const v = await version()
  const ws = await WS.connect(v.webSocketDebuggerUrl)

  let id = 0
  const pending = new Map()
  const events = []
  ws.handlers.push((m) => {
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id) }
    else if (m.method) events.push(m)
  })
  const cmd = (method, params = {}, sessionId) =>
    new Promise((resolve) => {
      const myId = ++id
      pending.set(myId, resolve)
      ws.send({ id: myId, method, params, ...(sessionId ? { sessionId } : {}) })
    })

  // Attach to a real page target.
  const { result: t } = await cmd('Target.createTarget', { url: 'about:blank' })
  const { result: s } = await cmd('Target.attachToTarget', { targetId: t.targetId, flatten: true })
  const sid = s.sessionId

  await cmd('Page.enable', {}, sid)
  await cmd('Emulation.setDeviceMetricsOverride',
    { width: +w, height: +h, deviceScaleFactor: 2, mobile: false }, sid)

  await cmd('Page.navigate', { url }, sid)
  // Wait for load, then a beat for fonts + lazy chunks + GSAP to settle.
  for (let i = 0; i < 80; i++) {
    if (events.some((e) => e.method === 'Page.loadEventFired')) break
    await sleep(100)
  }
  await sleep(2500)

  const isFull = full === '1'
  if (!isFull && full !== '0') {
    // Selector mode: scroll it to the top of the viewport, let ScrollTrigger
    // catch up, and shoot what is on screen.
    await cmd('Runtime.evaluate', {
      expression: `(() => {
        const el = document.querySelector(${JSON.stringify(full)});
        if (!el) return 'MISSING';
        const y = el.getBoundingClientRect().top + window.scrollY;
        document.documentElement.style.scrollBehavior = 'auto';
        window.scrollTo(0, y);
        return 'ok';
      })()`,
      returnByValue: true,
    }, sid)
    await sleep(1800)
  }

  const { result: shot } = await cmd('Page.captureScreenshot',
    { format: 'png', captureBeyondViewport: isFull, optimizeForSpeed: false }, sid)

  fs.writeFileSync(out, Buffer.from(shot.data, 'base64'))
  console.log(`${out}  (viewport ${w}x${h}, fullPage=${full})`)
} finally {
  try { process.kill(Number(chrome)) } catch { /* already gone */ }
}
process.exit(0)
