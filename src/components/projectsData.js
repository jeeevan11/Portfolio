// Projects shown in the scroll-cycle slot.
//
// `placeholder: true` marks a name that's reserved for a future project —
// the entry still renders + cycles like any other, but clicking it doesn't
// navigate anywhere (Projects.jsx swallows the click). Swap `link` for a
// real URL and drop the placeholder flag when the project ships.
//
// `featured: true` paints the name in wine on the slot (currently SG).
// `tags` floats a small caption above the name on hover.

const projectsData = [
  {
    key: 0,
    name: 'Social Gravity AI',
    link: 'https://socialgravity.ai/',
    year: 2026,
    tags: 'Founding Member · Paying users · Raising ↑↑↑',
    featured: true,
  },
  {
    key: 1,
    name: 'Nile',
    link: 'https://nile-theta.vercel.app',
    year: 2026,
  },
  {
    key: 2,
    name: 'Vellum',
    link: '#',
    year: 2026,
    placeholder: true,
  },
  {
    key: 3,
    name: 'Aurora',
    link: '#',
    year: 2026,
    placeholder: true,
  },
  {
    key: 4,
    name: 'Polaris',
    link: '#',
    year: 2025,
    placeholder: true,
  },
  {
    key: 5,
    name: 'Onyx',
    link: '#',
    year: 2025,
    placeholder: true,
  },
  {
    key: 6,
    name: 'Drift',
    link: '#',
    year: 2024,
    placeholder: true,
  },
  {
    key: 7,
    name: 'Quill',
    link: '#',
    year: 2024,
    placeholder: true,
  },
  {
    key: 8,
    name: 'Tessera',
    link: '#',
    year: 2024,
    placeholder: true,
  },
]

export default projectsData
