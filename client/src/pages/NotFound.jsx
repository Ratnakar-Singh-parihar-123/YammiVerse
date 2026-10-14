import React from "react";
import { Link, useNavigate } from "react-router-dom";
import TopNavigation from "../components/ui/TopNavigation";
import Button from "../components/ui/Button";
import { ChefHat, ArrowLeft, Home, Compass } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavigation />

      <main className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 border border-border bg-card rounded-3xl shadow-warm-lg">
          <div className="relative mb-6 flex justify-center">
            <div className="w-24 h-24 rounded-3xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
              <ChefHat className="w-12 h-12" />
            </div>
            <span className="absolute -bottom-2 px-3 py-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full uppercase tracking-wider shadow">
              404 Error
            </span>
          </div>

          <h1 className="text-3xl font-heading font-extrabold text-foreground mb-2">
            Recipe Missing!
          </h1>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            Oops! It looks like this dish fell off the menu, or the URL you
            entered was whisked away. Let's find you something delicious!
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="default"
              onClick={() => navigate("/")}
              className="gap-2 font-semibold shadow-sm"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t border-border/80">
            <p className="text-xs text-muted-foreground">
              Looking for something specific?{" "}
              <Link to="/home" className="text-primary font-semibold hover:underline">
                Explore all recipes
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;