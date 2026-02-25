import { useEffect, useState } from 'react'
import { Cookie, Save, Eye } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TiptapEditor } from '@/components/common'
import { toast } from '@/utils/toast'
import { motion } from 'framer-motion'
import { useGetSettingsQuery, useUpdateSettingMutation } from '@/redux/api/settingApi'

const defaultCookie = `<h1>Cookie Policy</h1>
<p><em>Last updated: January 2024</em></p>

<h2>1. Introduction</h2>
<p>This Cookie Policy explains what cookies are, how we use cookies on our website, and your choices regarding cookies.</p>

<h2>2. What Are Cookies</h2>
<p>Cookies are small text files that are placed on your computer or mobile device when you visit a website. Cookies are widely used to make websites work more efficiently and provide information to website owners.</p>

<h2>3. How We Use Cookies</h2>
<p>We use cookies for the following purposes:</p>
<ul>
  <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
  <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website</li>
  <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
  <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
</ul>

<h2>4. Types of Cookies We Use</h2>

<h3>4.1 Essential Cookies</h3>
<p>These cookies are necessary for the website to function and cannot be switched off. They are usually set in response to actions made by you, such as:</p>
<ul>
  <li>Setting your privacy preferences</li>
  <li>Logging in to your account</li>
  <li>Filling in forms</li>
  <li>Security and authentication</li>
</ul>

<h3>4.2 Analytics Cookies</h3>
<p>These cookies help us understand how visitors use our website by collecting and reporting information anonymously. This helps us improve our website's performance and user experience.</p>

<h3>4.3 Functional Cookies</h3>
<p>These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.</p>

<h3>4.4 Marketing Cookies</h3>
<p>These cookies are used to make advertising messages more relevant to you. They perform functions like preventing the same ad from appearing repeatedly and ensuring ads are displayed correctly.</p>

<h2>5. Third-Party Cookies</h2>
<p>In addition to our own cookies, we may also use various third-party cookies to report usage statistics of the website and deliver advertisements. These third parties may set their own cookies to collect information about your online activities across different websites.</p>

<h2>6. Managing Cookies</h2>
<p>You have the right to accept or reject cookies. Most web browsers automatically accept cookies, but you can usually modify your browser settings to decline cookies if you prefer. However, this may prevent you from taking full advantage of the website.</p>

<h3>Browser Settings</h3>
<p>You can control cookies through your browser settings. Here are links to instructions for popular browsers:</p>
<ul>
  <li><a href="https://support.google.com/chrome/answer/95647">Google Chrome</a></li>
  <li><a href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences">Mozilla Firefox</a></li>
  <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac">Safari</a></li>
  <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09">Microsoft Edge</a></li>
</ul>

<h2>7. Cookie Consent</h2>
<p>When you first visit our website, we will ask for your consent to use cookies. You can withdraw your consent at any time by adjusting your cookie preferences in your browser settings or through our cookie consent banner.</p>

<h2>8. Updates to This Policy</h2>
<p>We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any changes by posting the new policy on this page.</p>

<h2>9. More Information</h2>
<p>If you would like more information about cookies and how they are used, you can visit:</p>
<ul>
  <li><a href="https://www.allaboutcookies.org/">www.allaboutcookies.org</a></li>
  <li><a href="https://www.youronlinechoices.com/">www.youronlinechoices.com</a></li>
</ul>

<hr>
<p><em>If you have any questions about this Cookie Policy, please contact us at <a href="mailto:privacy@example.com">privacy@example.com</a></em></p>`

export default function CookiePolicySettings() {
  const [cookie, setCookie] = useState(defaultCookie)
  const [activeTab, setActiveTab] = useState('preview')

  const { data } = useGetSettingsQuery('cookie-policy')
  const [updateSetting, { isLoading: isSubmitting }] = useUpdateSettingMutation()

  useEffect(() => {
    if (data?.data?.content) {
      setCookie(data.data.content)
    }
  }, [data])

  const handleSave = async () => {
    try {
      await updateSetting({
        type: 'cookie-policy',
        content: cookie,
      }).unwrap()

      toast({
        title: 'Cookie Policy Updated',
        description: 'Cookie Policy has been updated successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update Cookie Policy. Please try again.',
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
                <Cookie className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Cookie Policy</CardTitle>
                <CardDescription>
                  Manage your platform's Cookie Policy
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
                <Cookie className="h-4 w-4" />
                Edit
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="mt-0">
              <TiptapEditor
                content={cookie}
                onChange={setCookie}
                placeholder="Write your cookie policy here..."
                className="min-h-[500px]"
              />
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              <div className="border rounded-xl p-6 min-h-[500px] bg-muted/20">
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: cookie }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  )
}
