import { Book, Menu, Sunset, Trees, Zap, PenTool, Home, User, Mail } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navbar = ({
  logo = {
    url: "#",
    title: "ZephWrites",
  },
  menu = [
    { title: "Home", url: "#", icon: <Home className="size-5 shrink-0" /> },
    {
      title: "Resources",
      url: "#",
      items: [
        {
          title: "Tools",
          description: "Development tools and resources I recommend",
          icon: <Zap className="size-5 shrink-0" />,
          url: "#",
        },
        {
          title: "Books",
          description: "Recommended reading for developers and creators",
          icon: <Book className="size-5 shrink-0" />,
          url: "#",
        },
        {
          title: "Links",
          description: "Useful links and references",
          icon: <Sunset className="size-5 shrink-0" />,
          url: "#",
        },
        {
          title: "Blog Posts",
          description: "Technical articles and personal thoughts",
          icon: <PenTool className="size-5 shrink-0" />,
          url: "#",
        },
      ],
    },
    {
      title: "About",
      url: "#",
      icon: <User className="size-5 shrink-0" />
    },
  ],
  onNavigation
}) => {
  return (
    <section className="py-4 border-b border-border bg-card">
      <div className="container">
        {/* Desktop Menu */}
        <nav className="hidden justify-between lg:flex">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <a href={logo.url} className="flex items-center gap-3" onClick={() => onNavigation?.('home')}>
              <img 
                src="/MY.png" 
                alt="ZephWrites Logo" 
                className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
              />
              <div className="text-2xl font-bold font-playfair bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {logo.title}
              </div>
            </a>
            <div className="flex items-center">
              <NavigationMenu>
                <NavigationMenuList>
                  {menu.map((item) => renderMenuItem(item, onNavigation))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Button asChild size="sm">
              <a href="mailto:zephchizulu@gmail.com">
                <Mail className="size-4 mr-2" />
                Contact
              </a>
            </Button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href={logo.url} className="flex items-center gap-2" onClick={() => onNavigation?.('home')}>
              <img 
                src="/MY.png" 
                alt="ZephWrites Logo" 
                className="w-8 h-8 rounded-full object-cover border-2 border-primary/20"
              />
              <div className="text-xl font-bold font-playfair bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {logo.title}
              </div>
            </a>
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="size-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>
                      <a href={logo.url} className="flex items-center gap-2" onClick={() => onNavigation?.('home')}>
                        <img 
                          src="/MY.png" 
                          alt="ZephWrites Logo" 
                          className="w-8 h-8 rounded-full object-cover border-2 border-primary/20"
                        />
                        <div className="text-xl font-bold font-playfair bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                          {logo.title}
                        </div>
                      </a>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-6 p-4">
                    <Accordion
                      type="single"
                      collapsible
                      className="flex w-full flex-col gap-4"
                    >
                      {menu.map((item) => renderMobileMenuItem(item, onNavigation))}
                    </Accordion>

                    <div className="flex flex-col gap-3">
                      <Button asChild variant="outline">
                        <a href="mailto:zephchizulu@gmail.com">
                          <Mail className="size-4 mr-2" />
                          Contact Me
                        </a>
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const renderMenuItem = (item, onNavigation) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
        <NavigationMenuContent className="bg-popover text-popover-foreground">
          {item.items.map((subItem) => (
            <NavigationMenuLink asChild key={subItem.title} className="w-80">
              <SubMenuLink item={subItem} onNavigation={onNavigation} />
            </NavigationMenuLink>
          ))}
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem key={item.title}>
      <NavigationMenuLink
        href={item.url}
        className="bg-background hover:bg-muted hover:text-accent-foreground group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
        onClick={(e) => {
          if (item.title === 'Home') {
            e.preventDefault();
            onNavigation?.('home');
          }
        }}
      >
        {item.title}
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};

const renderMobileMenuItem = (item, onNavigation) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b-0">
        <AccordionTrigger className="text-md py-0 font-semibold hover:no-underline">
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-2">
          {item.items.map((subItem) => (
            <SubMenuLink key={subItem.title} item={subItem} onNavigation={onNavigation} />
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <a 
      key={item.title} 
      href={item.url} 
      className="text-md font-semibold flex items-center gap-2"
      onClick={(e) => {
        if (item.title === 'Home') {
          e.preventDefault();
          onNavigation?.('home');
        }
      }}
    >
      {item.icon}
      {item.title}
    </a>
  );
};

const SubMenuLink = ({ item, onNavigation }) => {
  return (
    <a
      className="hover:bg-muted hover:text-accent-foreground flex min-w-80 select-none flex-row gap-4 rounded-md p-3 leading-none no-underline outline-none transition-colors"
      href={item.url}
    >
      <div className="text-foreground">{item.icon}</div>
      <div>
        <div className="text-sm font-semibold">{item.title}</div>
        {item.description && (
          <p className="text-muted-foreground text-sm leading-snug">
            {item.description}
          </p>
        )}
      </div>
    </a>
  );
};

export { Navbar };