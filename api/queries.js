import { runQuery } from './keboola-client.js';

// FQN format: "<DATABASE>"."<BUCKET_ID>"."<TABLE_NAME>"
// DATABASE comes from the workspace (KBC_EUW3_2000 for project 2000 on europe-west3 GCP).
const TABLE_FQN = '"KBC_EUW3_2000"."out.c-warehouse_productivity_scoring"."productivity_pick"';

export async function getSummary() {
  const rows = await runQuery(`
    SELECT
      COUNT(*) AS total_picks,
      SUM("orders") AS total_orders,
      COUNT(DISTINCT "login_id") AS picker_count,
      COUNT(DISTINCT "work_date") AS day_count
    FROM ${TABLE_FQN}
  `);
  return rows[0] || { total_picks: 0, total_orders: 0, picker_count: 0, day_count: 0 };
}

export async function getDailyPicks() {
  return runQuery(`
    SELECT
      "work_date" AS day,
      COUNT(*) AS picks,
      SUM("orders") AS orders
    FROM ${TABLE_FQN}
    GROUP BY "work_date"
    ORDER BY "work_date" DESC
    LIMIT 30
  `);
}

export async function getTopPickers() {
  return runQuery(`
    SELECT
      "first_name" || ' ' || "last_name" AS picker,
      COUNT(*) AS picks,
      SUM("orders") AS orders
    FROM ${TABLE_FQN}
    GROUP BY "first_name", "last_name"
    ORDER BY picks DESC
    LIMIT 10
  `);
}
