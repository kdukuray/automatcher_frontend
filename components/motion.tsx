"use client";

/**
 * Reusable Framer Motion wrapper components for consistent, professional
 * animations across the app. These are "use client" components that can
 * be imported into both server and client pages.
 *
 * Animation philosophy: subtle, fast, and professional. Animations should
 * enhance the experience without drawing attention to themselves.
 */

import { motion, type Variants } from "framer-motion";
import React from "react";

// --- Shared easing curves ---
const EASE_OUT: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

// ────────────────────────────────────────────────────────────
// FadeIn — generic fade + optional directional slide
// ────────────────────────────────────────────────────────────

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  /** Direction the element slides from. Default: "up" */
  direction?: "up" | "down" | "left" | "right" | "none";
  /** Slide distance in pixels. Default: 20 */
  distance?: number;
  /** Animation duration in seconds. Default: 0.5 */
  duration?: number;
  /** Delay before animation starts (seconds). Default: 0 */
  delay?: number;
  /** Whether to trigger on scroll into view instead of on mount. Default: false */
  viewOnce?: boolean;
  /** Viewport margin for triggering (e.g. "-50px"). Default: "-50px" */
  viewMargin?: string;
  /** The HTML tag to render as. Default: "div" */
  as?: keyof typeof motion;
}

/**
 * Fades an element in with an optional directional slide.
 * Use `viewOnce` for scroll-triggered animations on landing/help pages.
 */
export function FadeIn({
  children,
  className,
  direction = "up",
  distance = 20,
  duration = 0.5,
  delay = 0,
  viewOnce = false,
  viewMargin = "-50px",
}: FadeInProps) {
  const directionMap = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
    none: { x: 0, y: 0 },
  };

  const { x, y } = directionMap[direction];

  const animationProps = viewOnce
    ? {
        initial: { opacity: 0, x, y },
        whileInView: { opacity: 1, x: 0, y: 0 },
        viewport: { once: true, margin: viewMargin },
      }
    : {
        initial: { opacity: 0, x, y },
        animate: { opacity: 1, x: 0, y: 0 },
      };

  return (
    <motion.div
      className={className}
      {...animationProps}
      transition={{ duration, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

// ────────────────────────────────────────────────────────────
// StaggerContainer + StaggerItem — staggered reveal for grids/lists
// ────────────────────────────────────────────────────────────

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Delay between each child (seconds). Default: 0.08 */
  staggerDelay?: number;
  /** Whether to trigger on scroll into view. Default: false */
  viewOnce?: boolean;
  /** Viewport margin. Default: "-50px" */
  viewMargin?: string;
  /** Initial delay before stagger starts. Default: 0 */
  delay?: number;
}

/**
 * Wraps a list/grid of StaggerItem children. Items animate in one
 * after another with a configurable stagger delay.
 */
export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.08,
  viewOnce = false,
  viewMargin = "-50px",
  delay = 0,
}: StaggerContainerProps) {
  const variants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    },
  };

  const animationProps = viewOnce
    ? {
        initial: "hidden",
        whileInView: "visible",
        viewport: { once: true, margin: viewMargin },
      }
    : {
        initial: "hidden",
        animate: "visible",
      };

  return (
    <motion.div className={className} variants={variants} {...animationProps}>
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
  /** Direction the item slides from. Default: "up" */
  direction?: "up" | "down" | "left" | "right" | "none";
  /** Slide distance in pixels. Default: 20 */
  distance?: number;
  /** Animation duration in seconds. Default: 0.4 */
  duration?: number;
}

/**
 * A single item inside a StaggerContainer. Must be a direct child
 * of StaggerContainer for the stagger effect to work.
 */
export function StaggerItem({
  children,
  className,
  direction = "up",
  distance = 20,
  duration = 0.4,
}: StaggerItemProps) {
  const directionMap = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
    none: { x: 0, y: 0 },
  };

  const { x, y } = directionMap[direction];

  const variants: Variants = {
    hidden: { opacity: 0, x, y },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration, ease: EASE_OUT },
    },
  };

  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}

// ────────────────────────────────────────────────────────────
// ScaleIn — gentle scale + fade for cards and modals
// ────────────────────────────────────────────────────────────

interface ScaleInProps {
  children: React.ReactNode;
  className?: string;
  /** Initial scale value. Default: 0.96 */
  initialScale?: number;
  /** Duration in seconds. Default: 0.4 */
  duration?: number;
  /** Delay in seconds. Default: 0 */
  delay?: number;
}

/**
 * Scales an element in from slightly smaller with a fade.
 * Ideal for auth cards, modals, and focused content areas.
 */
export function ScaleIn({
  children,
  className,
  initialScale = 0.96,
  duration = 0.4,
  delay = 0,
}: ScaleInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: initialScale }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

// ────────────────────────────────────────────────────────────
// PageTransition — standard page-level fade-in wrapper
// ────────────────────────────────────────────────────────────

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * A lightweight page-level fade-in + slide-up animation.
 * Wrap the entire page content inside this for a smooth entrance.
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}
