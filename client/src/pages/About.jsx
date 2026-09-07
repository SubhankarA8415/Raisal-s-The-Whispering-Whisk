import { useEffect, useState } from 'react'
import Container from '../components/common/Container'
import Section from '../components/common/Section'
import SectionHeading from '../components/common/SectionHeading'
import Reveal from '../components/common/Reveal'
import Button from '../components/common/Button'
import { getAbout } from '../services/aboutService.js'

function About() {
  const [data, setData] = useState({ sections: [], team: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAbout().then((response) => setData(response?.data || { sections: [], team: [] })).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <main>
      <section className="relative overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-surface)] py-20 sm:py-28">
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--color-secondary)]">About Us</p>
            <h1 className="mt-4 text-5xl leading-tight sm:text-6xl lg:text-7xl">The people behind the bake.</h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[var(--color-text-muted)] sm:text-lg">Meet the people, story and values that make Raisal&apos;s Bakery what it is.</p>
          </div>
        </Container>
      </section>

      {!loading && data.sections.map((section, index) => (
        <Section key={section.id}>
          <Container>
            <Reveal>
              <div className={`${section.layout === 'split' ? 'grid items-center gap-12 lg:grid-cols-2 lg:gap-16' : 'mx-auto max-w-4xl text-center'}`}>
                {section.media && section.layout === 'split' && (
                  <div className={`overflow-hidden rounded-[2rem] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] ${index % 2 ? 'lg:order-2' : ''}`}>
                    <img src={section.media.url} alt={section.title} className="aspect-[4/3] h-full w-full object-contain" />
                  </div>
                )}
                <div className={section.layout === 'split' && index % 2 ? 'lg:order-1' : ''}>
                  <SectionHeading eyebrow={section.eyebrow} title={section.title} description={section.description} align={section.layout === 'split' ? 'left' : 'center'} />
                  {section.body && <div className="whitespace-pre-line text-base leading-8 text-[var(--color-text-muted)]">{section.body}</div>}
                </div>
                {section.media && section.layout !== 'split' && (
                  <div className="mt-10 overflow-hidden rounded-[2rem] bg-[var(--color-surface)] shadow-[var(--shadow-soft)]"><img src={section.media.url} alt={section.title} className="mx-auto max-h-[560px] w-full object-contain" /></div>
                )}
              </div>
            </Reveal>
          </Container>
        </Section>
      ))}

      <Section>
        <Container>
          <SectionHeading eyebrow="Our Team" title="The hands and hearts behind Raisal&apos;s Bakery" description="Every creation starts with people who care about the craft, the details and the experience we share with our customers." />
          {data.team.length > 0 ? (
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {data.team.map((member, index) => (
                <Reveal key={member.id} delay={index * 60}>
                  <article className="group h-full overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] transition-transform duration-300 hover:-translate-y-1">
                    <div className="aspect-[4/3] overflow-hidden bg-[var(--color-background)]">
                      {member.media ? <img src={member.media.url} alt={member.name} className="h-full w-full object-contain" /> : <div className="flex h-full items-center justify-center p-8 text-center text-sm opacity-50">Team photo will be added soon</div>}
                    </div>
                    <div className="p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-secondary)]">{member.role}</p>
                      <h3 className="mt-2 font-serif text-2xl">{member.name}</h3>
                      <p className="mt-4 text-sm leading-7 text-[var(--color-text-muted)]">{member.description}</p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center text-sm text-[var(--color-text-muted)]">Our team story is being prepared. Check back soon.</div>
          )}
        </Container>
      </Section>

      <section className="pb-20 sm:pb-28"><Container><div className="rounded-[2.5rem] bg-[var(--color-primary)] p-8 text-center text-white shadow-[var(--shadow-soft)] sm:p-12"><p className="text-sm font-semibold uppercase tracking-[0.2em] opacity-80">A little more sweetness</p><h2 className="mt-3 text-4xl sm:text-5xl">Made by people who love what they do.</h2><p className="mx-auto mt-4 max-w-2xl text-sm leading-7 opacity-80 sm:text-base">Explore our menu and discover the creations our team is proud to share.</p><div className="mt-7"><a href="/menu"><Button variant="secondary">Explore Our Menu</Button></a></div></div></Container></section>
    </main>
  )
}
export default About
