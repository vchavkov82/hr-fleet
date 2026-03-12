# How Each AI Platform Picks Sources

Each AI search platform has its own search index, ranking logic, and content preferences.

Sources cited throughout: Princeton GEO study (KDD 2024), SE Ranking domain authority study, ZipTie content-answer fit analysis.

---

## The Fundamentals

Every AI platform shares three baseline requirements:

1. **Your content must be in their index**
2. **Your content must be crawlable** - AI bots need access via robots.txt
3. **Your content must be extractable** - AI systems pull passages, not pages

---

## Google AI Overviews

Google AI Overviews pull from Google's own index and lean heavily on E-E-A-T signals. They appear in roughly 45% of Google searches.

**What makes them different:** They already have your traditional SEO signals. The AI layer adds preference for content with cited sources and structured data. Including authoritative citations correlates with a 132% visibility boost, and authoritative tone adds 89%.

**Only about 15% of AI Overview sources overlap with conventional organic results.** Pages that wouldn't crack page 1 can still get cited with strong structured data and clear answers.

**What to focus on:**
- Schema markup is the single biggest lever (30-40% visibility boost)
- Build topical authority through content clusters with strong internal linking
- Include named, sourced citations in your content
- Author bios with real credentials matter
- Target "how to" and "what is" query patterns

---

## ChatGPT

ChatGPT's web search draws from a Bing-based index. Domain authority matters more here than other platforms.

**Key findings:** Authority and credibility signals account for ~40% of citation determinants. Sites with 350K+ referring domains average 8.4 citations per response. Content updated within 30 days gets cited ~3.2x more often.

**Content-answer fit is the most important signal** - how well your content's style matches ChatGPT's response format accounts for ~55% of citation likelihood.

**Where ChatGPT looks beyond your site:** Wikipedia (7.8%), Reddit (1.8%), Forbes (1.1%).

**What to focus on:**
- Invest in backlinks and domain authority
- Update competitive content at least monthly
- Structure content the way ChatGPT structures its answers
- Include verifiable statistics with named sources
- Clean heading hierarchy (H1 > H2 > H3)

---

## Perplexity

Always cites sources with clickable links. Most transparent AI search platform. Combines its own index with Google's.

**Unique preferences:**
- **FAQ Schema (JSON-LD)** - Pages with FAQ structured data get cited more
- **PDF documents** - Publicly accessible PDFs are prioritized
- **Publishing velocity** - Frequency matters more than keyword targeting
- **Self-contained paragraphs** - Prefers atomic, semantically complete paragraphs

**What to focus on:**
- Allow PerplexityBot in robots.txt
- Implement FAQPage schema on Q&A content
- Host PDF resources publicly
- Add Article schema with timestamps
- Write in clear, self-contained paragraphs
- Build deep topical authority in your niche

---

## Microsoft Copilot

Embedded across Microsoft's ecosystem. Relies entirely on Bing's index.

**What to focus on:**
- Submit to Bing Webmaster Tools
- Use IndexNow protocol for faster indexing
- Optimize page speed to under 2 seconds
- Write clear entity definitions
- Build presence on LinkedIn and GitHub
- Ensure Bingbot has full crawl access

---

## Claude

Uses Brave Search as its search backend. Extremely selective about what it cites.

**What to focus on:**
- Verify content appears in Brave Search results
- Allow ClaudeBot and anthropic-ai in robots.txt
- Maximize factual density - specific numbers, named sources, dated statistics
- Use clear, extractable structure with descriptive headings
- Cite authoritative sources within your content
- Aim to be the most factually accurate source on your topic

---

## Allowing AI Bots in robots.txt

```
User-agent: GPTBot           # OpenAI - powers ChatGPT search
User-agent: ChatGPT-User     # ChatGPT browsing mode
User-agent: PerplexityBot    # Perplexity AI search
User-agent: ClaudeBot        # Anthropic Claude
User-agent: anthropic-ai     # Anthropic Claude (alternate)
User-agent: Google-Extended   # Google Gemini and AI Overviews
User-agent: Bingbot          # Microsoft Copilot (via Bing)
Allow: /
```

You can safely block **CCBot** (Common Crawl) without affecting AI search citations, since it's only used for training dataset collection.

---

## Where to Start

1. **Google AI Overviews** first (45%+ of Google searches, build on existing SEO)
2. **ChatGPT** second (most-used standalone AI search)
3. **Perplexity** third (valuable for tech/research audiences)
4. **Copilot and Claude** as needed

**Actions that help everywhere:**
1. Allow all AI bots in robots.txt
2. Implement schema markup (FAQPage, Article, Organization at minimum)
3. Include statistics with named sources
4. Update content regularly
5. Use clear heading structure (H1 > H2 > H3)
6. Keep page load time under 2 seconds
7. Add author bios with credentials
