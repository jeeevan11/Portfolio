// Selected work. Name + metric tag + one vivid line. `link` opens in a new tab;
// entries without a public link set `placeholder: true` (rendered as plain text).
// `featured: true` paints the name in the highlight. `image` is the photo the
// left stamp swaps to when this item is level with it.

const projectsData = [
  {
    key: 0,
    name: 'Steward',
    link: 'https://github.com/jeeevan11/steward-app',
    tag: 'Live · ~74k LOC Python · 1,061 tests',
    desc: 'My phone never stops buzzing. Steward reads every email and WhatsApp, clears the noise, and wakes me only for the two that matter. 4,900 sorted, 95 ever sent.',
    featured: true,
    image: '/work/steward.jpg?v=2',
  },
  {
    key: 1,
    name: 'The Referee',
    link: 'https://huggingface.co/spaces/testingaccc/conflict-arbitration-env',
    tag: 'Meta × PyTorch · Top 100 of 35,000',
    desc: 'Two AI agents write code at once and quietly disagree, until it all breaks at the merge. This catches the fight before it starts. 87.5% right, against 33% for a coin flip.',
    image: '/work/the-referee.jpg?v=2',
  },
  {
    key: 2,
    name: 'Hospital Helper',
    link: 'https://huggingface.co/spaces/testingaccc/hospital-ed',
    tag: 'Meta × PyTorch · Top 100 of 35,000',
    desc: 'One open bed. Three people who need it. An AI that keeps its head and chooses, beating the rules a human wrote by hand, 78.85 to 68.43.',
    image: '/work/hospital-helper.jpg?v=2',
  },
  {
    key: 3,
    name: 'Drishti',
    link: '#',
    placeholder: true,
    tag: 'iQOO Hackathon · Special Honour',
    desc: 'A blind hand holds a banknote it cannot read. This says the number out loud, offline, in three languages. And when it is not sure, it stays silent rather than risk a wrong one.',
    image: '/work/drishti.jpg',
  },
  {
    key: 4,
    name: 'Nuska',
    link: '#',
    placeholder: true,
    tag: 'In progress',
    desc: 'A doctor says one line. Fifteen seconds later the patient is holding a clean prescription on WhatsApp. It can never invent a medicine or a dose.',
    image: '/work/nuska.jpg?v=2',
  },
  {
    key: 5,
    name: 'Mac Tools',
    link: '#',
    placeholder: true,
    tag: 'Swift · AppKit · menu-bar',
    desc: 'Little Swift apps I built for myself and never closed. A menu-bar meter that watches my Claude API spend tick up on a live sparkline, and WorldClock, a pure-AppKit clock that sips 7 to 10 MB.',
    image: '/work/mac-tools.jpg',
  },
  {
    key: 6,
    name: 'folio25',
    link: 'https://github.com/jeeevan11',
    tag: 'React · GSAP · WebGL',
    desc: 'This page. Built by hand in React and GSAP, down to the grain in the light and the sound under your cursor.',
    image: '/work/folio25.jpg?v=2',
  },
]

export default projectsData
