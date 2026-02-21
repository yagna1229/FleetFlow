/**
 * DataTable — reusable sortable data table with column definitions.
 */
import '../css/data-table.css'

export default function DataTable({ columns, data, onRowClick, emptyMessage = 'No data found' }) {
    if (!data || data.length === 0) {
        return (
            <div className="dtEmpty">
                <p>{emptyMessage}</p>
            </div>
        )
    }

    return (
        <div className="dtWrap">
            <table className="dtTable">
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key} style={col.width ? { width: col.width } : undefined}>
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, i) => (
                        <tr
                            key={row.id || i}
                            onClick={() => onRowClick?.(row)}
                            className={onRowClick ? 'dtClickable' : ''}
                        >
                            {columns.map((col) => (
                                <td key={col.key}>
                                    {col.render ? col.render(row) : row[col.key] ?? '—'}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
