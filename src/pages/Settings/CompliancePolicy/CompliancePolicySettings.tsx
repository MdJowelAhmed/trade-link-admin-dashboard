import { useEffect, useState } from 'react'
import { FileCheck, Save, Eye } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TiptapEditor } from '@/components/common'
import { toast } from '@/utils/toast'
import { motion } from 'framer-motion'
import { useGetSettingsQuery, useUpdateSettingMutation } from '@/redux/api/settingApi'

const defaultCompliance = `<h1>Compliance Policy</h1>
<p><em>Last updated: January 2024</em></p>

<h2>1. Introduction</h2>
<p>This Compliance Policy outlines our commitment to maintaining the highest standards of legal and regulatory compliance across all aspects of our operations.</p>

<h2>2. Regulatory Compliance</h2>
<p>We are committed to complying with all applicable laws, regulations, and industry standards, including:</p>
<ul>
  <li>Data protection and privacy regulations</li>
  <li>Financial services regulations</li>
  <li>Consumer protection laws</li>
  <li>Anti-money laundering (AML) requirements</li>
  <li>Know Your Customer (KYC) obligations</li>
</ul>

<h2>3. Compliance Framework</h2>
<p>Our compliance framework includes:</p>
<ul>
  <li><strong>Risk Assessment:</strong> Regular evaluation of compliance risks</li>
  <li><strong>Policies and Procedures:</strong> Documented policies for all key areas</li>
  <li><strong>Training:</strong> Ongoing compliance training for all staff</li>
  <li><strong>Monitoring:</strong> Continuous monitoring and auditing of compliance activities</li>
  <li><strong>Reporting:</strong> Regular reporting to management and regulatory bodies</li>
</ul>

<h2>4. Data Protection Compliance</h2>
<p>We comply with all applicable data protection laws and regulations, including:</p>
<ul>
  <li>General Data Protection Regulation (GDPR)</li>
  <li>Data Protection Act</li>
  <li>Other regional data protection requirements</li>
</ul>
<p>We implement appropriate technical and organizational measures to protect personal data.</p>

<h2>5. Financial Compliance</h2>
<p>Our financial operations comply with:</p>
<ul>
  <li>Anti-money laundering regulations</li>
  <li>Financial reporting standards</li>
  <li>Tax compliance requirements</li>
  <li>Payment processing regulations</li>
</ul>

<h2>6. Code of Conduct</h2>
<p>All employees and partners are required to:</p>
<ul>
  <li>Act with integrity and honesty</li>
  <li>Comply with all applicable laws and regulations</li>
  <li>Report any suspected violations</li>
  <li>Maintain confidentiality of sensitive information</li>
</ul>

<h2>7. Compliance Monitoring</h2>
<p>We conduct regular compliance audits and reviews to ensure:</p>
<ul>
  <li>Adherence to all policies and procedures</li>
  <li>Identification of potential compliance issues</li>
  <li>Implementation of corrective actions</li>
  <li>Continuous improvement of our compliance program</li>
</ul>

<h2>8. Reporting Violations</h2>
<p>If you become aware of any potential compliance violations, please report them immediately through our designated reporting channels. All reports will be investigated promptly and confidentially.</p>

<h2>9. Updates to This Policy</h2>
<p>We may update this Compliance Policy from time to time to reflect changes in laws, regulations, or our business practices. We will notify you of any material changes.</p>

<hr>
<p><em>If you have any questions about this Compliance Policy, please contact us at <a href="mailto:compliance@example.com">compliance@example.com</a></em></p>`

export default function CompliancePolicySettings() {
  const [compliance, setCompliance] = useState(defaultCompliance)
  const [activeTab, setActiveTab] = useState('preview')

  const { data } = useGetSettingsQuery('compliance-policy')
  const [updateSetting, { isLoading: isSubmitting }] = useUpdateSettingMutation()

  useEffect(() => {
    if (data?.data?.content) {
      setCompliance(data.data.content)
    }
  }, [data])

  const handleSave = async () => {
    try {
      await updateSetting({
        type: 'compliance-policy',
        content: compliance,
      }).unwrap()

      toast({
        title: 'Compliance Policy Updated',
        description: 'Compliance Policy has been updated successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update Compliance Policy. Please try again.',
        variant: 'destructive',
      })
    }
  }


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Compliance Policy</CardTitle>
                <CardDescription>
                  Manage your platform's Compliance Policy
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
            
              <Button onClick={handleSave} isLoading={isSubmitting} className="bg-primary text-white hover:bg-primary/80">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="edit" className="gap-2">
                <FileCheck className="h-4 w-4" />
                Edit
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="mt-0">
              <TiptapEditor
                content={compliance}
                onChange={setCompliance}
                placeholder="Write your compliance policy here..."
                className="min-h-[500px]"
              />
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              <div className="border rounded-xl p-6 min-h-[500px] bg-muted/20">
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: compliance }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  )
}
