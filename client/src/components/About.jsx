import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Icon from "./AppIcon";
import TopNavigation from "./ui/TopNavigation";

const AboutSection = () => {
  return (
    <>
      <TopNavigation />
      <section className="relative py-20 sm:py-28 bg-gradient-to-b from-background via-muted/20 to-background overflow-hidden">
        <div className="container mx-auto px-6 sm:px-12 lg:px-20 relative z-10">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground drop-shadow-sm">
              About{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-pink-500 to-orange-400">
                YammiVerse
              </span>
            </h2>
            <div className="mt-4 w-24 h-1 bg-gradient-to-r from-primary to-orange-400 rounded-full mx-auto" />
            <p className="mt-6 max-w-2xl mx-auto text-muted-foreground text-base sm:text-lg leading-relaxed">
              A modern platform where food lovers{" "}
              <span className="font-semibold text-foreground">
                discover, cook, and share
              </span>{" "}
              recipes with the world 🌍
            </p>
          </motion.div>

          {/* 3 Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Mission */}
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="bg-card/60 backdrop-blur-md border border-border rounded-2xl p-8 shadow-lg hover:shadow-xl hover:border-primary/50 transition"
            >
              <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-primary/10 text-primary mb-6">
                <Icon name="Target" size={28} />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Our Mission
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To connect foodies worldwide by making it simple to find
                authentic recipes, cook them with ease, and share your own
                kitchen creations with the community.
              </p>
            </motion.div>

            {/* Community */}
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="bg-card/60 backdrop-blur-md border border-border rounded-2xl p-8 shadow-lg hover:shadow-xl hover:border-success/50 transition"
            >
              <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-success/10 text-success mb-6">
                <Icon name="Users" size={28} />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Community
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Join a growing family of passionate cooks who{" "}
                <span className="font-semibold text-foreground">
                  exchange tips, tricks, and love for food
                </span>
                . From beginners to master chefs, everyone has a place here.
              </p>
            </motion.div>

            {/* Innovation */}
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="bg-card/60 backdrop-blur-md border border-border rounded-2xl p-8 shadow-lg hover:shadow-xl hover:border-warning/50 transition"
            >
              <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-warning/10 text-warning mb-6">
                <Icon name="Sparkles" size={28} />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Innovation
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Smart recipe filters, AI-powered suggestions, and personalized
                dashboards make your cooking journey{" "}
                <span className="font-semibold text-foreground">
                  easier & fun
                </span>
                .
              </p>
            </motion.div>
          </div>

          {/* Quote Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-20 text-center max-w-3xl mx-auto"
          >
            <blockquote className="italic text-lg sm:text-xl text-muted-foreground leading-relaxed">
              “Good food is the foundation of genuine happiness. At{" "}
              <span className="text-primary font-semibold">YammiVerse</span>, we
              believe every recipe has a story to tell.”
            </blockquote>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Link
              to="/add-recipe"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-primary via-pink-500 to-orange-400 text-white font-semibold hover:scale-105 transform transition shadow-lg"
            >
              <Icon name="Plus" size={20} />
              Add Your Recipe
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default AboutSection;