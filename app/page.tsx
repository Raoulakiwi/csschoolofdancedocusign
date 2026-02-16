'use client'

import { useState, useRef } from 'react'
import SignatureCanvas from 'react-signature-canvas'

export default function ConsentForm() {
  const [formData, setFormData] = useState({
    childName: '',
    childDOB: '',
    childAddress: '',
    parentName: '',
    relationshipToChild: '',
    parentPhone: '',
    parentEmail: '',
    
    // Consent for Photography & Video ('yes' | 'no' | '')
    photographyConsent: '' as '' | 'yes' | 'no',
    
    // Use of Images and Video (single consent for all purposes)
    useOfImagesConsent: false,
    
    // Duration of Consent
    durationCurrentYear: false,
    durationFullInvolvement: false,
    durationOther: false,
    durationOtherText: '',
    
    // Safety Considerations
    safetyConcerns: 'no',
    safetyConcernsDetails: '',
  })
  
  const [signatureType, setSignatureType] = useState<'draw' | 'type'>('draw')
  const [typedSignature, setTypedSignature] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  
  const signatureRef = useRef<SignatureCanvas>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    // Handle photography consent (mutually exclusive)
    if (name === 'photographyConsentYes' || name === 'photographyConsentNo') {
      setFormData(prev => ({
        ...prev,
        photographyConsent: name === 'photographyConsentYes' ? (checked ? 'yes' : '') : (checked ? 'no' : ''),
      }))
      return
    }
    // Handle duration radio-like behavior
    if (name === 'durationCurrentYear' || name === 'durationFullInvolvement' || name === 'durationOther') {
      setFormData(prev => ({
        ...prev,
        durationCurrentYear: name === 'durationCurrentYear' ? checked : false,
        durationFullInvolvement: name === 'durationFullInvolvement' ? checked : false,
        durationOther: name === 'durationOther' ? checked : false,
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  const clearSignature = () => {
    if (signatureType === 'draw' && signatureRef.current) {
      signatureRef.current.clear()
    } else {
      setTypedSignature('')
    }
  }

  const validateForm = () => {
    // Child Details
    if (!formData.childName.trim()) return 'Child\'s full name is required'
    if (!formData.childDOB.trim()) return 'Child\'s date of birth is required'
    if (!formData.childAddress.trim()) return 'Child\'s address is required'
    
    // Parent/Guardian Details
    if (!formData.parentName.trim()) return 'Parent/Guardian name is required'
    if (!formData.relationshipToChild.trim()) return 'Relationship to child is required'
    if (!formData.parentPhone.trim()) return 'Parent phone number is required'
    if (!formData.parentEmail.trim()) return 'Parent email address is required'
    if (!formData.parentEmail.includes('@')) return 'Please enter a valid email address'
    
    // Consent for Photography & Video - one option must be selected
    if (formData.photographyConsent !== 'yes' && formData.photographyConsent !== 'no') {
      return 'Please select either "I DO give consent" or "I DO NOT give consent" for photography and video'
    }
    
    // Use of Images - consent must be given
    if (!formData.useOfImagesConsent) {
      return 'Please confirm your consent for the use of images and video as described above'
    }
    
    // Duration - exactly one must be selected
    const durationCount = [
      formData.durationCurrentYear, 
      formData.durationFullInvolvement, 
      formData.durationOther
    ].filter(Boolean).length
    
    if (durationCount === 0) return 'Please select a duration for this consent'
    
    if (formData.durationOther && !formData.durationOtherText.trim()) {
      return 'Please specify the duration in the "Other" field'
    }
    
    // Safety Concerns
    if (formData.safetyConcerns === 'yes' && !formData.safetyConcernsDetails.trim()) {
      return 'Please provide details about safety concerns'
    }
    
    // Signature
    if (signatureType === 'draw' && signatureRef.current) {
      if (signatureRef.current.isEmpty()) return 'Please provide your signature'
    } else if (signatureType === 'type' && !typedSignature.trim()) {
      return 'Please type your signature'
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setErrorMessage(validationError)
      setSubmitStatus('error')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      let signatureData = ''
      if (signatureType === 'draw' && signatureRef.current) {
        signatureData = signatureRef.current.toDataURL()
      } else {
        signatureData = typedSignature
      }

      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          signature: signatureData,
          signatureType,
          submissionDate: new Date().toISOString(),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit form')
      }

      setSubmitStatus('success')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      
      // Reset form
      setFormData({
        childName: '',
        childDOB: '',
        childAddress: '',
        parentName: '',
        relationshipToChild: '',
        parentPhone: '',
        parentEmail: '',
        photographyConsent: '' as '' | 'yes' | 'no',
        useOfImagesConsent: false,
        durationCurrentYear: false,
        durationFullInvolvement: false,
        durationOther: false,
        durationOtherText: '',
        safetyConcerns: 'no',
        safetyConcernsDetails: '',
      })
      setTypedSignature('')
      if (signatureRef.current) {
        signatureRef.current.clear()
      }
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred while submitting the form')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <img 
              src="/logo.png" 
              alt="Caroline Small School of Dance Logo" 
              className="h-32 mx-auto mb-6"
            />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Caroline Small School of Dance
            </h1>
            <p className="text-lg text-gray-600">Child Photography & Video Consent Form</p>
          </div>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">✓ Form submitted successfully!</p>
              <p className="text-green-700 text-sm mt-1">
                You and the school will receive a copy via email shortly.
              </p>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">✗ Error submitting form</p>
              <p className="text-red-700 text-sm mt-1">{errorMessage}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Organisation Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-purple-200 pb-2">
                Organisation Details
              </h2>
              <p className="text-sm text-gray-600">Organisation Name: <strong>Caroline Small School of Dance</strong></p>
            </div>

            {/* 1. Child Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-purple-200 pb-2">
                1. Child Details
              </h2>
              
              <div>
                <label htmlFor="childName" className="block text-sm font-medium text-gray-700 mb-1">
                  Child's Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="childName"
                  name="childName"
                  value={formData.childName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter child's full name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="childDOB" className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="childDOB"
                    name="childDOB"
                    value={formData.childDOB}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="childAddress" className="block text-sm font-medium text-gray-700 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="childAddress"
                    name="childAddress"
                    value={formData.childAddress}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Child's address"
                  />
                </div>
              </div>
            </div>

            {/* 2. Parent / Guardian Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-purple-200 pb-2">
                2. Parent / Guardian Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="parentName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="parentName"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label htmlFor="relationshipToChild" className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship to Child <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="relationshipToChild"
                    name="relationshipToChild"
                    value={formData.relationshipToChild}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Mother, Father, Guardian"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="parentPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="parentPhone"
                    name="parentPhone"
                    value={formData.parentPhone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Your contact number"
                  />
                </div>

                <div>
                  <label htmlFor="parentEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="parentEmail"
                    name="parentEmail"
                    value={formData.parentEmail}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Your email address"
                  />
                </div>
              </div>
            </div>

            {/* 3. Consent for Photography & Video */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-purple-200 pb-2">
                3. Consent for Photography & Video
              </h2>
              <p className="text-sm text-gray-700">
                <span className="text-red-500">* (select one)</span>
              </p>
              
              <div className="space-y-3 ml-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="photographyConsentYes"
                    checked={formData.photographyConsent === 'yes'}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">I DO give consent for my child to be photographed and/or videoed.</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="photographyConsentNo"
                    checked={formData.photographyConsent === 'no'}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">I DO NOT give consent for my child to be photographed and/or videoed.</span>
                </label>
              </div>

              <p className="text-sm text-gray-600 mt-4">
                during activities, events, classes, programs, or related activities conducted by Caroline Small School of Dance.
              </p>
            </div>

            {/* 4. Use of Images and Video */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-purple-200 pb-2">
                4. Use of Images and Video
              </h2>
              <p className="text-sm text-gray-700">
                I understand and agree that photographs and/or video recordings of my child may be used for the following purposes: social media (e.g., Facebook, Instagram, YouTube), organisation website, promotional materials (print and digital), advertising and marketing campaigns, newsletters, and media releases. <span className="text-red-500">*</span>
              </p>
              
              <label className="flex items-start space-x-3 ml-4">
                <input
                  type="checkbox"
                  name="useOfImagesConsent"
                  checked={formData.useOfImagesConsent}
                  onChange={handleInputChange}
                  className="mt-1 h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="text-gray-700">I consent to the use of my child&apos;s images and/or video for all of the purposes listed above.</span>
              </label>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700"><strong>I understand that:</strong></p>
                <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1 ml-2">
                  <li>Images and video may be published online and may be accessible to the public.</li>
                  <li>The organisation will not publish my child's full name without additional permission.</li>
                  <li>The organisation will use images respectfully and in a manner consistent with its values and policies.</li>
                  <li>I will not receive payment for the use of these images or recordings.</li>
                </ul>
              </div>
            </div>

            {/* 5. Duration of Consent */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-purple-200 pb-2">
                5. Duration of Consent
              </h2>
              <p className="text-sm text-gray-700">
                This consent: <span className="text-red-500">* (select one)</span>
              </p>
              
              <div className="space-y-3 ml-4">
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="durationCurrentYear"
                    checked={formData.durationCurrentYear}
                    onChange={handleInputChange}
                    className="mt-1 h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Applies for the current calendar year only</span>
                </label>

                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="durationFullInvolvement"
                    checked={formData.durationFullInvolvement}
                    onChange={handleInputChange}
                    className="mt-1 h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Applies for the duration of my child's involvement with the organisation</span>
                </label>

                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="durationOther"
                    checked={formData.durationOther}
                    onChange={handleInputChange}
                    className="mt-1 h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <span className="text-gray-700">Other (please specify):</span>
                    {formData.durationOther && (
                      <input
                        type="text"
                        name="durationOtherText"
                        value={formData.durationOtherText}
                        onChange={handleInputChange}
                        className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Please specify duration"
                      />
                    )}
                  </div>
                </label>
              </div>

              <p className="text-sm text-gray-600 mt-4 italic">
                I understand that I may withdraw consent in writing at any time, however withdrawal will not affect materials already published.
              </p>
            </div>

            {/* 6. Medical / Safety Considerations */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-purple-200 pb-2">
                6. Medical / Safety Considerations
              </h2>
              <p className="text-sm text-gray-700">
                Are there any legal, custody, or safety concerns regarding publication of your child's image? <span className="text-red-500">*</span>
              </p>
              
              <div className="space-y-3 ml-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="safetyConcerns"
                    value="no"
                    checked={formData.safetyConcerns === 'no'}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300"
                  />
                  <span className="text-gray-700">No</span>
                </label>

                <label className="flex items-start space-x-3">
                  <input
                    type="radio"
                    name="safetyConcerns"
                    value="yes"
                    checked={formData.safetyConcerns === 'yes'}
                    onChange={handleInputChange}
                    className="mt-1 h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300"
                  />
                  <div className="flex-1">
                    <span className="text-gray-700">Yes (please provide details below)</span>
                    {formData.safetyConcerns === 'yes' && (
                      <textarea
                        name="safetyConcernsDetails"
                        value={formData.safetyConcernsDetails}
                        onChange={handleInputChange}
                        rows={4}
                        className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Please provide details about any concerns..."
                      />
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* 7. Declaration */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-purple-200 pb-2">
                7. Declaration
              </h2>
              
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-gray-700 mb-3"><strong>I confirm that:</strong></p>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2">
                  <li>I am the parent or legal guardian of the above-named child.</li>
                  <li>I have read and understood this consent form.</li>
                  <li>I voluntarily agree to the photography and video recording of my child as outlined above.</li>
                </ul>
              </div>
            </div>

            {/* Signature Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-purple-200 pb-2">
                Parent / Guardian Signature <span className="text-red-500">*</span>
              </h2>
              
              {/* Signature Type Toggle */}
              <div className="flex space-x-4 mb-4">
                <button
                  type="button"
                  onClick={() => setSignatureType('draw')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    signatureType === 'draw'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Draw Signature
                </button>
                <button
                  type="button"
                  onClick={() => setSignatureType('type')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    signatureType === 'type'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Type Signature
                </button>
              </div>

              {/* Draw Signature */}
              {signatureType === 'draw' && (
                <div>
                  <SignatureCanvas
                    ref={signatureRef}
                    canvasProps={{
                      className: 'signature-canvas w-full h-40 bg-white',
                    }}
                  />
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Clear Signature
                  </button>
                </div>
              )}

              {/* Type Signature */}
              {signatureType === 'type' && (
                <div>
                  <input
                    type="text"
                    value={typedSignature}
                    onChange={(e) => setTypedSignature(e.target.value)}
                    placeholder="Type your full name"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-2xl font-signature focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    style={{ fontFamily: 'cursive' }}
                  />
                  <p className="mt-2 text-sm text-gray-600">
                    By typing your name, you agree that this constitutes a legal signature.
                  </p>
                </div>
              )}

              <div className="text-sm text-gray-600 mt-4">
                <p>Date: {new Date().toLocaleDateString('en-AU', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Consent Form'}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
            <p>Caroline Small School of Dance</p>
            <p className="mt-1">For questions, please contact the school directly.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
