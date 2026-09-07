function SectionHeading({ eyebrow, title, description, align = 'center' }) {
  const alignment = {
    left: 'text-left',
    center: 'mx-auto text-center',
    right: 'ml-auto text-right',
  }

  const descriptionAlignment = {
    left: 'mx-0',
    center: 'mx-auto',
    right: 'ml-auto',
  }

  const eyebrowJustify = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }

  return (
    <div className={`mb-11 max-w-2xl ${alignment[align]}`}>
      {eyebrow && (
        <p className={`ornament-line mb-4 flex items-center text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-secondary)] ${eyebrowJustify[align]}`}>
          {eyebrow}
        </p>
      )}

      <h2 className="font-serif text-3xl leading-[1.05] text-[var(--color-text)] sm:text-4xl lg:text-[3.25rem]">
        {title}
      </h2>

      {description && (
        <p className={`${descriptionAlignment[align]} mt-4 max-w-2xl text-base leading-7 text-[var(--color-text-muted)] sm:text-lg`}>
          {description}
        </p>
      )}
    </div>
  )
}

export default SectionHeading
