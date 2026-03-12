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
  site: 'https://docs.jobshr.com',

  integrations: [
    starlight({
      title: 'HR Docs',
      favicon: '/favicon.png',
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
      allowedHosts: ['localhost', 'suse-09.lan.assistance.bg'],
    },
  },

});
