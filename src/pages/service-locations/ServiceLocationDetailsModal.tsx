import { ModalWrapper } from '@/components/common'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    getLocationNameFromRef,
    getServiceNameFromRef,
    type ServiceLocationPage,
} from '@/redux/api/serviceLocationApi'

interface ServiceLocationDetailsModalProps {
    open: boolean
    onClose: () => void
    row: ServiceLocationPage | null
}

export function ServiceLocationDetailsModal({ open, onClose, row }: ServiceLocationDetailsModalProps) {
    const serviceName = row ? getServiceNameFromRef(row.serviceId) ?? '—' : '—'
    const locationName = row ? getLocationNameFromRef(row.locationId) ?? '—' : '—'
    const faqs = row?.faqOverrides ?? []

    return (
        <ModalWrapper
            open={open && !!row}
            onClose={onClose}
            title="Service location details"
            description={row ? `/${row.slug}` : undefined}
            size="lg"
            className="bg-white"
        >
            {!row ? null : (
            <div className="space-y-5 pt-2 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={row.isActive ? 'success' : 'secondary'}>
                        {row.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Service name
                        </p>
                        <p className="mt-1 font-medium text-foreground">{serviceName}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Location name
                        </p>
                        <p className="mt-1 font-medium text-foreground">{locationName}</p>
                    </div>
                </div>

                <Separator />

                <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Meta title override
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-foreground">
                        {row.metaTitleOverride?.trim() ? row.metaTitleOverride : '—'}
                    </p>
                </div>

                <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Meta description override
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-foreground">
                        {row.metaDescriptionOverride?.trim() ? row.metaDescriptionOverride : '—'}
                    </p>
                </div>

                <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Local notes
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-foreground">
                        {row.localNotes?.trim() ? row.localNotes : '—'}
                    </p>
                </div>

                <Separator />

                <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        FAQ overrides
                    </p>
                    {faqs.length === 0 ? (
                        <p className="text-muted-foreground">No FAQ overrides.</p>
                    ) : (
                        <ul className="space-y-4">
                            {faqs.map((f, i) => (
                                <li
                                    key={f._id ?? `${i}-${f.question}`}
                                    className="rounded-xl border border-border bg-muted/30 px-4 py-3"
                                >
                                    <p className="text-xs font-medium text-muted-foreground">Question</p>
                                    <p className="mt-0.5 whitespace-pre-wrap">{f.question}</p>
                                    <p className="mt-2 text-xs font-medium text-muted-foreground">Answer</p>
                                    <p className="mt-0.5 whitespace-pre-wrap">{f.answer}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            )}
        </ModalWrapper>
    )
}
