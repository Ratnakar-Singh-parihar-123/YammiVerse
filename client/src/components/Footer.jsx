import React from "react";
import { Link } from "react-router-dom";
import Icon from "./AppIcon"; // ✅ apne path ke hisaab se adjust karna

function Footer() {
  return (
    <footer className="border-t border-border bg-gradient-to-b from-background via-muted/10 to-background text-foreground mt-16">
      <div className="container mx-auto px-6 py-12">
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12">
          {/* Brand Info */}
          <div className="max-w-sm">
            <h2 className="text-2xl font-heading font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              YammiVerse
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Discover, cook, and share amazing recipes with the world.  
              Crafted with <span className="text-primary">❤️</span> for food lovers everywhere.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-12">
            <div>
              <h3 className="font-semibold text-foreground mb-3">Explore</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  { path: "/", label: "Home" },
                  { path: "/favorites", label: "Favorites" },
                  { path: "/add-recipe", label: "Add Recipe" },
                ].map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="hover:text-primary transition relative after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-3">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  { path: "/about", label: "About Us" },
                  { path: "/contact", label: "Contact" },
                  { path: "/privacy", label: "Privacy Policy" },
                ].map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="hover:text-primary transition relative after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Divider Line */}
        <div className="mt-12 mb-6 h-[1px] w-full bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-muted-foreground">
            © {new Date().getFullYear()}{" "}
            <span className="text-primary font-semibold">YammiVerse</span>. All rights reserved.
          </p>

          {/* Social Icons */}
          <div className="flex gap-4">
            {[
              { href: "https://facebook.com", icon: "Facebook" },
              { href: "https://instagram.com", icon: "Instagram" },
              { href: "https://twitter.com", icon: "Twitter" },
            ].map((social) => (
              <a
                key={social.href}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all transform hover:scale-110 shadow-sm"
              >
                <Icon name={social.icon} size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;