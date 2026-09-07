function HomeMedia({ media, className = '', alt = '', video = false }) {
  if (!media?.url) {
    return null
  }

  if (video || media.type === 'video') {
    return (
      <video
        className={`h-full w-full object-contain ${className}`}
        src={media.url}
        aria-label={alt || media.altText || ''}
        controls
        muted
        playsInline
        preload="metadata"
      />
    )
  }

  return (
    <img
      className={`h-full w-full object-contain ${className}`}
      src={media.url}
      alt={alt || media.altText || ''}
      loading="lazy"
    />
  )
}

export default HomeMedia
