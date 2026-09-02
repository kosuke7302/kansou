import { BetaAnalyticsDataClient } from "@google-analytics/data";

function getClient() {
  const clientEmail = process.env.GA4_CLIENT_EMAIL;
  const privateKey = process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!clientEmail || !privateKey) {
    throw new Error("GA4_CLIENT_EMAIL / GA4_PRIVATE_KEY is not set");
  }
  return new BetaAnalyticsDataClient({
    credentials: { client_email: clientEmail, private_key: privateKey },
  });
}

function getPropertyId() {
  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!propertyId) throw new Error("GA4_PROPERTY_ID is not set");
  return propertyId;
}

/** 直近30日間のサイト全体のページビュー数 */
export async function fetchMonthlyPageViews(): Promise<number> {
  const client = getClient();
  const [response] = await client.runReport({
    property: `properties/${getPropertyId()}`,
    dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
    metrics: [{ name: "screenPageViews" }],
  });
  const value = response.rows?.[0]?.metricValues?.[0]?.value;
  return value ? Number(value) : 0;
}

export type TopPage = {
  path: string;
  pageViews: number;
  activeUsers: number;
};

// 直近7日間で、話数・巻ページ（/works 配下）のアクセス数TOP10
export async function fetchTopPages(limit = 10): Promise<TopPage[]> {
  const client = getClient();
  const [response] = await client.runReport({
    property: `properties/${getPropertyId()}`,
    dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
    dimensionFilter: {
      filter: {
        fieldName: "pagePath",
        stringFilter: { matchType: "CONTAINS", value: "/works/" },
      },
    },
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit,
  });

  return (response.rows ?? []).map((row) => ({
    path: row.dimensionValues?.[0]?.value ?? "",
    pageViews: Number(row.metricValues?.[0]?.value ?? 0),
    activeUsers: Number(row.metricValues?.[1]?.value ?? 0),
  }));
}
