import merge from "lodash.merge"

export const PURPLE = "#9E60F4"
export const CYAN = "#22D3EE"

export function baseChartOptions(dark, overrides = {}) {
  const text = dark ? "rgba(255,255,255,0.55)" : "rgba(15,23,42,0.55)"
  const grid = dark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.07)"
  return merge(
    {
      chart: {
        background: "transparent",
        foreColor: text,
        fontFamily: "Inter, sans-serif",
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: { easing: "easeout", speed: 500 },
        parentHeightOffset: 0,
      },
      theme: { mode: dark ? "dark" : "light" },
      colors: [PURPLE, CYAN],
      grid: {
        borderColor: grid,
        strokeDashArray: 4,
        padding: { left: 8, right: 8 },
      },
      dataLabels: { enabled: false },
      legend: { labels: { colors: text }, fontWeight: 500 },
      tooltip: { theme: dark ? "dark" : "light" },
      xaxis: {
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: text } },
      },
      yaxis: { labels: { style: { colors: text } } },
      stroke: { curve: "smooth", width: 2.5 },
    },
    overrides
  )
}
