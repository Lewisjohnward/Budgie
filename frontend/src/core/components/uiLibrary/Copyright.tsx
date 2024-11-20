import { cn } from "@/core/lib/utils";

type props = {
  className?: string;
};

export default function Copyright({ className }: props) {
  return (
    <p className={cn("text-center text-xs text-white/90", className)}>
      © Copyright 2024 Budgie LLC. All rights reserved.
    </p>
  );
}
