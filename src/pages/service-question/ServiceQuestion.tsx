import { useState, useMemo, useEffect } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormSelect } from '@/components/common'
import { useGetCategoriesQuery } from '@/redux/api/categoriesApi'
import { useGetServicesQuery } from '@/redux/api/serviceApi'
import {
  useGetServiceQuestionsQuery,
  useAddServiceQuestionMutation,
  useUpdateServiceQuestionMutation,
  useDeleteServiceQuestionMutation,
  type BackendServiceQuestion,
} from '@/redux/api/serviceQuestionApi'
import type { ServiceQuestion, QuestionType } from '@/types'
import { toast } from '@/utils/toast'

interface QuestionOption {
  id: string
  label: string
  value?: number // For budget questions
}

interface QuestionForm {
  id?: string
  question: string
  isBudgetQuestion: boolean
  order: number
  options: QuestionOption[]
}

// Helper function to transform backend question to frontend format
const transformBackendToFrontend = (backendQuestion: BackendServiceQuestion, categoryId?: string): ServiceQuestion => {
  return {
    id: backendQuestion._id,
    serviceId: backendQuestion.serviceId,
    categoryId: categoryId || '',
    question: backendQuestion.questionText,
    type: (backendQuestion.type || 'SELECT') as QuestionType,
    isBudgetQuestion: backendQuestion.isBudgetQuestion || false,
    order: backendQuestion.order,
    options: backendQuestion.options.map((opt) => ({
      id: opt._id,
      label: opt.label,
      value: opt.value,
    })),
    createdAt: backendQuestion.createdAt,
    updatedAt: backendQuestion.updatedAt,
  }
}

const ServiceQuestion = () => {
  // State declarations first
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [selectedServiceId, setSelectedServiceId] = useState<string>('')
  const [questions, setQuestions] = useState<QuestionForm[]>([])
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [showAddQuestionForm, setShowAddQuestionForm] = useState(false)
  const [newQuestion, setNewQuestion] = useState<QuestionForm>({
    question: '',
    isBudgetQuestion: false,
    order: 1,
    options: [{ id: Date.now().toString(), label: '' }],
  })
  // Budget question form (always shown when adding questions)
  const [newBudgetQuestion, setNewBudgetQuestion] = useState<QuestionForm>({
    question: 'Approximate Budget',
    isBudgetQuestion: true,
    order: 1,
    options: [
      { id: Date.now().toString() + '-1', label: 'Under £500', value: 500 },
      { id: Date.now().toString() + '-2', label: '£500 - £1000', value: 1000 },
      { id: Date.now().toString() + '-3', label: 'Above £1000', value: 2000 },
    ],
  })

  // Use RTK Query for categories (backend handles data)
  const { data: categoriesResponse } = useGetCategoriesQuery()
  const categories = Array.isArray(categoriesResponse?.data) ? categoriesResponse.data : []

  // Use RTK Query for services (filter by category when selected)
  const { data: servicesResponse, isLoading: isLoadingServices } = useGetServicesQuery(
    selectedCategoryId ? { categoryId: selectedCategoryId } : undefined
  )

  // Map backend services to frontend Service type
  const services = useMemo(() => {
    if (!Array.isArray(servicesResponse?.data)) return []
    return servicesResponse.data.map((backendService) => ({
      id: backendService._id,
      name: backendService.name,
      categoryId: backendService.categoryId._id,
      categoryName: backendService.categoryId.name,
      status: (backendService.isActive ? 'active' : 'inactive') as 'active' | 'inactive',
      totalQuestions: 0,
      createdAt: backendService.createdAt,
      updatedAt: backendService.updatedAt,
    }))
  }, [servicesResponse?.data])

  // RTK Query hooks for service questions
  const { data: questionsResponse, isLoading: isLoadingQuestions } = useGetServiceQuestionsQuery(
    selectedServiceId,
    { skip: !selectedServiceId }
  )
  const [addServiceQuestion,] = useAddServiceQuestionMutation()
  const [updateServiceQuestion,] = useUpdateServiceQuestionMutation()
  const [deleteServiceQuestion,] = useDeleteServiceQuestionMutation()

  // Transform backend questions to frontend format
  const serviceQuestionsList = useMemo(() => {
    if (!questionsResponse?.data || !Array.isArray(questionsResponse.data)) return []
    return questionsResponse.data.map((q) => transformBackendToFrontend(q, selectedCategoryId))
  }, [questionsResponse?.data, selectedCategoryId])

  // Get services for selected category (already filtered by API, but double-check)
  const categoryServices = useMemo(() => {
    if (!selectedCategoryId) return []
    // Services are already filtered by API, but ensure they match
    return services.filter((s) =>
      s.categoryId === selectedCategoryId
    )

  }, [selectedCategoryId, services])

  // Check if budget question exists (both in backend and local state)
  const hasBudgetQuestion = useMemo(() => {
    return serviceQuestionsList.some((q) => q.isBudgetQuestion) ||
      questions.some((q) => q.isBudgetQuestion)
  }, [serviceQuestionsList, questions])

  // Load questions when service is selected or questions response changes
  useEffect(() => {
    if (selectedServiceId && serviceQuestionsList.length > 0) {
      const transformedQuestions: QuestionForm[] = serviceQuestionsList.map((q) => ({
        id: q.id,
        question: q.question,
        isBudgetQuestion: q.isBudgetQuestion,
        order: q.order,
        options: q.options.map((opt) => ({
          id: opt.id,
          label: opt.label,
          value: opt.value,
        })),
      }))
      setQuestions(transformedQuestions)
    } else if (selectedServiceId && serviceQuestionsList.length === 0 && !isLoadingQuestions) {
      // No questions exist yet - just set empty array, don't auto-create
      setQuestions([])
    }
  }, [selectedServiceId, serviceQuestionsList, isLoadingQuestions, addServiceQuestion])

  const categoryOptions = categories.map((cat: { _id: string; name: string }) => ({
    value: cat._id,
    label: cat.name,
  }))

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
    setSelectedServiceId('')
    setQuestions([])
  }

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId)
    setEditingQuestionId(null)
    setShowAddQuestionForm(false)
    // Reset default question creation tracking when switching services
    // (will be set again in useEffect if needed)
    // Questions will be loaded via useEffect when questionsResponse changes
  }

  const handleAddQuestion = async () => {
    if (!selectedServiceId) {
      toast({ title: 'Error', description: 'Please select a service first', variant: 'destructive' })
      return
    }

    const questionsToAdd: QuestionForm[] = []
    const currentMaxOrder = questions.length > 0 ? Math.max(...questions.map(q => q.order)) : 0

    // Add normal question if filled
    if (newQuestion.question.trim()) {
      if (newQuestion.options.length === 0 || newQuestion.options.some((opt) => !opt.label.trim())) {
        toast({ title: 'Error', description: 'Please add at least one valid option for normal question', variant: 'destructive' })
        return
      }

      questionsToAdd.push({
        question: newQuestion.question,
        isBudgetQuestion: false,
        order: newQuestion.order || currentMaxOrder + 1,
        options: newQuestion.options.map((opt) => ({
          id: opt.id,
          label: opt.label,
          value: undefined,
        })),
      })
    }

    // Add budget question only if it doesn't exist (even if empty - user can fill later)
    if (!hasBudgetQuestion) {
      const budgetOrder = questionsToAdd.length > 0
        ? Math.max(...questionsToAdd.map(q => q.order), currentMaxOrder) + 1
        : currentMaxOrder + 1

      questionsToAdd.push({
        question: newBudgetQuestion.question || 'Approximate Budget',
        isBudgetQuestion: true,
        order: budgetOrder,
        options: newBudgetQuestion.options.map((opt) => ({
          id: opt.id,
          label: opt.label || '',
          value: opt.value,
        })),
      })
    }

    // Add all questions to local state
    const updatedQuestions = [...questions, ...questionsToAdd]
      .sort((a, b) => a.order - b.order)

    setQuestions(updatedQuestions)

    // Reset forms
    setNewQuestion({
      question: '',
      isBudgetQuestion: false,
      order: updatedQuestions.length + 1,
      options: [{ id: Date.now().toString(), label: '' }],
    })
    setNewBudgetQuestion({
      question: 'Approximate Budget',
      isBudgetQuestion: true,
      order: 1,
      options: [
        { id: Date.now().toString() + '-1', label: 'Under £500', value: 500 },
        { id: Date.now().toString() + '-2', label: '£500 - £1000', value: 1000 },
        { id: Date.now().toString() + '-3', label: 'Above £1000', value: 2000 },
      ],
    })
    setShowAddQuestionForm(false)
    toast({ title: 'Success', description: 'Questions added to list. Click Save to save all questions.' })
  }

  const handleUpdateQuestion = async (questionId: string) => {
    const question = questions.find((q) => q.id === questionId)
    if (!question) return

    if (question.isBudgetQuestion && hasBudgetQuestion) {
      const otherBudgetQuestion = serviceQuestionsList.find((q) => q.isBudgetQuestion && q.id !== questionId)
      if (otherBudgetQuestion) {
        toast({ title: 'Error', description: 'Budget question already exists', variant: 'destructive' })
        return
      }
    }

    if (!question.question.trim()) {
      toast({ title: 'Error', description: 'Please enter a question', variant: 'destructive' })
      return
    }

    const totalQuestions = questions.length
    if (
      !Number.isInteger(question.order) ||
      question.order < 1 ||
      question.order > totalQuestions
    ) {
      toast({
        title: 'Error',
        description: `Order number must be between 1 and ${totalQuestions}`,
        variant: 'destructive',
      })
      return
    }

    // Validate budget question options have values
    if (question.isBudgetQuestion && question.options.some((opt) => opt.value === undefined || opt.value === null)) {
      toast({ title: 'Error', description: 'Budget question options must have values', variant: 'destructive' })
      return
    }

    try {
      await updateServiceQuestion({
        id: questionId,
        serviceQuestion: {
          questionText: question.question,
          options: question.options.map((opt) => ({
            label: opt.label,
            value: question.isBudgetQuestion ? opt.value : undefined,
          })),
          order: question.order,
          isBudgetQuestion: question.isBudgetQuestion,
        },
      }).unwrap()
      setEditingQuestionId(null)
      toast({ title: 'Success', description: 'Question updated successfully' })
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'data' in error
        ? (error as { data?: { message?: string } }).data?.message
        : 'Failed to update question'
      toast({
        title: 'Error',
        description: errorMessage || 'Failed to update question',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await deleteServiceQuestion(questionId).unwrap()
      setQuestions(questions.filter((q) => q.id !== questionId))
      toast({ title: 'Success', description: 'Question deleted successfully' })
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'data' in error
        ? (error as { data?: { message?: string } }).data?.message
        : 'Failed to delete question'
      toast({
        title: 'Error',
        description: errorMessage || 'Failed to delete question',
        variant: 'destructive'
      })
    }
  }

  const handleAddOption = (questionId: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? { ...q, options: [...q.options, { id: Date.now().toString(), label: '' }] }
          : q
      )
    )
  }

  const handleRemoveOption = (questionId: string, optionId: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? { ...q, options: q.options.filter((opt) => opt.id !== optionId) }
          : q
      )
    )
  }

  const handleOptionChange = (questionId: string, optionId: string, field: 'label' | 'value', value: string | number) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
            ...q,
            options: q.options.map((opt) =>
              opt.id === optionId ? { ...opt, [field]: value } : opt
            ),
          }
          : q
      )
    )
  }

  const handleSave = async () => {
    if (!selectedServiceId) {
      toast({ title: 'Error', description: 'Please select a service first', variant: 'destructive' })
      return
    }

    // Validate all questions before saving
    for (const q of questions) {
      if (!q.question.trim()) {
        toast({ title: 'Error', description: 'Please enter all questions', variant: 'destructive' })
        return
      }
      if (q.options.length === 0 || q.options.some((opt) => !opt.label.trim())) {
        toast({ title: 'Error', description: 'Please add at least one valid option for all questions', variant: 'destructive' })
        return
      }
      if (q.isBudgetQuestion && q.options.some((opt) => opt.value === undefined || opt.value === null)) {
        toast({ title: 'Error', description: 'Budget question options must have values', variant: 'destructive' })
        return
      }
    }

    // Save all questions - POST for new, PATCH for existing
    const sortedQuestions = questions
      .slice()
      .sort((a, b) => a.order - b.order)

    console.log('📝 Saving questions:', sortedQuestions.length)
    console.log('📋 Questions data:', sortedQuestions)

    try {
      const savePromises = sortedQuestions.map(async (q, index) => {
        const questionData = {
          serviceId: selectedServiceId,
          questionText: q.question,
          options: q.options.map((opt) => ({
            label: opt.label,
            value: q.isBudgetQuestion ? opt.value : undefined,
          })),
          order: q.order,
          isBudgetQuestion: q.isBudgetQuestion,
          type: 'SELECT' as const,
        }

        console.log(`🔄 Processing question ${index + 1}/${sortedQuestions.length}:`, {
          hasId: !!q.id,
          questionText: q.question,
          isBudgetQuestion: q.isBudgetQuestion,
          optionsCount: q.options.length,
        })

        if (q.id) {
          // Existing question - use PATCH
          console.log(`📝 PATCH request for question ID: ${q.id}`)
          const result = await updateServiceQuestion({
            id: q.id,
            serviceQuestion: questionData,
          }).unwrap()
          console.log(`✅ PATCH success for question ID: ${q.id}`, result)
          return result
        } else {
          // New question - use POST
          console.log(`➕ POST request for new question:`, questionData)
          const result = await addServiceQuestion(questionData).unwrap()
          console.log(`✅ POST success for new question:`, result)
          return result
        }
      })

      const results = await Promise.all(savePromises)
      console.log('🎉 All questions saved successfully:', results)
      toast({ title: 'Success', description: `All ${sortedQuestions.length} questions saved successfully` })
    } catch (error: unknown) {
      console.error('❌ Error saving questions:', error)
      const errorMessage = error && typeof error === 'object' && 'data' in error
        ? (error as { data?: { message?: string } }).data?.message
        : 'Failed to save questions'
      toast({
        title: 'Error',
        description: errorMessage || 'Failed to save questions',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg   min-h-screen">
      {/* Category Selection */}
      <Card>
        <CardContent className="pt-6">
          <FormSelect
            label="Select Category"
            value={selectedCategoryId}
            options={categoryOptions}
            onChange={handleCategoryChange}
            placeholder="Please select a category"
            required
          />
        </CardContent>
      </Card>

      {/* Service Tags */}
      {selectedCategoryId && (
        <Card>
          <CardContent className="pt-6">
            {isLoadingServices ? (
              <div className="text-center py-4 text-muted-foreground">Loading services...</div>
            ) : categoryServices.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {categoryServices.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceSelect(service.id)}
                    className={`px-6 py-[10px] rounded-full font-medium transition-colors ${selectedServiceId === service.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                  >
                    {service.name}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No active services found for this category
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Questions Section */}
      {selectedServiceId && (
        <div className="space-y-4">
          {/* Existing Questions */}
          {questions.map((question) => (
            <Card key={question.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Question Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {/* <Checkbox
                        checked={question.isEnabled}
                        onCheckedChange={(checked) => {
                          setQuestions(
                            questions.map((q) =>
                              q.id === question.id ? { ...q, isEnabled: checked as boolean } : q
                            )
                          )
                        }}
                      /> */}
                      <div className="flex-1 space-y-2">
                        {editingQuestionId === question.id ? (
                          <Input
                            value={question.question}
                            onChange={(e) => {
                              setQuestions(
                                questions.map((q) =>
                                  q.id === question.id ? { ...q, question: e.target.value } : q
                                )
                              )
                            }}
                            className="flex-1 bg-card rounded-full"
                            placeholder="Enter question"
                          />
                        ) : (
                          <span className="text-lg font-medium">{question.question}</span>
                        )}

                        {/* Order number field */}
                        <div className="flex flex-col  gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span>Order number:</span>
                            <span className="text-xs text-gray-400">
                              (1 - {questions.length})
                            </span>
                          </div>
                          <Input
                            type="number"
                            value={question.order === 0 ? '' : question.order}
                            onChange={(e) => {
                              const raw = e.target.value
                              const total = questions.length

                              if (raw === '') {
                                // Allow clearing to empty (stored as 0 temporarily)
                                setQuestions(
                                  questions.map((q) =>
                                    q.id === question.id ? { ...q, order: 0 } : q
                                  )
                                )
                                return
                              }

                              const value = parseInt(raw, 10)
                              if (Number.isNaN(value)) return
                              if (value > total) return

                              setQuestions(
                                questions.map((q) =>
                                  q.id === question.id ? { ...q, order: value } : q
                                )
                              )
                            }}
                            className="w-1/2  bg-card rounded-full"
                            min={1}
                            max={questions.length}
                            placeholder="Enter order number"
                          />

                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingQuestionId === question.id ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              handleUpdateQuestion(question.id!)
                              setEditingQuestionId(null)
                            }}
                          >
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingQuestionId(null)
                              // Reset to original
                              const original = serviceQuestionsList.find((q) => q.id === question.id)
                              if (original) {
                                setQuestions(
                                  questions.map((q) =>
                                    q.id === question.id
                                      ? {
                                        id: original.id,
                                        question: original.question,
                                        isBudgetQuestion: original.isBudgetQuestion,
                                        order: original.order ?? q.order,
                                        options: original.options.map((opt) => ({
                                          id: opt.id,
                                          label: opt.label,
                                          value: opt.value,
                                        })),
                                      }
                                      : q
                                  )
                                )
                              }
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingQuestionId(question.id!)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteQuestion(question.id!)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Question Type Selection */}
                  {/* {editingQuestionId === question.id && (
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">Question Type:</span>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`type-${question.id}`}
                            checked={question.type === 'radio'}
                            onChange={() => {
                              setQuestions(
                                questions.map((q) =>
                                  q.id === question.id ? { ...q, type: 'radio' } : q
                                )
                              )
                            }}
                            className="w-4 h-4"
                          />
                          <span>Radio</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`type-${question.id}`}
                            checked={question.type === 'checkbox'}
                            onChange={() => {
                              setQuestions(
                                questions.map((q) =>
                                  q.id === question.id ? { ...q, type: 'checkbox' } : q
                                )
                              )
                            }}
                            className="w-4 h-4"
                          />
                          <span>Checkbox</span>
                        </label>
                      </div>
                    </div>
                  )} */}

                  {/* Options */}
                  <div className="space-y-3 grid grid-cols-2 gap-3">
                    {question.options.map((option) => (
                      <div key={option.id} className="flex items-center gap-3">
                        <Input
                          value={option.label}
                          onChange={(e) =>
                            handleOptionChange(question.id!, option.id, 'label', e.target.value)
                          }
                          placeholder={question.isBudgetQuestion ? 'Enter budget' : 'Type option'}
                          className="flex-1 bg-card rounded-full"
                          disabled={editingQuestionId !== question.id}
                        />
                        {question.isBudgetQuestion && (
                          <Input
                            type="number"
                            value={option.value || ''}
                            onChange={(e) =>
                              handleOptionChange(
                                question.id!,
                                option.id,
                                'value',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            placeholder="Enter Value"
                            className="w-32 bg-card rounded-full"
                            disabled={editingQuestionId !== question.id}
                          />
                        )}
                        {editingQuestionId === question.id && question.options.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveOption(question.id!, option.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {editingQuestionId === question.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddOption(question.id!)}
                        className="w-full border-dashed"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Option
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add Question Form */}
          {showAddQuestionForm && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {/* <Checkbox
                      checked={newQuestion.isEnabled}
                      onCheckedChange={(checked) =>
                        setNewQuestion({ ...newQuestion, isEnabled: checked as boolean })
                      }
                    /> */}
                    <Input
                      value={newQuestion.question}
                      onChange={(e) =>
                        setNewQuestion({ ...newQuestion, question: e.target.value })
                      }
                      placeholder="Enter Question"
                      className="flex-1 bg-card rounded-full"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowAddQuestionForm(false)
                        setNewQuestion({
                          question: '',
                          isBudgetQuestion: false,
                          order: questions.length + 1,
                          options: [{ id: Date.now().toString(), label: '' }],
                        })
                        setNewBudgetQuestion({
                          question: 'Approximate Budget',
                          isBudgetQuestion: true,
                          order: 1,
                          options: [
                            { id: Date.now().toString() + '-1', label: 'Under £500', value: 500 },
                            { id: Date.now().toString() + '-2', label: '£500 - £1000', value: 1000 },
                            { id: Date.now().toString() + '-3', label: 'Above $1000', value: 2000 },
                          ],
                        })
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* New question order number */}
                  <div className="flex  flex-col   gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span>Order number:</span>
                      <span className="text-xs text-gray-400">
                        (1 - {questions.length + 1})
                      </span>
                    </div>
                    <Input
                      type="number"
                      value={newQuestion.order === 0 ? '' : newQuestion.order}
                      onChange={(e) => {
                        const raw = e.target.value
                        const total = questions.length + 1

                        if (raw === '') {
                          setNewQuestion({ ...newQuestion, order: 0 })
                          return
                        }

                        const value = parseInt(raw, 10)
                        if (Number.isNaN(value)) return
                        if (value > total) return

                        setNewQuestion({ ...newQuestion, order: value })
                      }}
                      className="w-1/2  bg-card rounded-full"
                      min={1}
                      max={questions.length + 1}
                    />

                  </div>

                  {/* <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">Question Type:</span>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="new-question-type"
                          checked={newQuestion.type === 'radio'}
                          onChange={() => setNewQuestion({ ...newQuestion, type: 'radio' })}
                          className="w-4 h-4"
                        />
                        <span>Radio</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="new-question-type"
                          checked={newQuestion.type === 'checkbox'}
                          onChange={() => setNewQuestion({ ...newQuestion, type: 'checkbox' })}
                          className="w-4 h-4"
                        />
                        <span>Checkbox</span>
                      </label>
                    </div>
                  </div> */}

                  {/* <div className="flex items-center gap-2">
                    <Checkbox
                      checked={newQuestion.isPricing}
                      onCheckedChange={(checked) => {
                        if (checked && hasPricingQuestion) {
                          toast({
                            title: 'Error',
                            description: 'Pricing question already exists',
                            variant: 'destructive',
                          })
                          return
                        }
                        setNewQuestion({ ...newQuestion, isPricing: checked as boolean })
                      }}
                    />
                    <span className="text-sm">Pricing Question</span>
                  </div> */}

                  <div className="space-y-3 grid grid-cols-2 gap-3">
                    {newQuestion.options.map((option) => (
                      <div key={option.id} className="flex items-center gap-3">
                        <Input
                          value={option.label}
                          onChange={(e) => {
                            setNewQuestion({
                              ...newQuestion,
                              options: newQuestion.options.map((opt) =>
                                opt.id === option.id ? { ...opt, label: e.target.value } : opt
                              ),
                            })
                          }}
                          placeholder={newQuestion.isBudgetQuestion ? 'Enter budget' : 'Type option'}
                          className="flex-1 bg-card rounded-full"
                        />
                        {newQuestion.isBudgetQuestion && (
                          <Input
                            type="number"
                            value={option.value || ''}
                            onChange={(e) => {
                              setNewQuestion({
                                ...newQuestion,
                                options: newQuestion.options.map((opt) =>
                                  opt.id === option.id
                                    ? { ...opt, value: parseFloat(e.target.value) || 0 }
                                    : opt
                                ),
                              })
                            }}
                            placeholder="Enter Value"
                            className="w-32 bg-card rounded-full"
                          />
                        )}
                        {newQuestion.options.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setNewQuestion({
                                ...newQuestion,
                                options: newQuestion.options.filter((opt) => opt.id !== option.id),
                              })
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setNewQuestion({
                          ...newQuestion,
                          options: [
                            ...newQuestion.options,
                            { id: Date.now().toString(), label: '' },
                          ],
                        })
                      }}
                      className="w-full border-dashed"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Option
                    </Button>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddQuestionForm(false)
                        setNewQuestion({
                          question: '',
                          isBudgetQuestion: false,
                          order: questions.length + 1,
                          options: [{ id: Date.now().toString(), label: '' }],
                        })
                        setNewBudgetQuestion({
                          question: 'Approximate Budget',
                          isBudgetQuestion: true,
                          order: 1,
                          options: [
                            { id: Date.now().toString() + '-1', label: 'Under $500', value: 500 },
                            { id: Date.now().toString() + '-2', label: '$500 - $1000', value: 1000 },
                            { id: Date.now().toString() + '-3', label: 'Above £1000', value: 2000 },
                          ],
                        })
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddQuestion}>Add Questions</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Budget Question Form (always shown when adding questions) */}
          {showAddQuestionForm && !hasBudgetQuestion && (
            <Card className="border-2 border-primary">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-primary">Budget Question (Default)</span>
                    <Input
                      value={newBudgetQuestion.question}
                      onChange={(e) =>
                        setNewBudgetQuestion({ ...newBudgetQuestion, question: e.target.value })
                      }
                      placeholder="Approximate Budget"
                      className="flex-1 bg-card rounded-full"
                    />
                  </div>

                  <div className="space-y-3 grid grid-cols-2 gap-3">
                    {newBudgetQuestion.options.map((option) => (
                      <div key={option.id} className="flex items-center gap-3">
                        <Input
                          value={option.label}
                          onChange={(e) => {
                            setNewBudgetQuestion({
                              ...newBudgetQuestion,
                              options: newBudgetQuestion.options.map((opt) =>
                                opt.id === option.id ? { ...opt, label: e.target.value } : opt
                              ),
                            })
                          }}
                          placeholder="Enter budget"
                          className="flex-1 bg-card rounded-full"
                        />
                        <Input
                          type="number"
                          value={option.value || ''}
                          onChange={(e) => {
                            setNewBudgetQuestion({
                              ...newBudgetQuestion,
                              options: newBudgetQuestion.options.map((opt) =>
                                opt.id === option.id
                                  ? { ...opt, value: parseFloat(e.target.value) || 0 }
                                  : opt
                              ),
                            })
                          }}
                          placeholder="Enter Value"
                          className="w-32 bg-card rounded-full"
                        />
                        {newBudgetQuestion.options.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setNewBudgetQuestion({
                                ...newBudgetQuestion,
                                options: newBudgetQuestion.options.filter((opt) => opt.id !== option.id),
                              })
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setNewBudgetQuestion({
                          ...newBudgetQuestion,
                          options: [
                            ...newBudgetQuestion.options,
                            { id: Date.now().toString(), label: '', value: 0 },
                          ],
                        })
                      }}
                      className="w-full border-dashed"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Option
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add Question Button */}
          {!showAddQuestionForm && (
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  if (hasBudgetQuestion) {
                    setNewQuestion({ ...newQuestion, isBudgetQuestion: false })
                  }
                  setShowAddQuestionForm(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} size="lg">
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ServiceQuestion
