import type { ReactNode } from 'react'
import { ModalWrapper } from '@/components/common'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import {
    getLocationNameFromRef,
    getServiceNameFromRef,
    resolveRelatedLocationEntryId,
    resolveRelatedServiceEntryId,
    type RelatedLocationOverrideEntry,
    type RelatedServiceOverrideEntry,
    type ServiceLocationPage,
} from '@/redux/api/serviceLocationApi'
import { cn } from '@/utils/cn'

interface ServiceLocationDetailsModalProps {
    open: boolean
    onClose: () => void
    row: ServiceLocationPage | null
}

function PageCard({
    className,
    children,
    padded = true,
}: {
    className?: string
    children: ReactNode
    padded?: boolean
}) {
    return (
        <div
            className={cn(
                'rounded-xl border border-slate-200/90 bg-white shadow-sm',
                padded && 'p-6 sm:p-8',
                className,
            )}
        >
            {children}
        </div>
    )
}

function RelatedLinkCard({
    title,
    description,
    footer,
}: {
    title: string
    description: string
    footer?: ReactNode
}) {
    return (
        <div
            className={cn(
                'flex min-h-[5.5rem] items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-5',
                'transition-colors hover:border-slate-300 hover:shadow-[0_1px_8px_rgba(15,23,42,0.06)]',
            )}
        >
            <div className="min-w-0 flex-1">
                <p className="text-base font-semibold leading-snug text-slate-900">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>
                {footer ? <div className="mt-2 flex flex-wrap gap-1.5">{footer}</div> : null}
            </div>
        </div>
    )
}

function relatedServiceName(entry: RelatedServiceOverrideEntry): string {
    return typeof entry === 'object' ? entry.name : entry
}

function relatedLocationName(entry: RelatedLocationOverrideEntry): string {
    return typeof entry === 'object' ? entry.name : entry
}

export function ServiceLocationDetailsModal({
    open,
    onClose,
    row,
}: ServiceLocationDetailsModalProps) {
    const serviceName = row ? getServiceNameFromRef(row.serviceId) ?? '—' : '—'
    const locationName = row ? getLocationNameFromRef(row.locationId) ?? '—' : '—'
    const faqs = row?.faqOverrides ?? []
    const relatedServices = row?.relatedServicesOverride ?? []
    const relatedLocations = row?.relatedLocationsOverride ?? []

    const detailTitle = row?.headingOverride?.trim() || 'Detailed service information'
    const detailIntro = row?.subDescriptionOverride?.trim()

    return (
        <ModalWrapper
            open={open && !!row}
            onClose={onClose}
            title="Service location details"
            description={row ? `/${row.slug}` : undefined}
            size="xl"
            className="max-h-[90vh] max-w-5xl overflow-y-auto bg-slate-50/80"
        >
            {!row ? null : (
                <div className="space-y-6 pt-1">
                    <PageCard className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span>
                            <span className="font-medium text-foreground">Service:</span> {serviceName}
                        </span>
                        <span className="hidden sm:inline text-border">|</span>
                        <span>
                            <span className="font-medium text-foreground">Location:</span>{' '}
                            {locationName}
                        </span>
                    </PageCard>

                    {/* Overview card — heading + intro + bullet facts (design ref: detailed info card) */}
                    <PageCard>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                            {detailTitle}
                        </h2>
                        {detailIntro ? (
                            <p className="mt-2 max-w-3xl text-base leading-relaxed text-slate-600">
                                {detailIntro}
                            </p>
                        ) : null}
                        <ul className="mt-6 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-slate-600">
                            {/* <li>
                                <span className="font-medium text-slate-800">Primary service:</span>{' '}
                                {serviceName}
                            </li>
                            <li>
                                <span className="font-medium text-slate-800">Primary location:</span>{' '}
                                {locationName}
                            </li> */}
                            {row.metaTitleOverride?.trim() ? (
                                <li>
                                    <span className="font-medium text-slate-800">Meta title:</span>{' '}
                                    {row.metaTitleOverride}
                                </li>
                            ) : null}
                            {row.metaDescriptionOverride?.trim() ? (
                                <li>
                                    <span className="font-medium text-slate-800">Meta description:</span>{' '}
                                    {row.metaDescriptionOverride}
                                </li>
                            ) : null}
                            {row.localNotes?.trim() ? (
                                <li>
                                    <span className="font-medium text-slate-800">Local notes:</span>{' '}
                                    {row.localNotes}
                                </li>
                            ) : null}
                        </ul>
                    </PageCard>

                    {/* Related services — section + 2-col grid */}
                    <PageCard>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                            Related services in {locationName}
                        </h2>
                        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
                            Find related trade support and services available in this area.
                        </p>
                        {relatedServices.length === 0 ? (
                            <p className="mt-8 text-center text-sm text-slate-500">
                                No related services linked for this page.
                            </p>
                        ) : (
                            <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-5">
                                {relatedServices.map((entry: RelatedServiceOverrideEntry) => {
                                    const id = resolveRelatedServiceEntryId(entry)
                                    const name = relatedServiceName(entry)
                                    // const populated = typeof entry === 'object'
                                    // const slug = populated ? entry.slug : undefined
                                    // const svcActive = populated ? entry.isActive : undefined
                                    return (
                                        <RelatedLinkCard
                                            key={id}
                                            title={name}
                                            description={`Find ${name} support in ${locationName}.`}
                                            // footer={
                                            //     <>
                                            //         {slug ? (
                                            //             <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
                                            //                 {slug}
                                            //             </span>
                                            //         ) : null}
                                            //         {svcActive !== undefined ? (
                                            //             <span
                                            //                 className={cn(
                                            //                     'rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase',
                                            //                     svcActive
                                            //                         ? 'bg-emerald-100 text-emerald-800'
                                            //                         : 'bg-red-100 text-red-800',
                                            //                 )}
                                            //             >
                                            //                 {svcActive ? 'Active' : 'Inactive'}
                                            //             </span>
                                            //         ) : null}
                                            //     </>
                                            // }
                                        />
                                    )
                                })}
                            </div>
                        )}
                    </PageCard>

                    {/* Other locations */}
                    <PageCard>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                            {serviceName} in other locations
                        </h2>
                        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
                            Explore where this service is covered beyond {locationName}.
                        </p>
                        {relatedLocations.length === 0 ? (
                            <p className="mt-8 text-center text-sm text-slate-500">
                                No other locations linked for this page.
                            </p>
                        ) : (
                            <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-5">
                                {relatedLocations.map((entry: RelatedLocationOverrideEntry) => {
                                    const id = resolveRelatedLocationEntryId(entry)
                                    const name = relatedLocationName(entry)
                                    // const populated = typeof entry === 'object'
                                    // const type = populated ? entry.type : undefined
                                    // const slug = populated ? entry.slug : undefined
                                    // const locActive = populated ? entry.isActive : undefined
                                    // const indexable = populated ? entry.isIndexable : undefined
                                    return (
                                        <RelatedLinkCard
                                            key={id}
                                            title={name}
                                            description={`Find ${serviceName} support in ${name}.`}
                                            // footer={
                                            //     <>
                                            //         {type ? (
                                            //             <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium capitalize text-slate-600">
                                            //                 {type}
                                            //             </span>
                                            //         ) : null}
                                            //         {slug ? (
                                            //             <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
                                            //                 {slug}
                                            //             </span>
                                            //         ) : null}
                                            //         {locActive !== undefined ? (
                                            //             <span
                                            //                 className={cn(
                                            //                     'rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase',
                                            //                     locActive
                                            //                         ? 'bg-emerald-100 text-emerald-800'
                                            //                         : 'bg-red-100 text-red-800',
                                            //                 )}
                                            //             >
                                            //                 {locActive ? 'Active' : 'Inactive'}
                                            //             </span>
                                            //         ) : null}
                                            //         {indexable !== undefined ? (
                                            //             <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                                            //                 {indexable ? 'Indexable' : 'No index'}
                                            //             </span>
                                            //         ) : null}
                                            //     </>
                                            // }
                                        />
                                    )
                                })}
                            </div>
                        )}
                    </PageCard>

                    {/* FAQ accordion card */}
                    <PageCard className="shadow-md shadow-slate-200/80">
                        <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                            Frequently asked questions
                        </h2>
                        {faqs.length === 0 ? (
                            <p className="mt-4 text-sm text-slate-500">No FAQ overrides for this page.</p>
                        ) : (
                            <Accordion type="single" collapsible className="mt-4 w-full">
                                {faqs.map((f, i) => (
                                    <AccordionItem
                                        key={f._id ?? `${i}-${f.question}`}
                                        value={f._id ?? `faq-${i}`}
                                        className="border-slate-200"
                                    >
                                        <AccordionTrigger className="py-4 text-left text-[15px] font-medium text-slate-900 hover:no-underline">
                                            {f.question || 'Question'}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-[15px] leading-relaxed text-slate-600">
                                            {f.answer}
                                         
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        )}
                    </PageCard>

        
                </div>
            )}
        </ModalWrapper>
    )
}
