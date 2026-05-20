import { after } from "next/server";
import { prisma } from "@/lib/db/prisma";

type RouteMetricOptions = {
  route: string;
  method?: string;
  routeType?: "api" | "page" | "admin" | "ai" | "voice" | "payment";
  riskLevel?: "low" | "medium" | "high" | "critical" | "unknown";
  slowMs?: number;
  sampleRate?: number;
};

type TimedHandler = () => Promise<Response>;

const DEFAULT_SAMPLE_RATE = Number(process.env.ROUTE_METRICS_SAMPLE_RATE ?? "0.15");

export async function withRouteMetrics(
  options: RouteMetricOptions,
  handler: TimedHandler
) {
  const startedAt = performance.now();
  let response: Response | null = null;

  try {
    response = await handler();
    return response;
  } catch (error) {
    recordRouteMetric({
      ...options,
      durationMs: performance.now() - startedAt,
      status: 500,
    });
    throw error;
  } finally {
    if (response) {
      recordRouteMetric({
        ...options,
        durationMs: performance.now() - startedAt,
        status: response.status,
      });
    }
  }
}

function recordRouteMetric({
  route,
  method = "GET",
  routeType = "api",
  riskLevel = "unknown",
  slowMs = 500,
  sampleRate = DEFAULT_SAMPLE_RATE,
  durationMs,
  status,
}: RouteMetricOptions & { durationMs: number; status: number }) {
  const roundedDuration = Math.max(0, Math.round(durationMs));
  const isSlow = roundedDuration >= slowMs;
  const isError = status >= 500;
  const shouldStore =
    isSlow ||
    isError ||
    Math.random() < Math.max(0, Math.min(1, Number.isFinite(sampleRate) ? sampleRate : 0));

  console.info(
    JSON.stringify({
      type: "route_metric",
      route,
      method,
      routeType,
      riskLevel,
      durationMs: roundedDuration,
      status,
      sampled: shouldStore,
    })
  );

  if (!shouldStore) return;

  const now = new Date();
  const windowStart = new Date(now);
  windowStart.setMinutes(0, 0, 0);

  after(async () => {
    try {
      await prisma.serverRouteMetric.upsert({
        where: {
          route_method_windowStart: {
            route,
            method,
            windowStart,
          },
        },
        update: {
          routeType,
          riskLevel,
          count: { increment: 1 },
          totalDurationMs: { increment: roundedDuration },
          maxDurationMs: { increment: 0 },
          slowCount: { increment: isSlow ? 1 : 0 },
          errorCount: { increment: isError ? 1 : 0 },
          lastStatus: status,
          lastSeenAt: now,
        },
        create: {
          route,
          method,
          routeType,
          riskLevel,
          windowStart,
          count: 1,
          totalDurationMs: roundedDuration,
          maxDurationMs: roundedDuration,
          slowCount: isSlow ? 1 : 0,
          errorCount: isError ? 1 : 0,
          lastStatus: status,
          lastSeenAt: now,
        },
      });

      await prisma.serverRouteMetric.updateMany({
        where: {
          route,
          method,
          windowStart,
          maxDurationMs: { lt: roundedDuration },
        },
        data: { maxDurationMs: roundedDuration },
      });
    } catch (error) {
      console.warn("[route-metrics] write skipped", error);
    }
  });
}
