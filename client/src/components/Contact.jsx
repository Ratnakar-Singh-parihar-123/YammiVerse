import React from "react";
import { motion } from "framer-motion";
import Icon from "./AppIcon";
import TopNavigation from "./ui/TopNavigation";

const ContactSection = () => {
  const contactInfo = [
    {
      icon: "Mail",
      label: "Email",
      value: "support@yammiverse.com",
      color: "text-primary bg-primary/10",
    },
    {
      icon: "Phone",
      label: "Phone",
      value: "+91 93997 41051",
      color: "text-success bg-success/10",
    },
    {
      icon: "MapPin",
      label: "Location",
      value: "Bhopal, India 🌏",
      color: "text-warning bg-warning/10",
    },
  ];

  return (
    <>
      <TopNavigation />
      <section className="relative py-20 sm:py-28 bg-gradient-to-b from-background via-muted/30 to-background overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute -top-32 -right-32 w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-accent/10 blur-3xl animate-pulse" />

        <div className="container mx-auto px-6 sm:px-12 lg:px-20 relative">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-extrabold drop-shadow-lg">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-pink-500 to-orange-400">
                Let’s Connect
              </span>
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-base sm:text-lg">
              Got a question, suggestion, or collaboration idea? Fill out the
              form or reach us through the contact info below 🚀
            </p>
          </motion.div>

          {/* Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-card/80 backdrop-blur-lg border border-border rounded-2xl shadow-xl p-8 relative"
            >
              <h3 className="text-2xl font-bold text-foreground mb-8">
                Contact Info
              </h3>
              <div className="space-y-6">
                {contactInfo.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.15 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-4"
                  >
                    <div
                      className={`w-14 h-14 flex items-center justify-center rounded-xl ${item.color}`}
                    >
                      <Icon name={item.icon} size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="text-lg font-semibold text-foreground">
                        {item.value}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Socials */}
              <div className="mt-8 border-t border-border pt-6">
                <p className="text-sm text-muted-foreground mb-3">Follow us</p>
                <div className="flex gap-4">
                  {["Twitter", "Linkedin", "Github", "Instagram"].map(
                    (platform, idx) => (
                      <motion.a
                        key={idx}
                        href="#"
                        whileHover={{ scale: 1.15 }}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-muted text-foreground hover:bg-gradient-to-r hover:from-primary hover:to-pink-500 hover:text-white transition shadow"
                      >
                        <Icon name={platform} size={20} />
                      </motion.a>
                    )
                  )}
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.form
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              onSubmit={(e) => {
                e.preventDefault();
                alert("Message sent successfully ✅");
              }}
              className="bg-card/80 backdrop-blur-lg border border-border rounded-2xl shadow-xl p-8"
            >
              <h3 className="text-2xl font-bold text-foreground mb-8">
                Send a Message
              </h3>
              <div className="space-y-6">
                {[
                  { label: "Name", type: "text" },
                  { label: "Email", type: "email" },
                ].map((field, idx) => (
                  <div key={idx} className="relative">
                    <input
                      type={field.type}
                      placeholder=" "
                      required
                      className="peer w-full px-4 pt-5 pb-2 rounded-lg border border-border bg-background/70 text-foreground placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primary transition"
                    />
                    <label className="absolute left-4 top-2 text-muted-foreground text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-primary">
                      {field.label}
                    </label>
                  </div>
                ))}

                {/* Message */}
                <div className="relative">
                  <textarea
                    rows="4"
                    placeholder=" "
                    required
                    className="peer w-full px-4 pt-5 pb-2 rounded-lg border border-border bg-background/70 text-foreground placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primary transition resize-none"
                  ></textarea>
                  <label className="absolute left-4 top-2 text-muted-foreground text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-primary">
                    Message
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                className="mt-8 w-full py-3 rounded-lg bg-gradient-to-r from-primary via-pink-500 to-orange-400 text-white font-semibold hover:opacity-90 transition shadow-lg"
              >
                Send Message
              </motion.button>
            </motion.form>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactSection;