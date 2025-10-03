import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "./AppIcon";
import TopNavigation from "./ui/TopNavigation";

// ✅ Accordion Item Component
const PolicyItem = ({ title, children, index, icon }) => {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="border border-border rounded-xl bg-card/70 backdrop-blur-md shadow-sm hover:shadow-lg transition overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-card hover:bg-muted/40 transition"
      >
        <div className="flex items-center gap-3">
          <span className="text-primary">
            <Icon name={icon} size={20} />
          </span>
          <span className="text-lg font-semibold text-foreground">{title}</span>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Icon name="ChevronDown" size={20} className="text-muted-foreground" />
        </motion.div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="px-5 pb-4 text-muted-foreground text-sm leading-relaxed"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ✅ Main Section
const PrivacyPolicySection = () => {
  const policyPoints = [
    {
      title: "1. Information We Collect",
      content:
        "We may collect your name, email, and other details when you sign up, save recipes, or interact with our platform. We also gather anonymous usage data to improve our services.",
      icon: "Database",
    },
    {
      title: "2. How We Use Your Data",
      content:
        "Your data is used to personalize your experience, recommend recipes, and send important updates. We never sell your personal information to third parties.",
      icon: "ShieldCheck",
    },
    {
      title: "3. Cookies & Tracking",
      content:
        "We use cookies to remember your preferences and enhance usability. You can disable cookies in your browser settings, but some features may not work properly.",
      icon: "Cookie",
    },
    {
      title: "4. Sharing with Third Parties",
      content:
        "We may share anonymized data with analytics providers. We do not share personally identifiable information without your consent.",
      icon: "Share2",
    },
    {
      title: "5. Your Rights & Choices",
      content:
        "You can update or delete your account anytime. You also have the right to request access to your data and opt out of promotional communications.",
      icon: "UserCheck",
    },
    {
      title: "6. Data Security",
      content:
        "We implement strong security practices to protect your data. However, no online platform is 100% secure, and we encourage you to use strong passwords.",
      icon: "Lock",
    },
  ];

  return (
    <>
      <TopNavigation />
      <section className="relative py-20 sm:py-28 bg-gradient-to-b from-background via-muted/20 to-background overflow-hidden">
        <div className="container mx-auto px-6 sm:px-12 lg:px-20">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground">
              Privacy{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-pink-500 to-orange-400">
                Policy
              </span>
            </h2>
            <div className="w-28 h-1 bg-gradient-to-r from-primary via-accent to-primary mx-auto mt-4 rounded-full" />
            <p className="mt-6 max-w-2xl mx-auto text-muted-foreground text-base sm:text-lg">
              We value your trust. This Privacy Policy explains how we collect,
              use, and protect your data while you enjoy YammiVerse.
            </p>
          </motion.div>

          {/* Accordions */}
          <div className="space-y-4 max-w-3xl mx-auto">
            {policyPoints.map((item, idx) => (
              <PolicyItem
                key={idx}
                title={item.title}
                index={idx}
                icon={item.icon}
              >
                {item.content}
              </PolicyItem>
            ))}
          </div>

          {/* Last Updated */}
          <p className="mt-12 text-center text-xs text-muted-foreground">
            🔒 Last updated: February 2025
          </p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary via-pink-500 to-orange-400 text-white font-medium hover:scale-105 transform transition shadow-md"
            >
              <Icon name="Mail" size={18} /> Have Questions? Contact Us
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default PrivacyPolicySection;