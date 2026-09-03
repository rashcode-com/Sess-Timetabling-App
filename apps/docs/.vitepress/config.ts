import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['link', { rel: 'preconnect', href: 'https://cdn.jsdelivr.net' }],
    ['link', { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css' }],
    ['link', { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/webfonts/Vazirmatn-FD-font-face.css' }],
  ],

  markdown: {
    config(md) {
      const defaultFence = md.renderer.rules.fence!
      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx]
        const lang = token.info.trim()
        if (lang === 'mermaid') {
          const content = JSON.stringify(token.content)
          return `<Mermaid :graph='${content}' />`
        }
        return defaultFence(tokens, idx, options, env, self)
      }
    }
  },

  locales: {
    root: {
      label: 'فارسی',
      lang: 'fa-IR',
      dir: 'rtl',
      title: 'سامانه زمان‌بندی سس (SESS)',
      description: 'مستندات جامع فنی، راهنمای معماری و توسعه سیستم انتخاب واحد و زمان‌بندی دانشگاهی',
      themeConfig: {
        siteTitle: 'سامانه زمان‌بندی سس',

        nav: [
          { text: 'راهنمای شروع', link: '/guide/getting-started' },
          { text: 'معماری سیستم', link: '/architecture/core-first' },
          {
            text: 'پکیج‌ها و سرویس‌ها',
            items: [
              { text: 'هسته پردازشی (@sess/core)', link: '/packages/core' },
              { text: 'وب‌اپلیکیشن (@sess/web)', link: '/packages/web' },
              { text: 'گیت‌وی API لبه (@sess/api)', link: '/packages/api' },
              { text: 'کراولر پورتال (@sess/crawler)', link: '/services/crawler' },
              { text: 'سوئیت تست‌های E2E (@sess/e2e)', link: '/services/e2e' },
            ]
          },
          { text: 'استقرار و عملیات', link: '/deployment/guide' },
          { text: 'گیت‌هاب', link: 'https://github.com/rashcode-com/Sess-Timetabling-App' },
        ],

        sidebar: [
          {
            text: 'راهنمای پایه',
            collapsed: false,
            items: [
              { text: 'شروع سریع و نصب', link: '/guide/getting-started' },
              { text: 'معماری Core-First', link: '/architecture/core-first' },
            ]
          },
          {
            text: 'بسته‌ها و ماژول‌ها',
            collapsed: false,
            items: [
              { text: 'هسته مشترک (@sess/core)', link: '/packages/core' },
              { text: 'فرانت‌اند مدرن (@sess/web)', link: '/packages/web' },
              { text: 'سرویس لبه (@sess/api)', link: '/packages/api' },
              { text: 'کراولر پورتال (@sess/crawler)', link: '/services/crawler' },
              { text: 'تست‌های بصری E2E (@sess/e2e)', link: '/services/e2e' },
            ]
          },
          {
            text: 'استقرار و تولید',
            collapsed: false,
            items: [
              { text: 'راهنمای جامع استقرار و سرورها', link: '/deployment/guide' },
            ]
          }
        ],

        search: {
          provider: 'local',
          options: {
            translations: {
              button: {
                buttonText: 'جستجو در مستندات...',
                buttonAriaLabel: 'جستجو در مستندات'
              },
              modal: {
                noResultsText: 'نتیجه‌ای یافت نشد برای',
                resetButtonTitle: 'پاک کردن جستجو',
                footer: {
                  selectText: 'انتخاب',
                  navigateText: 'پیمایش',
                  closeText: 'بستن'
                }
              }
            }
          }
        },

        darkModeSwitchLabel: 'تم ظاهری',
        lightModeSwitchTitle: 'تغییر به تم روشن',
        darkModeSwitchTitle: 'تغییر به تم تاریک',
        sidebarMenuLabel: 'منوی فهرست',
        returnToTopLabel: 'بازگشت به بالا',
        outline: {
          label: 'در این صفحه',
          level: [2, 3]
        },
        aside: 'left',
        docFooter: {
          prev: 'صفحه قبل',
          next: 'صفحه بعد'
        },
        footer: {
          message: 'توسعه‌یافته برای دانشجویان دانشگاه شیراز و پورتال‌های دانشگاهی SESS',
          copyright: 'انتشار تحت مجوز MIT © ۲۰۲۶ Sess-Timetabling-App'
        }
      }
    },

    en: {
      label: 'English',
      lang: 'en-US',
      dir: 'ltr',
      link: '/en/',
      title: 'SESS Timetabling System',
      description: 'Comprehensive technical documentation, architecture guide, and course scheduling portal',
      themeConfig: {
        siteTitle: 'SESS Timetabling App',

        nav: [
          { text: 'Getting Started', link: '/en/guide/getting-started' },
          { text: 'Architecture', link: '/en/architecture/core-first' },
          {
            text: 'Packages & Services',
            items: [
              { text: 'Shared Core (@sess/core)', link: '/en/packages/core' },
              { text: 'Modern Frontend (@sess/web)', link: '/en/packages/web' },
              { text: 'Edge Gateway (@sess/api)', link: '/en/packages/api' },
              { text: 'Portal Crawler (@sess/crawler)', link: '/en/services/crawler' },
              { text: 'E2E Visual Tests (@sess/e2e)', link: '/en/services/e2e' },
            ]
          },
          { text: 'Deployment', link: '/en/deployment/guide' },
          { text: 'GitHub', link: 'https://github.com/rashcode-com/Sess-Timetabling-App' },
        ],

        sidebar: [
          {
            text: 'Foundation Guide',
            collapsed: false,
            items: [
              { text: 'Quick Start & Setup', link: '/en/guide/getting-started' },
              { text: 'Core-First Architecture', link: '/en/architecture/core-first' },
            ]
          },
          {
            text: 'Packages & Modules',
            collapsed: false,
            items: [
              { text: 'Shared Core (@sess/core)', link: '/en/packages/core' },
              { text: 'Modern Frontend (@sess/web)', link: '/en/packages/web' },
              { text: 'Edge Gateway (@sess/api)', link: '/en/packages/api' },
              { text: 'Portal Crawler (@sess/crawler)', link: '/en/services/crawler' },
              { text: 'E2E Visual Tests (@sess/e2e)', link: '/en/services/e2e' },
            ]
          },
          {
            text: 'Deployment & Operations',
            collapsed: false,
            items: [
              { text: 'Comprehensive Deployment Guide', link: '/en/deployment/guide' },
            ]
          }
        ],

        search: {
          provider: 'local',
          options: {
            translations: {
              button: {
                buttonText: 'Search documentation...',
                buttonAriaLabel: 'Search documentation'
              },
              modal: {
                noResultsText: 'No results found for',
                resetButtonTitle: 'Reset search',
                footer: {
                  selectText: 'Select',
                  navigateText: 'Navigate',
                  closeText: 'Close'
                }
              }
            }
          }
        },

        darkModeSwitchLabel: 'Appearance',
        lightModeSwitchTitle: 'Switch to light mode',
        darkModeSwitchTitle: 'Switch to dark mode',
        sidebarMenuLabel: 'Menu',
        returnToTopLabel: 'Back to top',
        outline: {
          label: 'On this page',
          level: [2, 3]
        },
        docFooter: {
          prev: 'Previous page',
          next: 'Next page'
        },
        footer: {
          message: 'Crafted for Shiraz University & SESS Academic Portals',
          copyright: 'Released under the MIT License © 2026 Sess-Timetabling-App'
        }
      }
    }
  }
})
