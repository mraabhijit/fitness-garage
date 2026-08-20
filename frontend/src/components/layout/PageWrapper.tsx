import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export interface Breadcrumb {
  name: string
  path: string
}

export interface PageWrapperProps {
  title?: string
  description?: string
  ogImage?: string
  breadcrumbs?: Breadcrumb[]
  noindex?: boolean
  showNav?: boolean
  showFooter?: boolean
  className?: string
  children: React.ReactNode
}

const SITE_URL = 'https://fitnessgarage.com'
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.svg`
const DEFAULT_TITLE = 'Fitness Garage — Gym & Personal Training'
const DEFAULT_DESCRIPTION =
  'Fitness Garage is an elite dark industrial strength arena offering personal coaching, group fitness, and custom transformation programs.'

const setMeta = (name: string, content: string, attr = 'name') => {
  ;(
    document.querySelector(`meta[${attr}="${name}"]`) ??
    document.head.appendChild(Object.assign(document.createElement('meta'), { [attr]: name }))
  ).setAttribute('content', content)
}

const setLink = (rel: string, href: string) => {
  ;(
    document.querySelector(`link[rel="${rel}"]`) ??
    document.head.appendChild(Object.assign(document.createElement('link'), { rel }))
  ).setAttribute('href', href)
}

export const PageWrapper: React.FC<PageWrapperProps> = ({
  title,
  description,
  ogImage,
  breadcrumbs,
  noindex = false,
  showNav = true,
  showFooter = true,
  className = '',
  children,
}) => {
  const { pathname } = useLocation()
  const canonicalUrl = `${SITE_URL}${pathname === '/' ? '' : pathname}`
  const pageTitle = title ? `${title} — Fitness Garage` : DEFAULT_TITLE
  const pageDescription = description || DEFAULT_DESCRIPTION
  const ogImageUrl = ogImage || DEFAULT_OG_IMAGE

  useEffect(() => {
    document.title = pageTitle
    setLink('canonical', canonicalUrl)

    const metas: [string, string, string?][] = [
      ['description', pageDescription],
      ['robots', noindex ? 'noindex, nofollow' : 'index, follow'],
      ['og:title', pageTitle, 'property'],
      ['og:description', pageDescription, 'property'],
      ['og:url', canonicalUrl, 'property'],
      ['og:image', ogImageUrl, 'property'],
      ['og:image:width', '1200', 'property'],
      ['og:image:height', '630', 'property'],
      ['og:image:alt', pageTitle, 'property'],
      ['og:site_name', 'Fitness Garage', 'property'],
      ['og:type', 'website', 'property'],
      ['twitter:card', 'summary_large_image'],
      ['twitter:title', pageTitle],
      ['twitter:description', pageDescription],
      ['twitter:image', ogImageUrl],
    ]

    metas.forEach(([name, content, attr]) => {
      setMeta(name, content, attr)
    })
  }, [pageTitle, pageDescription, canonicalUrl, ogImageUrl, noindex])

  const breadcrumbSchema =
    breadcrumbs && breadcrumbs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
            ...breadcrumbs.map((b, i) => ({
              '@type': 'ListItem',
              position: i + 2,
              name: b.name,
              item: `${SITE_URL}${b.path}`,
            })),
          ],
        }
      : null

  return (
    <div className="flex flex-col min-h-screen bg-garage-black text-garage-white">
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      {showNav && <Navbar />}
      <main className={`flex-grow ${className}`}>{children}</main>
      {showFooter && <Footer />}
    </div>
  )
}
