/**
 * Generic utility to export an array of typed objects to a CSV file from the frontend.
 * Converts specified columns or extracts all keys if no columns are specified.
 */
export function exportToCsv(filename, rows, columns = null) {
  if (!rows || !rows.length) return;

  const separator = ",";
  // If no explicit columns provided, use keys from the first object
  const keys = columns ? columns.map((c) => c.key) : Object.keys(rows[0]);
  const headers = columns ? columns.map((c) => c.label) : keys;

  const csvContent = [
    headers.join(separator),
    ...rows.map((row) => {
      return keys
        .map((k) => {
          let cell = row[k] === null || row[k] === undefined ? "" : row[k];
          cell = String(cell).replace(/"/g, '""');
          return `"${cell}"`;
        })
        .join(separator);
    }),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
