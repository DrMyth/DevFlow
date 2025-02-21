import EditorPanel from '@/app/components/EditorPanel'
import Footer from '@/app/components/Footer'
import Header from '@/app/components/Header'
import OutputPanel from '@/app/components/OutputPanel'
import React from 'react'

const EditorPage = () => {
  return (
    <div className="min-h-screen">
      <div className="max-w-[1800px] mx-auto p-4">
        <Header />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <EditorPanel />
          <OutputPanel />
        </div>

      </div>
    </div>
  )
}

export default EditorPage