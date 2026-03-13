---
title: Cloudflare CDN
description: Enable Cloudflare CDN in front of your application to improve performance, reduce latency, and protect against DDoS attacks.
template: doc
sidebar:
    order: 10
---

## Introduction

[Cloudflare](https://www.cloudflare.com) is a global CDN, reverse proxy, and security platform. Placing Cloudflare in front of your application lets you:

- Cache static assets at 300+ edge locations worldwide
- Terminate TLS and issue free certificates automatically
- Protect against DDoS attacks and bot traffic
- Apply custom rules, redirects, and header transforms at the edge
- Purge cached content on demand

This guide walks you through enabling Cloudflare CDN for an application — from DNS setup through to cache configuration and cache invalidation.

## Prerequisites

- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier is sufficient)
- A domain name you control
- Your application accessible via a public URL (origin)

## Step 1 — Add your domain to Cloudflare

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com) and click **Add a Site**.
2. Enter your domain (e.g. `example.com`) and click **Continue**.
3. Choose a plan — the **Free** plan covers CDN, SSL, and basic DDoS protection.
4. Cloudflare scans your existing DNS records and imports them. Review the list and click **Continue**.
5. Cloudflare assigns you two nameservers, for example:
   ```
   alice.ns.cloudflare.com
   bob.ns.cloudflare.com
   ```
6. Log in to your domain registrar and replace the current nameservers with the two Cloudflare nameservers.
7. Click **Done, check nameservers** in the Cloudflare dashboard.

Nameserver propagation typically takes a few minutes to a few hours. Cloudflare will send a confirmation email when your domain is active.

:::tip
You can verify propagation from the terminal:
```bash
dig NS example.com +short
```
The output should show the Cloudflare nameservers once propagation is complete.
:::

## Step 2 — Create a DNS record pointing to your origin

In the Cloudflare dashboard, navigate to **DNS → Records** and add an **A** or **CNAME** record for your application:

| Type  | Name | Content               | Proxy status |
|-------|------|-----------------------|--------------|
| A     | `@`  | `203.0.113.10`        | Proxied (orange cloud) |
| CNAME | `www` | `my-app.example.com` | Proxied (orange cloud) |

The **orange cloud** icon means traffic flows through Cloudflare's CDN and proxy. A grey cloud means DNS-only (no CDN).

:::note
To enable CDN, the proxy status **must** be set to **Proxied** (orange cloud). You can toggle it by clicking the cloud icon in the DNS record row.
:::

## Step 3 — Enable HTTPS

Cloudflare issues a free TLS certificate for your domain automatically. Configure the SSL/TLS mode under **SSL/TLS → Overview**:

| Mode          | Description |
|---------------|-------------|
| **Off**       | HTTP only — not recommended |
| **Flexible**  | HTTPS between visitor and Cloudflare; HTTP to your origin |
| **Full**      | HTTPS end-to-end; origin certificate can be self-signed |
| **Full (Strict)** | HTTPS end-to-end; origin must have a valid CA certificate |

**Recommended:** Use **Full (Strict)** if your origin already has a valid certificate (e.g. issued by Let's Encrypt). Use **Full** if your origin uses a self-signed certificate.

To force all traffic to HTTPS, enable **Always Use HTTPS** under **SSL/TLS → Edge Certificates**.

## Step 4 — Configure caching

Navigate to **Caching → Configuration** to control how Cloudflare caches your content.

### Cache level

| Setting | Behaviour |
|---------|-----------|
| **No query string** | Caches files regardless of query parameters |
| **Ignore query string** | Same file served for all query variants |
| **Standard** (default) | Treats different query strings as different resources |

### Browser Cache TTL

Controls the `Cache-Control: max-age` header sent to browsers. Set this to a high value for static assets:

- Static assets (JS, CSS, images): **1 year**
- HTML pages: **30 minutes** or less (to avoid stale pages after deploys)

### Cache Rules (recommended)

For fine-grained control, use **Cache Rules** under **Caching → Cache Rules**. Example — cache all static assets for 1 year:

1. Click **Create rule**.
2. **When incoming requests match:** `File extension equals js, css, png, jpg, svg, woff2, ico`
3. **Cache eligibility:** Eligible for cache
4. **Edge TTL:** Override to **1 year**
5. **Browser TTL:** Override to **1 year**
6. Click **Deploy**.

Example — bypass cache for API routes:

1. Click **Create rule**.
2. **When incoming requests match:** `URI path starts with /api`
3. **Cache eligibility:** Bypass cache
4. Click **Deploy**.

## Step 5 — Purge the cache

After deploying a new version of your application, purge Cloudflare's edge cache to serve fresh content.

### Purge everything (dashboard)

1. Go to **Caching → Configuration**.
2. Click **Purge Everything** and confirm.

### Purge specific URLs (dashboard)

1. Go to **Caching → Configuration**.
2. Click **Custom Purge**.
3. Enter the URLs or URL patterns to purge, one per line.

### Purge via API

Automate cache purging in your CI/CD pipeline using the Cloudflare API:

```bash
# Purge everything
curl -X POST "https://api.cloudflare.com/client/v4/zones/<ZONE_ID>/purge_cache" \
  -H "Authorization: Bearer <API_TOKEN>" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything": true}'

# Purge specific files
curl -X POST "https://api.cloudflare.com/client/v4/zones/<ZONE_ID>/purge_cache" \
  -H "Authorization: Bearer <API_TOKEN>" \
  -H "Content-Type: application/json" \
  --data '{
    "files": [
      "https://example.com/assets/main.js",
      "https://example.com/assets/main.css"
    ]
  }'
```

To get your **Zone ID**, open the **Overview** page of your domain in the Cloudflare dashboard — it is listed in the right-hand sidebar.

To create an **API Token**:

1. Go to **My Profile → API Tokens**.
2. Click **Create Token**.
3. Use the **Edit zone DNS** template or create a custom token with **Zone → Cache Purge → Purge** permission.

## Step 6 — Verify CDN is active

Send a request to your domain and inspect the response headers:

```bash
curl -I https://example.com/assets/main.js
```

Key headers to look for:

| Header | Meaning |
|--------|---------|
| `cf-ray: 7abc123-CDG` | Request was processed by Cloudflare (CDG = Paris PoP) |
| `cf-cache-status: HIT` | Response served from Cloudflare edge cache |
| `cf-cache-status: MISS` | Cache miss — response fetched from origin |
| `cf-cache-status: BYPASS` | Cache bypass rule matched |
| `server: cloudflare` | Cloudflare is proxying the request |

A `cf-cache-status: MISS` on first request followed by `HIT` on the next request confirms caching is working correctly.

## Optional — Page Rules and Transform Rules

### Redirect www to apex (or vice versa)

Under **Rules → Redirect Rules**, create a rule:

- **When:** `Hostname equals www.example.com`
- **Then redirect to:** `https://example.com${uri.path}` (301 Permanent)

### Add security headers

Under **Rules → Transform Rules → Modify Response Header**, add headers such as:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Referrer-Policy: strict-origin-when-cross-origin
```

### Rate limiting

Under **Security → WAF → Rate Limiting Rules**, create a rule to block IPs that exceed a request threshold — useful for protecting login endpoints or APIs.

## Troubleshooting

### `cf-cache-status` is always `DYNAMIC` or `BYPASS`

Your response headers may be preventing caching. Check that your origin does **not** send:

```
Cache-Control: no-store
Cache-Control: private
Set-Cookie: ...
```

Cloudflare will not cache responses that contain `Set-Cookie` headers unless you explicitly configure it to do so with a Cache Rule.

### SSL errors after switching nameservers

If you see SSL errors immediately after switching to Cloudflare, set the SSL/TLS mode to **Flexible** temporarily until the Cloudflare-issued certificate is fully provisioned (usually within 15 minutes), then switch to **Full** or **Full (Strict)**.

### Origin receives the visitor's IP as Cloudflare's IP

Because Cloudflare proxies all traffic, your origin logs will show Cloudflare IP ranges instead of visitor IPs. Cloudflare passes the real visitor IP in the `CF-Connecting-IP` header. Configure your web server to use this header for access logs:

**Nginx:**
```nginx
set_real_ip_from 103.21.244.0/22;
real_ip_header CF-Connecting-IP;
```

**Apache:**
```apache
RemoteIPHeader CF-Connecting-IP
```

The full list of Cloudflare IP ranges is available at [https://www.cloudflare.com/ips/](https://www.cloudflare.com/ips/).
