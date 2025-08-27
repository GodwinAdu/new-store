"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Save, Upload, Download, Trash2, Star, Copy, Edit } from "lucide-react"
import { toast } from "sonner"

interface Template {
  id: string
  name: string
  description: string
  settings: any
  createdAt: string
  isDefault?: boolean
}

interface TemplateManagerProps {
  currentSettings: any
  onApplyTemplate: (settings: any) => void
  onSaveTemplate: (template: Template) => void
}

export default function TemplateManager({ currentSettings, onApplyTemplate, onSaveTemplate }: TemplateManagerProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
  })

  // Load templates from localStorage on mount
  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = () => {
    const savedTemplates: Template[] = []
    
    // Load from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('label-template-')) {
        try {
          const template = JSON.parse(localStorage.getItem(key) || '')
          savedTemplates.push(template)
        } catch (error) {
          console.error('Error loading template:', error)
        }
      }
    }
    
    // Add default templates
    const defaultTemplates: Template[] = [
      {
        id: 'standard',
        name: 'Standard Label',
        description: 'Basic product label with name, SKU, and price',
        createdAt: new Date().toISOString(),
        isDefault: true,
        settings: {
          includeName: true,
          includeSKU: true,
          includePrice: true,
          includeBarcode: true,
          includeQRCode: false,
          fontSize: 10,
          fontFamily: 'Arial',
          backgroundColor: '#ffffff',
          textColor: '#000000',
          borderWidth: 1,
          borderColor: '#000000',
          padding: 4
        }
      },
      {
        id: 'minimal',
        name: 'Minimal Design',
        description: 'Clean and simple label design',
        createdAt: new Date().toISOString(),
        isDefault: true,
        settings: {
          includeName: true,
          includeSKU: false,
          includePrice: true,
          includeBarcode: false,
          includeQRCode: false,
          fontSize: 12,
          fontFamily: 'Helvetica',
          backgroundColor: '#ffffff',
          textColor: '#000000',
          borderWidth: 0,
          borderColor: '#000000',
          padding: 6
        }
      },
      {
        id: 'premium',
        name: 'Premium Label',
        description: 'Professional label with all features',
        createdAt: new Date().toISOString(),
        isDefault: true,
        settings: {
          includeName: true,
          includeSKU: true,
          includePrice: true,
          includeBarcode: true,
          includeQRCode: true,
          includeDate: true,
          includeCategory: true,
          fontSize: 9,
          fontFamily: 'Roboto',
          backgroundColor: '#f8f9fa',
          textColor: '#212529',
          borderWidth: 2,
          borderColor: '#007bff',
          padding: 8
        }
      }
    ]
    
    setTemplates([...defaultTemplates, ...savedTemplates])
  }

  const saveTemplate = () => {
    if (!newTemplate.name.trim()) {
      toast.error('Please enter a template name')
      return
    }

    const template: Template = {
      id: `custom-${Date.now()}`,
      name: newTemplate.name,
      description: newTemplate.description,
      settings: { ...currentSettings },
      createdAt: new Date().toISOString()
    }

    // Save to localStorage
    localStorage.setItem(`label-template-${template.id}`, JSON.stringify(template))
    
    // Update state
    setTemplates(prev => [...prev, template])
    onSaveTemplate(template)
    
    // Reset form
    setNewTemplate({ name: '', description: '' })
    setIsCreateDialogOpen(false)
    
    toast.success(`Template "${template.name}" saved successfully`)
  }

  const deleteTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template?.isDefault) {
      toast.error('Cannot delete default templates')
      return
    }

    // Remove from localStorage
    localStorage.removeItem(`label-template-${templateId}`)
    
    // Update state
    setTemplates(prev => prev.filter(t => t.id !== templateId))
    
    toast.success('Template deleted successfully')
  }

  const duplicateTemplate = (template: Template) => {
    const newTemplate: Template = {
      ...template,
      id: `custom-${Date.now()}`,
      name: `${template.name} (Copy)`,
      createdAt: new Date().toISOString(),
      isDefault: false
    }

    // Save to localStorage
    localStorage.setItem(`label-template-${newTemplate.id}`, JSON.stringify(newTemplate))
    
    // Update state
    setTemplates(prev => [...prev, newTemplate])
    
    toast.success(`Template duplicated as "${newTemplate.name}"`)
  }

  const exportTemplates = () => {
    const customTemplates = templates.filter(t => !t.isDefault)
    const dataStr = JSON.stringify(customTemplates, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `label-templates-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    URL.revokeObjectURL(url)
    toast.success('Templates exported successfully')
  }

  const importTemplates = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedTemplates: Template[] = JSON.parse(e.target?.result as string)
        
        importedTemplates.forEach(template => {
          const newId = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          const newTemplate = { ...template, id: newId, isDefault: false }
          
          localStorage.setItem(`label-template-${newId}`, JSON.stringify(newTemplate))
        })
        
        loadTemplates()
        toast.success(`Imported ${importedTemplates.length} templates`)
      } catch (error) {
        toast.error('Error importing templates. Please check the file format.')
      }
    }
    
    reader.readAsText(file)
    event.target.value = '' // Reset input
  }

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Template Manager</h3>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".json"
            onChange={importTemplates}
            className="hidden"
            id="import-templates"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('import-templates')?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={exportTemplates}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Current
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Template</DialogTitle>
                <DialogDescription>
                  Save your current label settings as a reusable template
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input
                    placeholder="Enter template name..."
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Textarea
                    placeholder="Describe this template..."
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={saveTemplate}>
                    Save Template
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {template.name}
                    {template.isDefault && (
                      <Badge variant="secondary" className="text-xs">
                        Default
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {template.description}
                  </CardDescription>
                </div>
                
                {!template.isDefault && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => duplicateTemplate(template)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-destructive"
                      onClick={() => deleteTemplate(template.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-2">
                {/* Template Preview Info */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Font: {template.settings.fontFamily} ({template.settings.fontSize}px)</div>
                  <div className="flex gap-2">
                    {template.settings.includeName && <Badge variant="outline" className="text-xs">Name</Badge>}
                    {template.settings.includePrice && <Badge variant="outline" className="text-xs">Price</Badge>}
                    {template.settings.includeBarcode && <Badge variant="outline" className="text-xs">Barcode</Badge>}
                    {template.settings.includeQRCode && <Badge variant="outline" className="text-xs">QR</Badge>}
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => onApplyTemplate(template.settings)}
                >
                  <Star className="h-3 w-3 mr-2" />
                  Apply Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}