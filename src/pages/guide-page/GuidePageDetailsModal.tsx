import type { ReactNode } from 'react'
import { ModalWrapper } from '@/components/common'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import {
    getGuideLocationName,
    getGuideServiceName,
    useGetGuidePageByIdQuery,
    type CostGuideContent,
    type GuidePage,
    type ProblemGuideContent,
} from '@/redux/api/guideApi'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

interface GuidePageDetailsModalProps {
    open: boolean
    onClose: () => void
    row: GuidePage | null
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

function ContentBlock({ label, value }: { label: string; value?: string }) {
    const text = value?.trim()
    if (!text) return null
    return (
        <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {label}
            </p>
            <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-slate-700">
                {text}
            </p>
        </div>
    )
}

const PROBLEM_SECTIONS: { key: keyof ProblemGuideContent; label: string }[] = [
    { key: 'introduction', label: 'Introduction' },
    { key: 'commonCauses', label: 'Common causes' },
    { key: 'warningSigns', label: 'Warning signs' },
    { key: 'possibleRepairSolutions', label: 'Possible repair solutions' },
    { key: 'whenToCallProfessional', label: 'When to call a professional' },
]

const COST_SECTIONS: { key: keyof CostGuideContent; label: string }[] = [
    { key: 'introduction', label: 'Introduction' },
    { key: 'averageCost', label: 'Average cost' },
    { key: 'typicalCostRange', label: 'Typical cost range' },
    { key: 'whatAffectsPrice', label: 'What affects price' },
    { key: 'typicalProjectExamples', label: 'Typical project examples' },
    { key: 'tipsBeforeHiring', label: 'Tips before hiring' },
]

export function GuidePageDetailsModal({ open, onClose, row }: GuidePageDetailsModalProps) {
    const { data: detailRes, isFetching: detailLoading } = useGetGuidePageByIdQuery(
        row?._id ?? '',
        { skip: !open || !row?._id }
    )

    const page = detailRes?.data ?? row
    const serviceName = page ? getGuideServiceName(page.serviceId) : '—'
    const locationName = page ? getGuideLocationName(page.locationId) : '—'
    const content = page?.content ?? {}
    const faqs = page?.faqs ?? []
    const sections = page?.type === 'COST' ? COST_SECTIONS : PROBLEM_SECTIONS
    const filledSections = sections.filter(({ key }) => {
        const v = (content as Record<string, string | undefined>)[key]
        return Boolean(v?.trim())
    })

    return (
        <ModalWrapper
            open={open && !!row}
            onClose={onClose}
            title="Guide page details"
            description={page ? `/${page.slug}` : undefined}
            size="xl"
            className="max-h-[90vh] max-w-5xl overflow-y-auto bg-slate-50/80"
        >
            {!page ? null : (
                <div className="space-y-6 pt-1">
                    <PageCard className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span>
                            <span className="font-medium text-foreground">Service:</span>{' '}
                            {serviceName}
                        </span>
                        <span className="hidden sm:inline text-border">|</span>
                        <span>
                            <span className="font-medium text-foreground">Location:</span>{' '}
                            {locationName}
                        </span>
                    </PageCard>

                    <PageCard>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                            {page.title}
                        </h2>
                        <ul className="mt-6 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-slate-600">
                            {page.metaTitle?.trim() ? (
                                <li>
                                    <span className="font-medium text-slate-800">Meta title:</span>{' '}
                                    {page.metaTitle}
                                </li>
                            ) : null}
                            {page.metaDescription?.trim() ? (
                                <li>
                                    <span className="font-medium text-slate-800">
                                        Meta description:
                                    </span>{' '}
                                    {page.metaDescription}
                                </li>
                            ) : null}
                        </ul>
                    </PageCard>

                    <PageCard className="shadow-md shadow-slate-200/80">
                        <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                            {page.type === 'COST' ? 'Cost guide content' : 'Problem guide content'}
                        </h2>
                        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
                            Full content for this guide page, organised by section.
                        </p>

                        {detailLoading ? (
                            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Loading full content…
                            </div>
                        ) : filledSections.length === 0 ? (
                            <p className="mt-6 text-center text-sm text-slate-500">
                                No content sections filled in yet.
                            </p>
                        ) : filledSections.length <= 2 ? (
                            <div className="mt-6 space-y-4">
                                {filledSections.map(({ key, label }) => (
                                    <ContentBlock
                                        key={key}
                                        label={label}
                                        value={(content as Record<string, string | undefined>)[key]}
                                    />
                                ))}
                            </div>
                        ) : (
                            <Accordion type="single" collapsible className="mt-6 w-full">
                                {filledSections.map(({ key, label }, i) => {
                                    const value = (content as Record<string, string | undefined>)[
                                        key
                                    ]
                                    return (
                                        <AccordionItem
                                            key={key}
                                            value={`${key}-${i}`}
                                            className="border-slate-200"
                                        >
                                            <AccordionTrigger className="py-4 text-left text-[15px] font-medium text-slate-900 hover:no-underline">
                                                {label}
                                            </AccordionTrigger>
                                            <AccordionContent className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-600">
                                                {value}
                                            </AccordionContent>
                                        </AccordionItem>
                                    )
                                })}
                            </Accordion>
                        )}
                    </PageCard>

                    <PageCard className="shadow-md shadow-slate-200/80">
                        <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                            Frequently asked questions
                        </h2>
                        {faqs.length === 0 ? (
                            <p className="mt-4 text-sm text-slate-500">No FAQs for this guide page.</p>
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
