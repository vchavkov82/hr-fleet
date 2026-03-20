// @ts-check
import { defineConfig, envField, passthroughImageService } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightUtils from '@lorenzo_lewis/starlight-utils';
import starlightImageZoom from 'starlight-image-zoom';
import sitemap from '@astrojs/sitemap';
import starlightFullViewMode from 'starlight-fullview-mode';
import markdoc from '@astrojs/markdoc';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  server: { host: true, port: 5011 },
  site: 'https://docs.hr.svc.assistance.bg',

  integrations: [
    starlight({
      title: 'HR Docs',
      favicon: '/favicon.png',
      components: {
        Header: './src/components/Header.astro',
        Footer: './src/components/Footer.astro',
        Head: './src/components/HeadSEO.astro',
      },
      locales: {
        root: {
          label: 'English',
          lang: 'en',
        },
        bg: {
          label: 'Български',
          lang: 'bg',
        },
      },
      customCss: [
        './src/styles/global.css',
      ],
      expressiveCode: {
        themes: ['one-light', 'one-dark-pro'],
        styleOverrides: {
          borderRadius: '0.5rem',
        },
      },
      plugins: [
        // starlightImageZoom({
        //   showCaptions: true,
        // }),
        // starlightFullViewMode({
        //   leftSidebarEnabled: false,
        // }),
        // starlightUtils({
        //   multiSidebar: {
        //     switcherStyle: 'dropdown',
        //   },
        // }),
      ],
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Introduction', slug: 'index' },
            {
              label: 'Quickstart',
              autogenerate: { directory: 'getting-started' },
              collapsed: true,
            },
          ],
        },
        {
          label: 'Features',
          autogenerate: { directory: 'features' },
          collapsed: true,
        },
        {
          label: 'Integrations',
          autogenerate: { directory: 'integrations' },
          collapsed: true,
        },
        {
          label: 'API Reference',
          autogenerate: { directory: 'api' },
          collapsed: true,
        },
        {
          label: 'Enterprise',
          autogenerate: { directory: 'enterprise' },
          collapsed: true,
        },
        {
          label: 'Core Concepts',
          autogenerate: { directory: 'core-concepts' },
          collapsed: true,
        },
        {
          label: 'SDK & API Guides',
          autogenerate: { directory: 'sdk-guides' },
          collapsed: true,
        },
        {
          label: 'Odoo Integration',
          autogenerate: { directory: 'odoo-module' },
          collapsed: true,
        },
        {
          label: 'Security',
          autogenerate: { directory: 'security' },
          collapsed: true,
        },
        {
          label: 'Release Notes',
          autogenerate: { directory: 'release-notes' },
          collapsed: true,
        },
        {
          label: 'FAQ',
          autogenerate: { directory: 'faq' },
          collapsed: true,
        },
      ],
    }),
    markdoc(),
    react(),
    sitemap(),
  ],

  image: {
    service: passthroughImageService(),  // Disable Sharp; use CF Image Resizing at edge
  },

  vite: {
    plugins: [tailwindcss()],
    server: {
      // Allow LAN access via hostname (e.g. suse-09.lan.assistance.bg:5011)
      allowedHosts: ['localhost', 'suse-09.lan.assistance.bg', '.lan.assistance.bg', 'docs.hr.svc.assistance.bg'],
    },
  },

});
