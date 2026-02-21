const adjectives = [
  "blue","fast","smart","cool","wild",
  "bright","silent","happy","bold","rapid"
]

const nouns = [
  "tiger","rocket","cloud","pixel","storm",
  "falcon","wave","shadow","spark","planet"
]

export function generateReadableSlug(): string {
  const adj =
    adjectives[Math.floor(Math.random() * adjectives.length)]

  const noun =
    nouns[Math.floor(Math.random() * nouns.length)]

  return `${adj}-${noun}`
}