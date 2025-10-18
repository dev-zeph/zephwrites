import { Logo, LogoImage, LogoText } from "@/components/logo";

const Footer = ({
  logo = {
    src: "/MY.png",
    alt: "ZephWrites",
    title: "ZephWrites",
    url: "/",
  },
  tagline = "Thoughts, stories, and ideas worth sharing.",
  menuItems = [
    {
      title: "Blog",
      links: [
        { text: "Latest Posts", url: "/" },
        { text: "Categories", url: "#" },
        { text: "Archive", url: "#" },
      ],
    },
    {
      title: "About",
      links: [
        { text: "About Me", url: "#" },
        { text: "Contact", url: "#" },
        { text: "Newsletter", url: "#" },
      ],
    },
    {
      title: "Connect",
      links: [
        { text: "Twitter", url: "#" },
        { text: "LinkedIn", url: "#" },
        { text: "GitHub", url: "#" },
      ],
    },
  ],
  copyright = "© 2025 ZephWrites. All rights reserved.",
  bottomLinks = [
    { text: "Privacy Policy", url: "#" },
    { text: "Terms of Service", url: "#" },
  ],
}) => {
  return (
    <section className="py-16 border-t border-border bg-muted">
      <div className="container">
        <footer>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
            <div className="col-span-1 md:col-span-2 mb-8 lg:mb-0">
              <div className="flex items-center gap-2">
                <Logo url={logo.url}>
                  <LogoImage
                    src={logo.src}
                    alt={logo.alt}
                    title={logo.title}
                    className="h-8"
                  />
                  <LogoText className="text-xl font-bold">{logo.title}</LogoText>
                </Logo>
              </div>
              <p className="mt-4 text-muted-foreground max-w-md">{tagline}</p>
            </div>
            {menuItems.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="mb-4 font-semibold text-foreground">{section.title}</h3>
                <ul className="text-muted-foreground space-y-3">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <a 
                        href={link.url}
                        className="hover:text-primary transition-colors duration-200 text-sm"
                      >
                        {link.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="text-muted-foreground mt-12 flex flex-col justify-between gap-4 border-t border-border pt-8 text-sm md:flex-row md:items-center">
            <p>{copyright}</p>
            <ul className="flex gap-6">
              {bottomLinks.map((link, linkIdx) => (
                <li key={linkIdx}>
                  <a 
                    href={link.url}
                    className="hover:text-primary transition-colors duration-200 underline underline-offset-4"
                  >
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </footer>
      </div>
    </section>
  );
};

export { Footer };