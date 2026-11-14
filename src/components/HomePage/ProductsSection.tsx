import { Suspense } from "react";

import { ErrorBoundary } from "@/components/utils/ErrorBoundary";

import { ProductsError } from "./ErrorFallbacks";
import { ProductsContent } from "./ProductsContent";

export function ProductsSection() {
  return (
    <ErrorBoundary fallback={<ProductsError />}>
      {/* Nothing while loading: the section only shows on a couple of
          other sites (see ProductsContent). */}
      <Suspense fallback={null}>
        <ProductsContent />
      </Suspense>
    </ErrorBoundary>
  );
}
