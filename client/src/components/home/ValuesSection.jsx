import Container from '../common/Container'
import Reveal from '../common/Reveal'

const values = [
  {
    icon: '♡',
    title: 'Homemade with Love',
    description: 'Every bake carries a little piece of our heart.',
  },
  {
    icon: '✦',
    title: 'Fresh Everyday',
    description: 'Freshly prepared with care for every order.',
  },
  {
    icon: '♧',
    title: 'Quality Ingredients',
    description: 'Thoughtfully chosen ingredients in every creation.',
  },
  {
    icon: '♡',
    title: 'Made for Every Occasion',
    description: 'Sweet treats for moments big and small.',
  },
]

function ValuesSection() {
  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-surface)]">
      <Container>
        <div className="grid grid-cols-2 divide-x divide-[var(--color-border)] md:grid-cols-4">
          {values.map((value, index) => (
            <Reveal key={value.title} delay={index * 90}>
              <div className="group px-4 py-8 text-center sm:px-6 lg:py-10">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-background)] text-2xl text-[var(--color-primary)] shadow-[var(--shadow-soft)] transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110">
                  {value.icon}
                </div>

                <h3 className="mt-4 text-lg text-[var(--color-text)] transition-transform duration-300 group-hover:-translate-y-0.5">
                  {value.title}
                </h3>

                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-[var(--color-text-muted)]">
                  {value.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

export default ValuesSection
