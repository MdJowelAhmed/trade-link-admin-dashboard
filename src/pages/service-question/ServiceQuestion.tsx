import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { FormSelect } from '@/components/common'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { addServiceQuestion, updateServiceQuestion, deleteServiceQuestion } from '@/redux/slices/serviceQuestionSlice'
import type { ServiceQuestion, QuestionType } from '@/types'
import { toast } from '@/utils/toast'

interface QuestionOption {
  id: string
  label: string
  value?: string
  price?: number
}

interface QuestionForm {
  id?: string
  question: string
  type: QuestionType
  isEnabled: boolean
  isPricing: boolean
  orderNumber: number
  options: QuestionOption[]
}

const ServiceQuestion = () => {
  const dispatch = useAppDispatch()
  const { list: categories } = useAppSelector((state) => state.categories)
  const { list: services } = useAppSelector((state) => state.services)
  const { list: serviceQuestions } = useAppSelector((state) => state.serviceQuestions)

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [selectedServiceId, setSelectedServiceId] = useState<string>('')
  const [questions, setQuestions] = useState<QuestionForm[]>([])
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [showAddQuestionForm, setShowAddQuestionForm] = useState(false)
  const [newQuestion, setNewQuestion] = useState<QuestionForm>({
    question: '',
    type: 'radio',
    isEnabled: true,
    isPricing: false,
    orderNumber: 1,
    options: [{ id: Date.now().toString(), label: '' }],
  })

  // Get services for selected category
  const categoryServices = useMemo(() => {
    if (!selectedCategoryId) return []
    return services.filter((s) => s.categoryId === selectedCategoryId && s.status === 'active')
  }, [selectedCategoryId, services])

  // Get questions for selected service
  const serviceQuestionsList = useMemo(() => {
    if (!selectedServiceId) return []
    return serviceQuestions.filter((q) => q.serviceId === selectedServiceId)
  }, [selectedServiceId, serviceQuestions])

  // Check if pricing question exists
  const hasPricingQuestion = useMemo(() => {
    return serviceQuestionsList.some((q) => q.isPricing)
  }, [serviceQuestionsList])

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
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

    // Load existing questions for this service from store
    const existingQuestionsFromStore = serviceQuestions.filter(
      (q) => q.serviceId === serviceId
    )

    // If no questions exist yet for this service, create one normal + one pricing question by default
    if (existingQuestionsFromStore.length === 0 && selectedCategoryId) {
      const timestamp = Date.now()

      const baseOptions: QuestionOption[] = [
        { id: `${timestamp}-opt-1`, label: '' },
      ]

      const defaultQuestion: ServiceQuestion = {
        id: `${timestamp}-q-1`,
        serviceId,
        categoryId: selectedCategoryId,
        question: 'What best describes the work?',
        type: 'radio',
        isEnabled: true,
        isPricing: false,
        orderNumber: 1,
        options: baseOptions.map((opt) => ({
          ...opt,
          value: opt.label,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const pricingOptions: QuestionOption[] = [
        { id: `${timestamp}-opt-2`, label: '' },
      ]

      const pricingQuestion: ServiceQuestion = {
        id: `${timestamp}-q-2`,
        serviceId,
        categoryId: selectedCategoryId,
        question: 'Approximate Budget',
        type: 'radio',
        isEnabled: true,
        isPricing: true,
        orderNumber: 2,
        options: pricingOptions.map((opt) => ({
          ...opt,
          value: opt.label,
          price: undefined,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Persist defaults in store
      dispatch(addServiceQuestion(defaultQuestion))
      dispatch(addServiceQuestion(pricingQuestion))

      // And load into local state for editing
      const initialQuestions: QuestionForm[] = [
        {
          id: defaultQuestion.id,
          question: defaultQuestion.question,
          type: defaultQuestion.type,
          isEnabled: defaultQuestion.isEnabled,
          isPricing: defaultQuestion.isPricing,
          orderNumber: defaultQuestion.orderNumber,
          options: baseOptions,
        },
        {
          id: pricingQuestion.id,
          question: pricingQuestion.question,
          type: pricingQuestion.type,
          isEnabled: pricingQuestion.isEnabled,
          isPricing: pricingQuestion.isPricing,
          orderNumber: pricingQuestion.orderNumber,
          options: pricingOptions,
        },
      ]

      setQuestions(initialQuestions)
      return
    }

    // Otherwise just map existing questions into local editable state
    const existingQuestions = existingQuestionsFromStore.map((q, index) => ({
      id: q.id,
      question: q.question,
      type: q.type,
      isEnabled: q.isEnabled,
      isPricing: q.isPricing,
      orderNumber: q.orderNumber ?? index + 1,
      options: q.options,
    }))

    setQuestions(existingQuestions)
  }

  const handleAddQuestion = () => {
    if (!selectedServiceId) {
      toast({ title: 'Error', description: 'Please select a service first', variant: 'destructive' })
      return
    }

    if (newQuestion.isPricing && hasPricingQuestion) {
      toast({ title: 'Error', description: 'Pricing question already exists. Only one pricing question is allowed.', variant: 'destructive' })
      return
    }

    if (!newQuestion.question.trim()) {
      toast({ title: 'Error', description: 'Please enter a question', variant: 'destructive' })
      return
    }

    const totalAfterAdd = questions.length + 1
    if (
      !Number.isInteger(newQuestion.orderNumber) ||
      newQuestion.orderNumber < 1 ||
      newQuestion.orderNumber > totalAfterAdd
    ) {
      toast({
        title: 'Error',
        description: `Order number must be between 1 and ${totalAfterAdd}`,
        variant: 'destructive',
      })
      return
    }

    if (newQuestion.options.length === 0 || newQuestion.options.some((opt) => !opt.label.trim())) {
      toast({ title: 'Error', description: 'Please add at least one valid option', variant: 'destructive' })
      return
    }

    const questionData: ServiceQuestion = {
      id: Date.now().toString(),
      serviceId: selectedServiceId,
      categoryId: selectedCategoryId,
      question: newQuestion.question,
      type: newQuestion.type,
      isEnabled: newQuestion.isEnabled,
      isPricing: newQuestion.isPricing,
      orderNumber: newQuestion.orderNumber,
      options: newQuestion.options.map((opt) => ({
        id: opt.id,
        label: opt.label,
        value: opt.value || opt.label,
        price: opt.price,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    dispatch(addServiceQuestion(questionData))

    // Insert into local array based on orderNumber so order is respected
    const updatedQuestions = [...questions, { ...newQuestion, id: questionData.id }]
      .sort((a, b) => a.orderNumber - b.orderNumber)

    setQuestions(updatedQuestions)
    setNewQuestion({
      question: '',
      type: 'radio',
      isEnabled: true,
      isPricing: false,
      // next default order = current total questions + 1 (after add)
      orderNumber: totalAfterAdd + 1,
      options: [{ id: Date.now().toString(), label: '' }],
    })
    setShowAddQuestionForm(false)
    toast({ title: 'Success', description: 'Question added successfully' })
  }

  const handleUpdateQuestion = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId)
    if (!question) return

    if (question.isPricing && hasPricingQuestion && question.id !== questionId) {
      toast({ title: 'Error', description: 'Pricing question already exists', variant: 'destructive' })
      return
    }

    if (!question.question.trim()) {
      toast({ title: 'Error', description: 'Please enter a question', variant: 'destructive' })
      return
    }

    const totalQuestions = questions.length
    if (
      !Number.isInteger(question.orderNumber) ||
      question.orderNumber < 1 ||
      question.orderNumber > totalQuestions
    ) {
      toast({
        title: 'Error',
        description: `Order number must be between 1 and ${totalQuestions}`,
        variant: 'destructive',
      })
      return
    }

    const updatedQuestion: ServiceQuestion = {
      id: questionId,
      serviceId: selectedServiceId,
      categoryId: selectedCategoryId,
      question: question.question,
      type: question.type,
      isEnabled: question.isEnabled,
      isPricing: question.isPricing,
      orderNumber: question.orderNumber,
      options: question.options.map((opt) => ({
        id: opt.id,
        label: opt.label,
        value: opt.value || opt.label,
        price: opt.price,
      })),
      createdAt: serviceQuestions.find((q) => q.id === questionId)?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    dispatch(updateServiceQuestion(updatedQuestion))
    setEditingQuestionId(null)
    toast({ title: 'Success', description: 'Question updated successfully' })
  }

  const handleDeleteQuestion = (questionId: string) => {
    dispatch(deleteServiceQuestion(questionId))
    setQuestions(questions.filter((q) => q.id !== questionId))
    toast({ title: 'Success', description: 'Question deleted successfully' })
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

  const handleOptionChange = (questionId: string, optionId: string, field: 'label' | 'value' | 'price', value: string | number) => {
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

  const handleSave = () => {
    if (!selectedServiceId) {
      toast({ title: 'Error', description: 'Please select a service first', variant: 'destructive' })
      return
    }

    // Save all questions (already validated when updating)
    questions
      .slice()
      .sort((a, b) => a.orderNumber - b.orderNumber)
      .forEach((q) => {
        if (q.id) {
          handleUpdateQuestion(q.id)
        }
      })

    toast({ title: 'Success', description: 'All questions saved successfully' })
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
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
      {selectedCategoryId && categoryServices.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3">
              {categoryServices.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceSelect(service.id)}
                  className={`px-6 py-[10px] rounded-full font-medium transition-colors ${
                    selectedServiceId === service.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {service.name}
                </button>
              ))}
            </div>
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
                            value={question.orderNumber === 0 ? '' : question.orderNumber}
                            onChange={(e) => {
                              const raw = e.target.value
                              const total = questions.length

                              if (raw === '') {
                                // Allow clearing to empty (stored as 0 temporarily)
                                setQuestions(
                                  questions.map((q) =>
                                    q.id === question.id ? { ...q, orderNumber: 0 } : q
                                  )
                                )
                                return
                              }

                              const value = parseInt(raw, 10)
                              if (Number.isNaN(value)) return
                              if (value > total) return

                              setQuestions(
                                questions.map((q) =>
                                  q.id === question.id ? { ...q, orderNumber: value } : q
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
                                          type: original.type,
                                          isEnabled: original.isEnabled,
                                          isPricing: original.isPricing,
                                          orderNumber: original.orderNumber ?? q.orderNumber,
                                          options: original.options as QuestionOption[],
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
                          placeholder={question.isPricing ? 'Enter budget' : 'Type option'}
                          className="flex-1 bg-card rounded-full"
                          disabled={editingQuestionId !== question.id}
                        />
                        {question.isPricing && (
                          <Input
                            type="number"
                            value={option.price || ''}
                            onChange={(e) =>
                              handleOptionChange(
                                question.id!,
                                option.id,
                                'price',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            placeholder="Enter Price"
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
                          type: 'radio',
                          isEnabled: true,
                          isPricing: false,
                          orderNumber: questions.length + 1,
                          options: [{ id: Date.now().toString(), label: '' }],
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
                      value={newQuestion.orderNumber === 0 ? '' : newQuestion.orderNumber}
                      onChange={(e) => {
                        const raw = e.target.value
                        const total = questions.length + 1

                        if (raw === '') {
                          setNewQuestion({ ...newQuestion, orderNumber: 0 })
                          return
                        }

                        const value = parseInt(raw, 10)
                        if (Number.isNaN(value)) return
                        if (value > total) return

                        setNewQuestion({ ...newQuestion, orderNumber: value })
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
                          placeholder={newQuestion.isPricing ? 'Enter budget' : 'Type option'}
                          className="flex-1 bg-card rounded-full"
                        />
                        {newQuestion.isPricing && (
                          <Input
                            type="number"
                            value={option.price || ''}
                            onChange={(e) => {
                              setNewQuestion({
                                ...newQuestion,
                                options: newQuestion.options.map((opt) =>
                                  opt.id === option.id
                                    ? { ...opt, price: parseFloat(e.target.value) || 0 }
                                    : opt
                                ),
                              })
                            }}
                            placeholder="Enter Price"
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
                          type: 'radio',
                          isEnabled: true,
                          isPricing: false,
                          orderNumber: questions.length + 1,
                          options: [{ id: Date.now().toString(), label: '' }],
                        })
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddQuestion}>Add Question</Button>
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
                  if (hasPricingQuestion) {
                    setNewQuestion({ ...newQuestion, isPricing: false })
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
