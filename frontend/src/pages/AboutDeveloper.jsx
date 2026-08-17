import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, Mail } from 'lucide-react'
import developerPhoto from '../assets/developer-photo.jpg'

const TOKENS = [
  {
    id: '01',
    label: 'Where I\u2019m from',
    body:
      'I grew up in Sopore, Baramulla, in Jammu & Kashmir \u2014 and that\u2019s still where I live and build from today.',
  },
  {
    id: '02',
    label: 'Education',
    body: 'B.Tech in Computer Science, North Campus, University of Kashmir.',
  },
  {
    id: '03',
    label: 'Why I built this',
    body:
      'I\u2019ve sat in enough clinic waiting rooms not knowing if I was next or an hour away to know how much that uncertainty wears people down. This app started as an answer to one problem \u2014 a way to see your place in line before you ever walk through the door.',
  },
  {
    id: '04',
    label: 'How I got here',
    body:
      'I built this on my own \u2014 the queue logic, the screens, every small detail \u2014 with the skills I\u2019ve picked up along the way, and with the help of God.',
  },
  {
    id: '05',
    label: 'What\u2019s next',
    body:
      'This is still growing. If you\u2019d like to help me finish it, or just want to see where it goes, I\u2019d love to hear from you.',
  },
]

export default function AboutDeveloper() {
  const navigate = useNavigate()

  return (
    <div
      className="min-h-screen min-h-[100dvh] flex justify-center"
      style={{ backgroundColor: '#F4F6F5' }}
    >
      <div className="w-full max-w-3xl flex flex-col">
        {/* Header */}
        <header className="flex items-center px-5 sm:px-8 pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ color: '#1B2430' }}
            aria-label="Back"
          >
            <ChevronLeft size={22} />
          </button>
          <span
            className="ml-2 text-[11px] font-semibold tracking-[0.18em] uppercase"
            style={{ color: '#2C5A56', fontFamily: "'IBM Plex Mono', monospace" }}
          >
            The person behind this app
          </span>
        </header>

        <main className="flex-1 px-5 sm:px-8 pb-16">
          {/* Hero: ticket-stub photo + intro */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start pt-2 pb-10">
            {/* Signature element: torn-edge token stub */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative shrink-0 w-56 sm:w-64"
            >
              <div
                className="relative overflow-hidden"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #1B2430',
                  borderRadius: '4px',
                }}
              >
                {/* Perforation notches */}
                <span
                  className="absolute left-[-9px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full"
                  style={{ backgroundColor: '#F4F6F5', border: '1.5px solid #1B2430' }}
                />
                <span
                  className="absolute right-[-9px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full"
                  style={{ backgroundColor: '#F4F6F5', border: '1.5px solid #1B2430' }}
                />


                <div
                  className="px-3 py-2.5"
                  style={{ borderTop: '1.5px dashed #1B2430' }}
                >
                  <p
                    className="text-[10px] tracking-[0.14em] uppercase font-semibold"
                    style={{ color: '#C1622D', fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    Token No. 001
                  </p>
                  <p
                    className="text-[10px] tracking-[0.14em] uppercase mt-0.5"
                    style={{ color: '#55606B', fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    Developer
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Name + quote */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center md:text-left"
            >
              <h1
                className="text-3xl sm:text-4xl leading-tight"
                style={{
                  color: '#1B2430',
                  fontFamily: "'Fraunces', serif",
                  fontWeight: 600,
                }}
              >
                Musharaf Hilal Tara
              </h1>
              <p
                className="text-sm mt-2"
                style={{ color: '#55606B', fontFamily: "'IBM Plex Mono', monospace" }}
              >
                Sopore, Baramulla &middot; Jammu &amp; Kashmir
              </p>

              <p
                className="mt-6 text-xl sm:text-2xl leading-snug max-w-md"
                style={{ color: '#1B2430', fontFamily: "'Fraunces', serif", fontWeight: 500 }}
              >
                &ldquo;I built this so no one has to stand in a clinic not
                knowing how long the wait really is.&rdquo;
              </p>
            </motion.div>
          </div>

          {/* Token list */}
          <div
            className="border-t"
            style={{ borderColor: 'rgba(27,36,48,0.12)' }}
          >
            {TOKENS.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="grid grid-cols-[auto_1fr] gap-4 sm:gap-6 py-6 border-b items-baseline"
                style={{ borderColor: 'rgba(27,36,48,0.12)' }}
              >
                <span
                  className="text-xs font-semibold tracking-[0.1em] whitespace-nowrap pt-0.5"
                  style={{ color: '#C1622D', fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  TOKEN {t.id}
                </span>
                <div>
                  <p
                    className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-1.5"
                    style={{ color: '#2C5A56', fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {t.label}
                  </p>
                  <p
                    className="text-[15px] leading-relaxed max-w-xl"
                    style={{ color: '#1B2430', fontFamily: "'Work Sans', sans-serif" }}
                  >
                    {t.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-10 rounded-2xl px-6 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            style={{ backgroundColor: '#1B2430' }}
          >
            <p
              className="text-sm leading-relaxed max-w-sm"
              style={{ color: '#F4F6F5', fontFamily: "'Work Sans', sans-serif" }}
            >
              Built with the help of God &mdash; and hopefully, with your help too.
            </p>
            <a
              href="mailto:you@example.com"
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full text-sm font-semibold shrink-0 transition-transform active:scale-[0.98]"
              style={{ backgroundColor: '#E3A857', color: '#1B2430' }}
            >
              <Mail size={16} />
              Get in touch
            </a>
          </motion.div>
        </main>
      </div>
    </div>
  )
}