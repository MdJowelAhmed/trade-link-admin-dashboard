import { useEffect, useState } from 'react'
import { Star, Save, Eye } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TiptapEditor } from '@/components/common'
import { toast } from '@/utils/toast'
import { motion } from 'framer-motion'
import { useGetSettingsQuery, useUpdateSettingMutation } from '@/redux/api/settingApi'

const defaultReview = `<h1>Review Policy</h1>
<p><em>Last updated: January 2024</em></p>

<h2>1. Review Guidelines</h2>
<p>We encourage honest and constructive reviews from our users. When writing a review, please follow these guidelines:</p>
<ul>
  <li>Be honest and accurate in your assessment</li>
  <li>Focus on your personal experience</li>
  <li>Use respectful and professional language</li>
  <li>Provide specific details about your experience</li>
  <li>Avoid personal attacks or offensive language</li>
</ul>

<h2>2. What Makes a Good Review</h2>
<p>A helpful review includes:</p>
<ul>
  <li><strong>Detailed feedback:</strong> Share specific aspects of your experience</li>
  <li><strong>Balanced perspective:</strong> Mention both positive and negative aspects</li>
  <li><strong>Relevant information:</strong> Focus on factors that matter to other users</li>
  <li><strong>Constructive criticism:</strong> Offer suggestions for improvement when applicable</li>
</ul>

<h2>3. Review Moderation</h2>
<p>We reserve the right to moderate reviews to ensure quality and compliance. Reviews may be removed or edited if they:</p>
<ul>
  <li>Contain offensive, abusive, or discriminatory content</li>
  <li>Include false or misleading information</li>
  <li>Violate our community standards</li>
  <li>Are spam or promotional in nature</li>
  <li>Disclose personal information of others</li>
</ul>

<h2>4. Review Ratings</h2>
<p>Our rating system uses a scale to help users quickly understand the quality of services:</p>
<ul>
  <li><strong>5 Stars:</strong> Excellent - Exceeded expectations</li>
  <li><strong>4 Stars:</strong> Very Good - Met expectations with minor issues</li>
  <li><strong>3 Stars:</strong> Good - Met basic expectations</li>
  <li><strong>2 Stars:</strong> Fair - Below expectations</li>
  <li><strong>1 Star:</strong> Poor - Significantly below expectations</li>
</ul>

<h2>5. Response to Reviews</h2>
<p>Service providers may respond to reviews to:</p>
<ul>
  <li>Thank customers for positive feedback</li>
  <li>Address concerns raised in negative reviews</li>
  <li>Provide additional context or clarification</li>
  <li>Demonstrate commitment to customer satisfaction</li>
</ul>

<h2>6. Review Authenticity</h2>
<p>We take review authenticity seriously. We prohibit:</p>
<ul>
  <li>Fake or fraudulent reviews</li>
  <li>Reviews written by competitors</li>
  <li>Incentivized reviews without disclosure</li>
  <li>Reviews from users with conflicts of interest</li>
</ul>

<h2>7. Reporting Inappropriate Reviews</h2>
<p>If you believe a review violates our guidelines, you can report it. We will investigate and take appropriate action, which may include:</p>
<ul>
  <li>Removing the review if it violates our policies</li>
  <li>Requesting edits to comply with guidelines</li>
  <li>Taking action against accounts that repeatedly violate policies</li>
</ul>

<h2>8. Updates to Review Policy</h2>
<p>We may update this review policy from time to time. We will notify users of any significant changes and update the "Last updated" date.</p>

<hr>
<p><em>If you have any questions about our Review Policy, please contact us at <a href="mailto:reviews@example.com">reviews@example.com</a></em></p>`

export default function ReviewSettings() {
  const [review, setReview] = useState(defaultReview)
  const [activeTab, setActiveTab] = useState('preview')

  const { data } = useGetSettingsQuery('review-policy')
  const [updateSetting, { isLoading: isSubmitting }] = useUpdateSettingMutation()

  useEffect(() => {
    if (data?.data?.content) {
      setReview(data.data.content)
    }
  }, [data])

  const handleSave = async () => {
    try {
      await updateSetting({
        type: 'review-policy',
        content: review,
      }).unwrap()

      toast({
        title: 'Review Policy Updated',
        description: 'Review Policy has been updated successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update Review Policy. Please try again.',
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
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Review Policy</CardTitle>
                <CardDescription>
                  Manage your platform's Review Policy
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
                <Star className="h-4 w-4" />
                Edit
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="mt-0">
              <TiptapEditor
                content={review}
                onChange={setReview}
                placeholder="Write your review policy here..."
                className="min-h-[500px]"
              />
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              <div className="border rounded-xl p-6 min-h-[500px] bg-muted/20">
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: review }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  )
}
