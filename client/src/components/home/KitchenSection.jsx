import Container from '../common/Container'
import Section from '../common/Section'
import SectionHeading from '../common/SectionHeading'
import Reveal from '../common/Reveal'

function KitchenSection({ items, media = {} }) {
  return <Section className="bg-[var(--color-surface)]"><Container><SectionHeading eyebrow="From Our Kitchen" title="Made by Hand, Made with Heart" description="A little glimpse into the care, creativity and love behind every treat." /><div className="grid gap-5 md:grid-cols-2">
    {items.map((item, index) => { const asset = media[`kitchen_${index + 1}`]; return <Reveal key={item.title} delay={index * 100}><div className={`group relative overflow-hidden rounded-3xl bg-[var(--color-background)] ${index === 0 || index === 3 ? 'aspect-[16/9]' : 'aspect-[4/3]'}`}>
      {asset?.url ? (asset.resourceType === 'video' ? <video className="h-full w-full object-contain" src={asset.url} muted loop autoPlay playsInline /> : <img className="h-full w-full object-contain" src={asset.url} alt={asset.altText || item.title} />) : <div className="placeholder-shimmer flex h-full items-center justify-center text-center text-[var(--color-text-muted)]"><div><p className="font-serif text-2xl">{index === 2 ? 'Video' : 'Image'}</p><p className="mt-2 text-sm">Cloudinary media placeholder</p></div></div>}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6 pt-16"><h3 className="font-serif text-xl text-white">{item.title}</h3><p className="mt-1 text-sm text-white/80">{item.description}</p></div>
    </div></Reveal> })}
  </div></Container></Section>
}
export default KitchenSection
