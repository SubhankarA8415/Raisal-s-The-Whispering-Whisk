function Section({ children, className = '' }) {
  return (
    <section className={`section-shell py-16 sm:py-20 lg:py-24 ${className}`}>
      {children}
    </section>
  )
}

export default Section
