import { NextResponse } from 'next/server';

export async function GET() {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  
  <!-- 主页 -->
  <url>
    <loc>https://apple-store-reviews-nu.vercel.app/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- API 文档 -->
  <url>
    <loc>https://apple-store-reviews-nu.vercel.app/api-docs</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- 多语言版本 -->
  <url>
    <loc>https://apple-store-reviews-nu.vercel.app/zh</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="en" href="https://apple-store-reviews-nu.vercel.app/"/>
    <xhtml:link rel="alternate" hreflang="zh-CN" href="https://apple-store-reviews-nu.vercel.app/zh"/>
    <xhtml:link rel="alternate" hreflang="ja" href="https://apple-store-reviews-nu.vercel.app/ja"/>
  </url>
  
  <url>
    <loc>https://apple-store-reviews-nu.vercel.app/ja</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="en" href="https://apple-store-reviews-nu.vercel.app/"/>
    <xhtml:link rel="alternate" hreflang="zh-CN" href="https://apple-store-reviews-nu.vercel.app/zh"/>
    <xhtml:link rel="alternate" hreflang="ja" href="https://apple-store-reviews-nu.vercel.app/ja"/>
  </url>
  
</urlset>`;

  return new NextResponse(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}