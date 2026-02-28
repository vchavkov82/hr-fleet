export const SITE = {
  website: "https://hr.svc.chavkov.com/",
  author: "HR Team",
  profile: "https://hr.svc.chavkov.com/",
  desc: "Практични съвети, тенденции и прозрения за HR професионалисти.",
  title: "HR",
  ogImage: "og-hr-blog.jpg",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: false,
  showBackButton: true,
  editPost: {
    enabled: false,
    text: "Edit page",
    url: "",
  },
  dynamicOgImage: true,
  dir: "ltr",
  lang: "bg",
  timezone: "Europe/Sofia",
} as const;
