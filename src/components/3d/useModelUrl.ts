"use client";

import { useMemo } from "react";
import { getModelUrl, getModelUrlFromConfig, getGlbFilename } from "@/lib/sku-to-model";

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
        hasModel: url !== null,
        geometryKey: url ? config.sku : null,
      };
    }

    const url = getModelUrlFromConfig({
      series: config.series,
      shape: config.shape,
      size: config.size,
      base: config.base,
      options: config.options,
    });

    const geometryKey = getGlbFilename({
      shape: config.shape,
      size: config.size,
      base: config.base,
    });

    return {
      url,
      hasModel: url !== null,
      geometryKey,
    };
  }, [config.sku, config.series, config.shape, config.size, config.base, config.options]);
}
