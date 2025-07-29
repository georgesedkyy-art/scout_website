import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import SiteCustomization from './SiteCustomization.jsx'
import DataSharing from './DataSharing.jsx'
import ActivationManagement from './ActivationManagement.jsx'
import InteractiveFeatures from './InteractiveFeatures.jsx'
import { 
  Users, 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  LogOut,
  Settings,
  DollarSign,
  AlertTriangle,
  Calendar,
  Palette,
  Share2,
  Key,
  MessageCircle
} from 'lucide-react'

const AdminPanel = ({ user, token, onLogout }) => {
  const [activeTab, setActiveTab] = useState('reports')
  const [reports, setReports] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingReport, setEditingReport] = useState(null)
  const [newReport, setNewReport] = useState({
    type: 'budget',
    title: '',
    content: '',
    data: {}
  })

  const apiCall = async (url, options = {}) => {
    const response = await fetch(`http://localhost:5000${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'حدث خطأ في الخادم')
    }
    
    return response.json()
  }

  const loadReports = async () => {
    try {
      setLoading(true)
      const [budgetRes, issuesRes, scheduleRes] = await Promise.all([
        apiCall('/api/reports/budget'),
        apiCall('/api/reports/issues'),
        apiCall('/api/reports/schedule')
      ])
      
      const allReports = [
        ...budgetRes.reports.map(r => ({ ...r, type: 'budget' })),
        ...issuesRes.reports.map(r => ({ ...r, type: 'issue' })),
        ...scheduleRes.reports.map(r => ({ ...r, type: 'schedule' }))
      ]
      
      setReports(allReports)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    if (!user.role || !['leader', 'admin'].includes(user.role)) return
    
    try {
      setLoading(true)
      const data = await apiCall('/api/reports/users')
      setUsers(data.users)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createReport = async () => {
    try {
      setLoading(true)
      const endpoint = `/api/reports/${newReport.type === 'issue' ? 'issues' : newReport.type}`
      const data = await apiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify(newReport)
      })
      
      setSuccess(data.message)
      setNewReport({ type: 'budget', title: '', content: '', data: {} })
      loadReports()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateReport = async (reportId, updatedData) => {
    try {
      setLoading(true)
      const data = await apiCall(`/api/reports/${reportId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedData)
      })
      
      setSuccess(data.message)
      setEditingReport(null)
      loadReports()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteReport = async (reportId) => {
    if (!confirm('هل أنت متأكد من حذف هذا التقرير؟')) return
    
    try {
      setLoading(true)
      const data = await apiCall(`/api/reports/${reportId}`, {
        method: 'DELETE'
      })
      
      setSuccess(data.message)
      loadReports()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId, newRole) => {
    try {
      setLoading(true)
      const data = await apiCall(`/api/reports/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole })
      })
      
      setSuccess(data.message)
      loadUsers()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
    loadUsers()
  }, [])

  const getReportIcon = (type) => {
    switch (type) {
      case 'budget': return <DollarSign className="w-4 h-4" />
      case 'issue': return <AlertTriangle className="w-4 h-4" />
      case 'schedule': return <Calendar className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getReportTypeLabel = (type) => {
    switch (type) {
      case 'budget': return 'ميزانية'
      case 'issue': return 'مشكلة'
      case 'schedule': return 'جدول زمني'
      default: return 'تقرير'
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'full_editor': return 'bg-purple-100 text-purple-800'
      case 'leader': return 'bg-blue-100 text-blue-800'
      case 'member': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'مدير'
      case 'full_editor': return 'محرر كامل'
      case 'leader': return 'قائد'
      case 'member': return 'عضو'
      default: return 'غير محدد'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold">🏕️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">لوحة التحكم</h1>
                <p className="text-sm text-muted-foreground">
                  مرحباً، {user.full_name || user.username} ({getRoleLabel(user.role)})
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`grid w-full ${['full_editor', 'admin'].includes(user.role) ? 'grid-cols-6' : ['leader'].includes(user.role) ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              التقارير
            </TabsTrigger>
            <TabsTrigger value="interaction" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              التفاعل
            </TabsTrigger>
            {['leader', 'full_editor', 'admin'].includes(user.role) && (
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                المستخدمين
              </TabsTrigger>
            )}
            {['leader', 'full_editor', 'admin'].includes(user.role) && (
              <TabsTrigger value="activation" className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                التفعيل
              </TabsTrigger>
            )}
            {['leader', 'full_editor', 'admin'].includes(user.role) && (
              <TabsTrigger value="sharing" className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                المشاركة
              </TabsTrigger>
            )}
            {['full_editor', 'admin'].includes(user.role) && (
              <TabsTrigger value="customization" className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                التخصيص
              </TabsTrigger>
            )}
          </TabsList>

          {/* Reports Management */}
          <TabsContent value="reports" className="space-y-6">
            {/* Create New Report */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  إنشاء تقرير جديد
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reportType">نوع التقرير</Label>
                    <select
                      id="reportType"
                      className="w-full p-2 border rounded-md"
                      value={newReport.type}
                      onChange={(e) => setNewReport({ ...newReport, type: e.target.value })}
                    >
                      <option value="budget">ميزانية</option>
                      <option value="issue">مشكلة</option>
                      <option value="schedule">جدول زمني</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="reportTitle">العنوان</Label>
                    <Input
                      id="reportTitle"
                      value={newReport.title}
                      onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                      placeholder="أدخل عنوان التقرير"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="reportContent">المحتوى</Label>
                  <Textarea
                    id="reportContent"
                    value={newReport.content}
                    onChange={(e) => setNewReport({ ...newReport, content: e.target.value })}
                    placeholder="أدخل محتوى التقرير"
                    rows={4}
                  />
                </div>
                <Button onClick={createReport} disabled={loading || !newReport.title}>
                  <Plus className="w-4 h-4 mr-2" />
                  إنشاء التقرير
                </Button>
              </CardContent>
            </Card>

            {/* Reports List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">التقارير الحالية</h3>
              {reports.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">لا توجد تقارير حالياً</p>
                  </CardContent>
                </Card>
              ) : (
                reports.map((report) => (
                  <Card key={report.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          {getReportIcon(report.type)}
                          <div>
                            <CardTitle className="text-lg">{report.title}</CardTitle>
                            <CardDescription>
                              {getReportTypeLabel(report.type)} • بواسطة {report.creator_name} • 
                              {new Date(report.created_at).toLocaleDateString('ar-SA')}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingReport(report)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteReport(report.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {report.content && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{report.content}</p>
                      </CardContent>
                    )}
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Users Management */}
          {['leader', 'admin'].includes(user.role) && (
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    إدارة المستخدمين
                  </CardTitle>
                  <CardDescription>
                    عرض وإدارة جميع مستخدمي النظام
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">{u.full_name || u.username}</h4>
                          <p className="text-sm text-muted-foreground">{u.email}</p>
                          <p className="text-sm text-muted-foreground">
                            انضم في: {new Date(u.created_at).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getRoleColor(u.role)}>
                            {getRoleLabel(u.role)}
                          </Badge>
                          {user.role === 'admin' && u.id !== user.id && (
                            <select
                              value={u.role}
                              onChange={(e) => updateUserRole(u.id, e.target.value)}
                              className="p-1 border rounded text-sm"
                            >
                              <option value="member">عضو</option>
                              <option value="leader">قائد</option>
                              <option value="admin">مدير</option>
                            </select>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Edit Report Modal */}
      {editingReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>تعديل التقرير</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="editTitle">العنوان</Label>
                <Input
                  id="editTitle"
                  value={editingReport.title}
                  onChange={(e) => setEditingReport({ ...editingReport, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editContent">المحتوى</Label>
                <Textarea
                  id="editContent"
                  value={editingReport.content || ''}
                  onChange={(e) => setEditingReport({ ...editingReport, content: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => updateReport(editingReport.id, {
                    title: editingReport.title,
                    content: editingReport.content
                  })}
                  disabled={loading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  حفظ
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingReport(null)}
                >
                  إلغاء
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

          {/* Interactive Features */}
          <TabsContent value="interaction">
            <InteractiveFeatures 
              token={token} 
              user={user} 
              reportId={editingReport?.id} 
              reportTitle={editingReport?.title}
            />
          </TabsContent>

          {/* Activation Management */}
          {['leader', 'full_editor', 'admin'].includes(user.role) && (
            <TabsContent value="activation">
              <ActivationManagement token={token} />
            </TabsContent>
          )}

          {/* Data Sharing */}
          {['leader', 'full_editor', 'admin'].includes(user.role) && (
            <TabsContent value="sharing">
              <DataSharing token={token} reports={reports} />
            </TabsContent>
          )}

          {/* Site Customization */}
          {['full_editor', 'admin'].includes(user.role) && (
            <TabsContent value="customization">
              <SiteCustomization token={token} />
            </TabsContent>
          )}
    </div>
  )
}

export default AdminPanel

