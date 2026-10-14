import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Icon from "../../../components/AppIcon";

/* ------------------------
   Hook: Animated Counter
------------------------- */
const useCountUp = (end, duration = 1.5) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const target = Number(end) || 0;
    if (target === 0) {
      setCount(0);
      return;
    }
    const increment = target / (duration * 60); // ~60fps
    let animationFrame;
    const step = () => {
      start += increment;
      if (start < target) {
        setCount(Math.floor(start));
        animationFrame = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };
    step();
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  return count;
};

/* ------------------------
   Subcomponent: StatCard
   (Ensures Hook is called at top level of component)
------------------------- */
const StatCard = ({ stat, index }) => {
  const count = useCountUp(stat.value, 1.8);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.2, type: "spring" }}
      whileHover={{ scale: 1.03, y: -4 }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card/80 
                 backdrop-blur-md shadow-warm hover:shadow-warm-md transition-all cursor-default p-6"
    >
      {/* Gradient background effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-20`}
      />

      {/* Card Content */}
      <div className="relative flex items-center justify-between z-10">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1 tracking-wide">
            {stat.label}
          </p>
          <p className="text-3xl sm:text-4xl font-heading font-extrabold text-foreground drop-shadow-sm">
            {count.toLocaleString()}
          </p>
        </div>

        {/* Right Icon */}
        <div className="relative flex items-center justify-center">
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} 
                        flex items-center justify-center shadow-inner`}
          >
            <Icon
              name={stat.icon}
              size={26}
              className={`${stat.iconColor}`}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ------------------------
   Main QuickStats
------------------------- */
const QuickStats = ({ totalRecipes = 0, favoriteCount = 0, recentlyAdded = 0 }) => {
  const stats = [
    {
      id: "total",
      label: "Total Recipes",
      value: totalRecipes,
      icon: "BookOpen",
      iconColor: "text-primary",
      gradient: "from-primary/20 to-primary/40",
    },
    {
      id: "favorites",
      label: "Favorites",
      value: favoriteCount,
      icon: "Heart",
      iconColor: "text-destructive",
      gradient: "from-destructive/20 to-destructive/40",
    },
    {
      id: "recent",
      label: "Added This Week",
      value: recentlyAdded,
      icon: "Plus",
      iconColor: "text-success",
      gradient: "from-success/20 to-success/40",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
      {stats.map((stat, index) => (
        <StatCard key={stat.id} stat={stat} index={index} />
      ))}
    </div>
  );
};

export default QuickStats;