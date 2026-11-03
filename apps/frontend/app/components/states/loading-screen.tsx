import { BrandMark } from "@/components/brand/brand-mark";

export function LoadingScreen() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="bg-background flex h-dvh w-full items-center justify-center"
    >
      <BrandMark className="text-primary size-10 animate-pulse" />
    </div>
  );
}
