import React from "react";
import { Link } from "react-router-dom";
import Icon from "../AppIcon";

const NavigationLogo = () => {
  return (
    <Link
      to="/"
      className="flex items-center gap-3 group transition-transform hover:scale-105"
    >
      {/* Logo Icon */}
      <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-primary to-primary/70 shadow-md">
        <Icon
          name="ChefHat"
          size={26}
          color="var(--color-primary-foreground)"
        />
      </div>

      {/* Logo Text */}
      <div className="flex flex-col leading-tight">
        <span className="text-lg sm:text-xl font-extrabold font-heading text-foreground tracking-tight group-hover:text-primary transition-colors">
          YammiVerse
        </span>
        <span className="text-[11px] sm:text-xs font-medium text-muted-foreground">
          Your Culinary Collection
        </span>
      </div>
    </Link>
  );
};

export default NavigationLogo;