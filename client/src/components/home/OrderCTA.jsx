import Container from '../common/Container'
import Section from '../common/Section'
import Button from '../common/Button'
import Reveal from '../common/Reveal'
import { WHATSAPP_URL } from '../../config/siteConfig.js'

function OrderCTA() {
  return (
    <Section>
      <Container>
        <Reveal className="reveal-scale">
        <div className="group overflow-hidden rounded-[2rem] bg-[var(--color-primary)] px-6 py-12 text-center shadow-[var(--shadow-soft)] sm:px-10 lg:px-16 lg:py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
            Ready for Something Sweet?
          </p>

          <h2 className="mt-4 font-serif text-4xl leading-tight text-white sm:text-5xl">
            Let Us Bake Something
            <br />
            Special for You
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
            Explore our menu and connect with us to order your favorite
            homemade treats.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button
              variant="accent"
              disabled
            >
              Swiggy — Coming Soon
            </Button>

            <Button
              variant="accent"
              disabled
            >
              Zomato — Coming Soon
            </Button>

            {WHATSAPP_URL && (
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outlineLight">
                  WhatsApp Us
                </Button>
              </a>
            )}
          </div>
        </div>
        </Reveal>
      </Container>
    </Section>
  )
}

export default OrderCTA