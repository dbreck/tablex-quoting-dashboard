"use client";

import { useMemo } from "react";
import {
  getModelUrl,
  getModelUrlFromConfig,
  getGlbFilename,
  getAnyNativeModelUrl,
  getSupplierBaseUrl,
} from "@/lib/sku-to-model";
import { VERIFIED_SUPPLIER_BASES } from "@/data/model-availability";

interface UseModelUrlInput {
  sku?: string;
  series?: string;
  shape?: string;
  size?: string;
  base?: string;
  options?: string[];
}

export function useModelUrl(config: UseModelUrlInput) {
  return useMemo(() => {
    if (config.sku) {
      const url = getModelUrl(config.sku);
      return {
        url,
        supplierBaseUrl: null as string | null,
        isSupplierBase: false,
        isVerifiedCombo: true,
        hasModel: url !== null,
        geometryKey: url ? config.sku : null,
      };
    }

    // Try exact native model first
    const url = getModelUrlFromConfig({
      series: config.series,
      shape: config.shape,
      size: config.size,
      base: config.base,
      options: config.options,
    });

    if (url) {
      return {
        url,
        supplierBaseUrl: null as string | null,
        isSupplierBase: false,
        isVerifiedCombo: true,
        hasModel: true,
        geometryKey: getGlbFilename({
          series: config.series,
          shape: config.shape,
          size: config.size,
          base: config.base,
        }),
      };
    }

    // No exact native model — check if we have a supplier base fallback
    if (config.series && config.shape && config.size && config.base) {
      const supplierBaseUrl = getSupplierBaseUrl(config.base);
      if (supplierBaseUrl) {
        // Find any native model for the tabletop geometry
        const nativeTopUrl = getAnyNativeModelUrl(config.series, config.shape, config.size);
        if (nativeTopUrl) {
          const verified = VERIFIED_SUPPLIER_BASES[config.series]?.includes(config.base.toUpperCase()) ?? false;
          return {
            url: nativeTopUrl,
            supplierBaseUrl,
            isSupplierBase: true,
            isVerifiedCombo: verified,
            hasModel: true,
            geometryKey: `${config.series}-${config.shape}-${config.size}-supplier-${config.base}`,
          };
        }
      }
    }

    return {
      url: null as string | null,
      supplierBaseUrl: null as string | null,
      isSupplierBase: false,
      isVerifiedCombo: true,
      hasModel: false,
      geometryKey: null as string | null,
    };
  }, [config.sku, config.series, config.shape, config.size, config.base, config.options]);
}
