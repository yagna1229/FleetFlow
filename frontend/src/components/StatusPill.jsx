/**
 * StatusPill — colored badge for entity statuses.
 */
import { STATUS_COLORS } from '../constants/statuses'
import '../css/status-pill.css'

export default function StatusPill({ status }) {
    const colors = STATUS_COLORS[status] || STATUS_COLORS.DRAFT

    return (
        <span
            className="statusPill"
            style={{
                background: colors.bg,
                borderColor: colors.border,
                color: colors.text,
            }}
        >
            {status?.replace(/_/g, ' ')}
        </span>
    )
}
