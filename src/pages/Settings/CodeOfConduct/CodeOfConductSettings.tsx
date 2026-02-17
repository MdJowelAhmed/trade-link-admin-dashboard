import { useEffect, useState } from 'react'
import { Scale, Save, Eye } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TiptapEditor } from '@/components/common'
import { toast } from '@/utils/toast'
import { motion } from 'framer-motion'
import { useGetSettingsQuery, useUpdateSettingMutation } from '@/redux/api/settingApi'

const defaultCodeOfConduct = `<h1>Code of Conduct</h1>
<p><em>Last updated: January 2024</em></p>

<h2>1. Our Commitment</h2>
<p>We are committed to providing a welcoming and inclusive environment for all participants. This Code of Conduct outlines our expectations for behavior and the consequences for unacceptable behavior.</p>

<h2>2. Expected Behavior</h2>
<p>We expect all participants to:</p>
<ul>
  <li><strong>Be respectful:</strong> Treat everyone with dignity and respect, regardless of background, identity, or experience</li>
  <li><strong>Be inclusive:</strong> Welcome diverse perspectives and create an environment where everyone can participate</li>
  <li><strong>Be collaborative:</strong> Work together constructively and support each other</li>
  <li><strong>Be professional:</strong> Maintain professional standards in all interactions</li>
  <li><strong>Be accountable:</strong> Take responsibility for your actions and their impact on others</li>
</ul>

<h2>3. Unacceptable Behavior</h2>
<p>The following behaviors are considered unacceptable and will not be tolerated:</p>
<ul>
  <li><strong>Harassment:</strong> Harassment, discrimination, or intimidation of any kind</li>
  <li><strong>Offensive comments:</strong> Comments related to gender, gender identity, sexual orientation, disability, physical appearance, race, religion, or other protected characteristics</li>
  <li><strong>Violence or threats:</strong> Violence, threats of violence, or inciting others to commit violence</li>
  <li><strong>Inappropriate content:</strong> Sharing sexually explicit or violent material</li>
  <li><strong>Privacy violations:</strong> Publishing others' private information without permission</li>
  <li><strong>Spam or abuse:</strong> Spamming, trolling, or other disruptive behavior</li>
  <li><strong>Fraud or deception:</strong> Misrepresentation, fraud, or deceptive practices</li>
</ul>

<h2>4. Professional Standards</h2>
<p>All participants are expected to maintain professional standards, including:</p>
<ul>
  <li>Honest and transparent communication</li>
  <li>Fulfilling commitments and agreements</li>
  <li>Respecting intellectual property rights</li>
  <li>Maintaining confidentiality when required</li>
  <li>Following applicable laws and regulations</li>
</ul>

<h2>5. Reporting Violations</h2>
<p>If you experience or witness behavior that violates this Code of Conduct, please report it immediately. Reports can be made:</p>
<ul>
  <li>Through our reporting system</li>
  <li>By contacting our support team</li>
  <li>By emailing conduct@example.com</li>
</ul>
<p>All reports will be taken seriously and investigated promptly. We are committed to protecting reporters from retaliation.</p>

<h2>6. Enforcement</h2>
<p>Violations of this Code of Conduct may result in:</p>
<ul>
  <li>Warnings and requests to correct behavior</li>
  <li>Temporary suspension of account privileges</li>
  <li>Permanent ban from the platform</li>
  <li>Legal action when appropriate</li>
</ul>
<p>Enforcement decisions will be made at our discretion and may vary based on the severity and context of the violation.</p>

<h2>7. Scope</h2>
<p>This Code of Conduct applies to:</p>
<ul>
  <li>All users of our platform</li>
  <li>All interactions on our platform</li>
  <li>Public and private communications related to platform activities</li>
  <li>Representation of the platform in external contexts</li>
</ul>

<h2>8. Commitment to Improvement</h2>
<p>We are committed to continuously improving our Code of Conduct and enforcement processes. We welcome feedback and suggestions for how we can better support our community.</p>

<h2>9. Updates</h2>
<p>We may update this Code of Conduct from time to time. Significant changes will be communicated to all users, and the "Last updated" date will be revised.</p>

<hr>
<p><em>If you have any questions about this Code of Conduct, please contact us at <a href="mailto:conduct@example.com">conduct@example.com</a></em></p>`

export default function CodeOfConductSettings() {
  const [codeOfConduct, setCodeOfConduct] = useState(defaultCodeOfConduct)
  const [activeTab, setActiveTab] = useState('preview')

  const { data } = useGetSettingsQuery('code-of-conduct')
  const [updateSetting, { isLoading: isSubmitting }] = useUpdateSettingMutation()

  useEffect(() => {
    if (data?.data?.content) {
      setCodeOfConduct(data.data.content)
    }
  }, [data])

  const handleSave = async () => {
    try {
      await updateSetting({
        type: 'code-of-conduct',
        content: codeOfConduct,
      }).unwrap()

      toast({
        title: 'Code of Conduct Updated',
        description: 'Code of Conduct has been updated successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update Code of Conduct. Please try again.',
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
                <Scale className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Code of Conduct</CardTitle>
                <CardDescription>
                  Manage your platform's Code of Conduct
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
                <Scale className="h-4 w-4" />
                Edit
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="mt-0">
              <TiptapEditor
                content={codeOfConduct}
                onChange={setCodeOfConduct}
                placeholder="Write your code of conduct here..."
                className="min-h-[500px]"
              />
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              <div className="border rounded-xl p-6 min-h-[500px] bg-muted/20">
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: codeOfConduct }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  )
}
