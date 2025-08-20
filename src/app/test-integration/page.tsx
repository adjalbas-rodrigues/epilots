'use client'

import { useState } from 'react'
import apiClient from '@/lib/api'

export default function TestIntegrationPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (test: string, status: 'success' | 'error', details: any) => {
    setResults(prev => [...prev, { test, status, details, timestamp: new Date().toISOString() }])
  }

  const testLogin = async () => {
    try {
      const response = await apiClient.loginStudent('joao@example.com', '123456')
      addResult('Login Student', 'success', response)
      return true
    } catch (error: any) {
      addResult('Login Student', 'error', error.message)
      return false
    }
  }

  const testGetSubjects = async () => {
    try {
      const response = await apiClient.getSubjects()
      addResult('Get Subjects', 'success', { count: response.data?.length || 0, data: response })
      return true
    } catch (error: any) {
      addResult('Get Subjects', 'error', error.message)
      return false
    }
  }

  const testGetProfile = async () => {
    try {
      const response = await apiClient.getStudentProfile()
      addResult('Get Student Profile', 'success', response)
      return true
    } catch (error: any) {
      addResult('Get Student Profile', 'error', error.message)
      return false
    }
  }

  const runAllTests = async () => {
    setLoading(true)
    setResults([])

    // Test 1: Login
    const loginSuccess = await testLogin()
    
    if (loginSuccess) {
      // Test 2: Get Subjects
      await testGetSubjects()
      
      // Test 3: Get Profile
      await testGetProfile()
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Teste de Integração Frontend/Backend</h1>
        
        <div className="mb-6">
          <button
            onClick={runAllTests}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Executando testes...' : 'Executar Testes'}
          </button>
        </div>

        <div className="space-y-4">
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                result.status === 'success' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-lg ${
                  result.status === 'success' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {result.status === 'success' ? '✅' : '❌'}
                </span>
                <h3 className="font-semibold">{result.test}</h3>
                <span className="text-sm text-gray-500">{result.timestamp}</span>
              </div>
              <pre className="text-sm overflow-x-auto bg-white p-2 rounded">
                {JSON.stringify(result.details, null, 2)}
              </pre>
            </div>
          ))}
        </div>

        {results.length === 0 && !loading && (
          <div className="text-center text-gray-500 py-12">
            Clique em &quot;Executar Testes&quot; para começar
          </div>
        )}
      </div>
    </div>
  )
}