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
    const increment = end / (duration * 60); // ~60fps
    const step = () => {
      start += increment;
      if (start < end) {
        setCount(Math.floor(start));
        requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    step();
  }, [end, duration]);
  return count;
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
      {stats.map((stat, index) => {
        const count = useCountUp(stat.value, 1.8);

        return (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2, type: "spring" }}
            whileHover={{ scale: 1.05, rotateX: 3, rotateY: -3 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 
                       backdrop-blur-md shadow-md hover:shadow-xl transition-all cursor-default p-6"
          >
            {/* Gradient background effect */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-30`}
            ></div>

            {/* Card Content */}
            <div className="relative flex items-center justify-between z-10">
              {/* Left text */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1 tracking-wide">
                  {stat.label}
                </p>
                <motion.p
                  key={stat.value}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, type: "spring" }}
                  className="text-4xl font-heading font-extrabold text-foreground drop-shadow-sm"
                >
                  {count.toLocaleString()}
                </motion.p>
              </div>

              {/* Right Icon with ring */}
              <div className="relative flex items-center justify-center">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.gradient} 
                              flex items-center justify-center shadow-inner`}
                >
                  <Icon
                    name={stat.icon}
                    size={28}
                    className={`${stat.iconColor}`}
                  />
                </div>

                {/* Subtle animated pulse ring */}
                <motion.span
                  className="absolute inline-flex h-16 w-16 rounded-full border-2 border-current opacity-30"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default QuickStats;