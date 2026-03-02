"use client";

import * as React from "react";

const cx = (...classes: Array<string | undefined>) =>
  classes.filter(Boolean).join(" ");

export function Card({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cx(
        "rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cx("flex flex-col gap-1.5 px-6 py-4", className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cx("text-base font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cx("text-sm text-slate-500", className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-content" className={cx("px-6 pb-4", className)} {...props} />
  );
}

export function CardFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cx("flex items-center px-6 pb-4 pt-0", className)}
      {...props}
    />
  );
}
