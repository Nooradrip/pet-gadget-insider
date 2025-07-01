import { notFound } from "next/navigation";
import Image from "next/image";
import Script from "next/script";
import Breadcrumbs from "@/components/Breadcrumbs";
import blogData from "@/data/blog-articles.json";
import sanitizeHtml from 'sanitize-html';
import type { Metadata, ResolvingMetadata } from "next";
import { getKeywords } from "@/lib/seo-utils";
import Link from "next/link";

// Type assertion for blogData
const typedBlogData = blogData as {
  mainCategories: {
    slug: string;
    name: string;
    titleTag: string;
    metaDescription: string;
    description: string;
  }[];
  subCategories: {
    mainCategorySlug: string;
    slug: string;
    name: string;
    titleTag: string;
    metaDescription: string;
    description: string;
  }[];
  articles: {
    slug: string;
    pageTitle: string;
    description: string;
    metaDescription: string;
    featuredImageUrl: string;
    featuredImageAlt: string;
    mainCategorySlug: string;
    mainCategoryName: string;
    subCategorySlug: string;
    subCategoryName: string;
    htmlBody: string;
    isPreformatted: boolean;
    amazon_link?: string;
    datePublished: string;
    dateModified: string;
    featuredImageHint?: string;
    titleTag?: string;
    author?: {
      name: string;
      url?: string;
      image?: string;
      sameAs?: string[];
    };
  }[];
  internalLinks?: {
    id: string;
    url: string;
    text: string;
    }[];
};

export async function generateStaticParams() {
  return typedBlogData.articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug.trim().toLowerCase();
  
  const article = typedBlogData.articles.find(
    (item) => item.slug.trim().toLowerCase() === slug
  );

  if (!article) {
    return {
      title: "Article Not Found",
      description: "The requested article could not be found",
    };
  }

  const previousKeywords = (await parent).keywords || [];
  const articleKeywords = getKeywords(article.mainCategorySlug.includes("dog"));

  return {
    metadataBase: new URL('https://petgadgetinsider.org'),
    title: article.titleTag || article.pageTitle,
    description: article.metaDescription || article.description,
    keywords: [...articleKeywords, ...previousKeywords],
    openGraph: {
      title: article.titleTag || article.pageTitle,
      description: article.metaDescription || article.description,
      images: [
        {
          url: article.featuredImageUrl,
          width: 800,
          height: 600,
          alt: article.featuredImageAlt,
        },
      ],
      publishedTime: article.datePublished,
      modifiedTime: article.dateModified || article.datePublished,
      authors: ['Nick Garcia'],
    },
    twitter: {
      card: "summary_large_image",
      title: article.titleTag || article.pageTitle,
      description: article.metaDescription || article.description,
      images: [article.featuredImageUrl],
    },
  };
}

export default async function BlogPostPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const slug = params.slug.trim().toLowerCase();
  
  const article = typedBlogData.articles.find(
    (item) => item.slug.trim().toLowerCase() === slug
  );

  if (!article) {
    notFound();
  }

  const addAsteriskToTopPick = (html: string) => {
    return html.replace(
      /(Pet Gadget Insider's Top Pick)/g, 
      '$1*'
    );
  };

  const parseInternalLinks = (html: string) => {
    const internalLinks = typedBlogData.internalLinks || [];
    const linkMap = new Map(
      internalLinks.map((link) => [link.id.toLowerCase(), link])
    );

    return html.replace(
      /<InternalLink\s+id=(["']?)([^"'\s>]+)\1\s*\/>/gi,
      (_, quoteChar, id) => {
        const normalizedId = id.toLowerCase();
        const link = linkMap.get(normalizedId);

        if (!link) {
          return `<span class="broken-link">[Broken Link: ${id}]</span>`;
        }

        return `<a href="${link.url}" class="internal-link">${link.text}</a>`;
      }
    );
  };

  const renderArticleContent = () => {
    try {
      let processedHtml = article.isPreformatted
        ? article.htmlBody
        : parseInternalLinks(article.htmlBody);
      
      processedHtml = addAsteriskToTopPick(processedHtml);
      
      // Add custom class to all H2 elements
      processedHtml = processedHtml.replace(
        /<h2(\s+[^>]*)?>/gi, 
        '<h2$1 class="blog-heading">'
      );
      
      const sanitizedHtml = sanitizeHtml(processedHtml, {
        allowedTags: [
          ...sanitizeHtml.defaults.allowedTags,
          'img', 'svg', 'path', 'line', 'rect', 'circle', 'g', 'text', 'tspan'
        ],
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          a: ['href', 'name', 'target', 'class', 'rel'],
          img: ['src', 'alt', 'width', 'height', 'class', 'style'],
          iframe: ['src', 'width', 'height', 'frameborder', 'allowfullscreen'],
          div: ['class', 'style'],
          span: ['class', 'style'],
          h2: ['class', 'style'],
          table: ['class', 'style', 'border'],
          thead: ['class', 'style', 'border'],
          tbody: ['class', 'style', 'border'],
          tr: ['class', 'style', 'border'],
          th: ['class', 'style', 'border'],
          td: ['class', 'style', 'border'],
          svg: ['width', 'height', 'viewbox', 'xmlns', 'class', 'style'],
          path: ['d', 'fill', 'stroke', 'stroke-width', 'class', 'style'],
          line: ['x1', 'y1', 'x2', 'y2', 'stroke', 'stroke-width', 'class', 'style'],
          rect: ['x', 'y', 'width', 'height', 'rx', 'ry', 'fill', 'stroke', 'stroke-width', 'class', 'style'],
          circle: ['cx', 'cy', 'r', 'fill', 'stroke', 'stroke-width', 'class', 'style'],
          g: ['transform', 'class', 'style'],
          text: ['x', 'y', 'text-anchor', 'class', 'style'],
          tspan: ['x', 'y', 'dx', 'dy', 'class', 'style']
        },
        allowedIframeHostnames: ['www.youtube.com', 'player.vimeo.com'],
        transformTags: {
          'a': (tagName, attribs) => {
            if (attribs.href && attribs.href.startsWith('http')) {
              return {
                tagName: 'a',
                attribs: {
                  ...attribs,
                  rel: 'noopener noreferrer nofollow',
                  target: '_blank'
                }
              };
            }
            return { tagName, attribs };
          }
        }
      });

      return (
        <div
          dangerouslySetInnerHTML={{
            __html: sanitizedHtml,
          }}
        />
      );
    } catch (error) {
      console.error("Error rendering content:", error);
      return <div className="text-red-500">Error loading content</div>;
    }
  };

  const generateFAQSchema = () => {
    if (!article.htmlBody) return null;

    const faqItems = [];
    const headingRegex = /<h2[^>]*>(.*?)<\/h2>/gi;
    const headingMatches = article.htmlBody.match(headingRegex) || [];

    for (let i = 0; i < headingMatches.length; i++) {
      const headingMatch = headingMatches[i];
      const headingContent = headingMatch.replace(/<[^>]+>/g, '').trim();
      
      const startIndex = article.htmlBody.indexOf(headingMatch) + headingMatch.length;
      let endIndex = article.htmlBody.length;
      
      if (i < headingMatches.length - 1) {
        endIndex = article.htmlBody.indexOf(headingMatches[i + 1], startIndex);
      }
      
      let answerContent = article.htmlBody.substring(startIndex, endIndex);
      answerContent = answerContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      
      if (answerContent) {
        faqItems.push({
          "@type": "Question",
          name: headingContent,
          acceptedAnswer: {
            "@type": "Answer",
            text: answerContent,
          },
        });
      }
    }

    return faqItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems,
        }
      : null;
  };

  const generateProductSchema = () => {
    if (!article.amazon_link) return null;
    const articleKeywords = getKeywords(
      article.mainCategorySlug.includes("dog")
    );

    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: article.pageTitle,
      description: article.metaDescription || article.description,
      image: article.featuredImageUrl,
      keywords: articleKeywords.join(", "),
      offers: {
        "@type": "Offer",
        url: article.amazon_link,
        priceCurrency: "USD",
        price: "0",
        availability: "https://schema.org/InStock",
        seller: {
          "@type": "Organization",
          name: "Amazon",
        },
      },
      brand: {
        "@type": "Brand",
        name: "Various Brands",
      },
    };
  };

  const generateAuthorSchema = () => {
    return {
      "@type": "Person",
      name: "Nick Garcia",
      url: "https://petgadgetinsider.org/about",
      image: "/images/nickgarcia.png"
    };
  };

  const faqSchema = generateFAQSchema();
  const productSchema = generateProductSchema();
  const authorSchema = generateAuthorSchema();

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-2xl blog-article">
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: article.pageTitle,
            description: article.metaDescription || article.description,
            image: {
              "@type": "ImageObject",
              url: article.featuredImageUrl,
              width: "720",
              height: "405",
              caption: article.featuredImageAlt,
            },
            datePublished: article.datePublished,
            dateModified: article.dateModified || article.datePublished,
            author: authorSchema,
            publisher: {
              "@type": "Organization",
              name: "Pet Gadget Insider",
              logo: {
                "@type": "ImageObject",
                url: "/images/Logo/pet-gadget-insider-logo.png",
                width: "300",
                height: "60",
              },
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://petgadgetinsider.org/blog/${article.slug}`,
            },
            articleSection: article.subCategoryName,
          }),
        }}
      />

      {faqSchema && (
        <Script
          id="faq-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema),
          }}
        />
      )}

      {productSchema && (
        <Script
          id="product-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productSchema),
          }}
        />
      )}

      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://petgadgetinsider.org",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Pet Supplies Reviews",
                item: "https://petgadgetinsider.org/blog",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: article.mainCategoryName,
                item: `https://petgadgetinsider.org/blog/category/${article.mainCategorySlug}`,
              },
              {
                "@type": "ListItem",
                position: 4,
                name: article.subCategoryName,
                item: `https://petgadgetinsider.org/blog/category/${article.mainCategorySlug}/${article.subCategorySlug}`,
              },
              {
                "@type": "ListItem",
                position: 5,
                name: article.pageTitle,
                item: `https://petgadgetinsider.org/blog/${article.slug}`,
              },
            ],
          }),
        }}
      />

      <div className="font-size-reduced">
        <Breadcrumbs
          links={[
            { href: "/", text: "Home" },
            { href: "/blog", text: "Pet Supplies Reviews" },
            {
              href: `/blog/category/${article.mainCategorySlug}`,
              text: article.mainCategoryName,
              prefetch: false,
            },
            {
              href: `/blog/category/${article.mainCategorySlug}/${article.subCategorySlug}`,
              text: article.subCategoryName,
              prefetch: false,
            },
          ]}
          currentPage={article.pageTitle}
        />

        <header className="mb-4">
          <h1 className="reset-font-size !text-4xl !md:text-5xl font-bold">
            {article.pageTitle}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 gap-2 sm:gap-4 mb-3 md:mb-4">
            <span>
              Published: {new Date(article.datePublished).toLocaleDateString()}
            </span>
            {article.dateModified && (
              <span>
                Updated: {new Date(article.dateModified).toLocaleDateString()}
              </span>
            )}
          </div>
        </header>

        <div className="mb-6 md:mb-8 rounded-lg overflow-hidden shadow-lg max-w-[90%] mx-auto aspect-video relative">
          <Image
            src={article.featuredImageUrl}
            alt={article.featuredImageAlt}
            fill
            className="object-contain"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
            unoptimized
          />
        </div>

        <div className="prose max-w-none">
          <div className="mb-2 text-base md:text-lg text-gray-700 dark:text-gray-300">
            {article.description}
          </div>
          {renderArticleContent()}
        </div>

        {article.amazon_link && (
          <div className="mt-6 md:mt-8 text-center">
            <a
              href={article.amazon_link}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-block bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              View on Amazon
            </a>
            <p className="text-xs text-gray-500 mt-2">
              (Disclosure: Affiliate link)
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 italic text-sm text-gray-600 dark:text-gray-400 author-note">
        <p>
          * Pet Gadget Insider uses data-driven technology to present the products 
          Amazon says are top-rated best sellers. Out of those, I choose one I think 
          you'll like the most. Once you've received it, let me know what you think! -{" "}
          <Link href="/about" className="text-amber-600 hover:text-amber-700">
            Nick
          </Link>
          , Pet Gadget Insider
        </p>
      </div>
    </div>
  );
}