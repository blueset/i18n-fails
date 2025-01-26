<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/"
                >
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title><xsl:value-of select="/rss/channel/title"/> Feed</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
        <style type="text/css">
          @import url('/xslstyles.css')
        </style>
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
      </head>
      <body>
        <div class="head inner">
          <xsl:if test="/rss/channel/image">
            <a class="head_logo">
              <xsl:attribute name="href">
                <xsl:value-of select="/rss/channel/link"/>
              </xsl:attribute>
              <img>
                <xsl:attribute name="src">
                  <xsl:value-of select="/rss/channel/image/url"/>
                </xsl:attribute>
                <xsl:attribute name="title">
                  <xsl:value-of select="/rss/channel/title"/>
                </xsl:attribute>
              </img>
            </a>
          </xsl:if>
          <div class="head_main">
            <h1><xsl:value-of select="/rss/channel/title"/></h1>
            <p><xsl:value-of select="/rss/channel/description"/></p>
            <p><strong>This is an RSS feed</strong>. Subscribe by copying
            the URL from the address bar into your newsreader. Visit <a
            href="https://aboutfeeds.com">About Feeds
          </a> to learn more and get started. It’s free.</p>
            <a class="head_link" target="_blank">
              <xsl:attribute name="href">
                <xsl:value-of select="/rss/channel/link"/>
              </xsl:attribute>
              Visit Website &#x2192;
            </a>
          </div>
        </div>
        <xsl:if test="/rss/channel/atom:link[@rel='alternate']">
          <div class="links inner">
            <xsl:for-each select="/rss/channel/atom:link[@rel='alternate']">
              <a target="_blank">
                <xsl:attribute name="class">
                  <xsl:value-of select="@icon"/>
                </xsl:attribute>
                <xsl:attribute name="href">
                  <xsl:value-of select="@href"/>
                </xsl:attribute>
                <xsl:value-of select="@title"/>
              </a>
            </xsl:for-each>
          </div>
        </xsl:if>
        <xsl:for-each select="/rss/channel/item">
          <div class="item inner">
            <div class="item_meta">
              <span><xsl:value-of select="pubDate" /></span>
              <xsl:for-each select="category">
                <span><xsl:value-of select="." /></span>
              </xsl:for-each>
            </div>
            <h2>
              <a target="_blank">
                <xsl:attribute name="href">
                  <xsl:value-of select="link"/>
                </xsl:attribute>
                <xsl:value-of select="title"/>
              </a>
            </h2>
            <div class="text-3"><xsl:value-of select="description" disable-output-escaping="yes"/></div>
          </div>
          <hr class="inner" />
        </xsl:for-each>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>