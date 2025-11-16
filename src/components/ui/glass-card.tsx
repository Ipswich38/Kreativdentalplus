import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const glassCardVariants = cva(
  "backdrop-blur-md border shadow-xl transition-all duration-300 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-white/80 border-white/20 hover:-translate-y-1 hover:shadow-2xl",
        strong: "bg-white/90 border-white/30 hover:-translate-y-2 hover:shadow-3xl",
        service: "bg-white/80 border-white/20 hover:shadow-xl shadow-lg cursor-pointer transform hover:scale-105 hover:-translate-y-2 group",
        hero: "bg-gradient-to-br from-slate-900/5 to-blue-900/10 border-white/20",
        form: "bg-white/80 border-white/20",
        highContrast: "bg-black border-2 border-yellow-400",
      },
      size: {
        default: "p-6",
        compact: "p-4",
        spacious: "p-8",
        hero: "p-10",
        large: "p-12",
      },
      radius: {
        default: "rounded-2xl",
        large: "rounded-3xl",
        small: "rounded-xl",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      radius: "default",
    },
  }
);

interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {
  asChild?: boolean;
  withHighlight?: boolean;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, size, radius, withHighlight = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          glassCardVariants({ variant, size, radius }),
          withHighlight && "before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/80 before:to-transparent before:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);

GlassCard.displayName = "GlassCard";

// Service Card Component with Glass Morphism
interface ServiceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  number?: string | number;
  emoji?: string;
  actionText?: string;
  highContrast?: boolean;
}

const ServiceCard = React.forwardRef<HTMLDivElement, ServiceCardProps>(
  ({
    className,
    title,
    description,
    number,
    emoji = "📋",
    actionText = "Learn More",
    highContrast = false,
    ...props
  }, ref) => {
    return (
      <GlassCard
        ref={ref}
        variant={highContrast ? "highContrast" : "service"}
        size="spacious"
        radius="default"
        withHighlight={!highContrast}
        className={cn("", className)}
        {...props}
      >
        <div className="flex items-center gap-4 mb-6">
          {number && (
            <div className="w-12 h-12 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
              {number}
            </div>
          )}
          <div className="text-6xl">{emoji}</div>
        </div>
        <h3 className={`text-2xl font-light tracking-tight mb-4 ${
          highContrast ? 'text-yellow-400' : 'text-slate-900'
        }`}>
          {title}
        </h3>
        <p className={`text-lg leading-relaxed mb-6 ${
          highContrast ? 'text-yellow-200' : 'text-slate-600'
        }`}>
          {description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium text-amber-600">
            {actionText}
          </span>
          <svg
            className="w-6 h-6 text-amber-600 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </GlassCard>
    );
  }
);

ServiceCard.displayName = "ServiceCard";

// Hero Section Component
interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  emoji?: string;
  children?: React.ReactNode;
  highContrast?: boolean;
}

const HeroSection = React.forwardRef<HTMLDivElement, HeroSectionProps>(
  ({
    className,
    title,
    description,
    emoji = "🏥",
    children,
    highContrast = false,
    ...props
  }, ref) => {
    return (
      <GlassCard
        ref={ref}
        variant={highContrast ? "highContrast" : "hero"}
        size="hero"
        radius="large"
        className={cn("mb-8", className)}
        {...props}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="text-7xl">{emoji}</div>
            <h2 className={`text-5xl font-light tracking-tight leading-tight ${
              highContrast ? 'text-yellow-400' : 'text-slate-900'
            }`}>
              {title}
            </h2>
            <p className={`text-xl font-medium leading-relaxed max-w-2xl ${
              highContrast ? 'text-yellow-200' : 'text-slate-600'
            }`}>
              {description}
            </p>
            {children}
          </div>
        </div>
      </GlassCard>
    );
  }
);

HeroSection.displayName = "HeroSection";

// Form Section Component
interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  highContrast?: boolean;
}

const FormSection = React.forwardRef<HTMLDivElement, FormSectionProps>(
  ({
    className,
    title,
    subtitle,
    icon,
    children,
    highContrast = false,
    ...props
  }, ref) => {
    return (
      <GlassCard
        ref={ref}
        variant={highContrast ? "highContrast" : "form"}
        size="hero"
        radius="large"
        className={className}
        {...props}
      >
        <div className="flex items-center space-x-4 mb-8">
          {icon && (
            <div className="p-4 rounded-full bg-blue-500/20 border border-blue-300/30 backdrop-blur-sm">
              {icon}
            </div>
          )}
          <div>
            <h3 className={`text-3xl font-light tracking-tight ${
              highContrast ? 'text-yellow-400' : 'text-slate-900'
            }`}>
              {title}
            </h3>
            {subtitle && (
              <p className={`text-lg font-medium ${
                highContrast ? 'text-yellow-200' : 'text-slate-600'
              }`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {children}
      </GlassCard>
    );
  }
);

FormSection.displayName = "FormSection";

export {
  GlassCard,
  ServiceCard,
  HeroSection,
  FormSection,
  glassCardVariants,
  type GlassCardProps,
  type ServiceCardProps,
  type HeroSectionProps,
  type FormSectionProps
};