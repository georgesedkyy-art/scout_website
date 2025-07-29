import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Users,
  Target,
  FileText
} from 'lucide-react'

const Reports = () => {
  const [activeTab, setActiveTab] = useState('budget')

  // Sample budget data
  const budgetData = {
    totalBudget: 50000,
    spent: 32000,
    remaining: 18000,
    categories: [
      { name: 'معدات التخييم', budget: 15000, spent: 12000, remaining: 3000 },
      { name: 'النقل والمواصلات', budget: 10000, spent: 8500, remaining: 1500 },
      { name: 'الطعام والمؤن', budget: 12000, spent: 7000, remaining: 5000 },
      { name: 'الأنشطة والفعاليات', budget: 8000, spent: 3500, remaining: 4500 },
      { name: 'الطوارئ', budget: 5000, spent: 1000, remaining: 4000 }
    ]
  }

  // Sample issues data
  const issuesData = [
    {
      id: 1,
      title: 'نقص في معدات التخييم',
      description: 'نحتاج إلى خيام إضافية للرحلة القادمة',
      status: 'حل',
      priority: 'عالية',
      solution: 'تم شراء 5 خيام جديدة من الميزانية المخصصة',
      date: '2025-01-15',
      resolvedDate: '2025-01-20'
    },
    {
      id: 2,
      title: 'تأخير في وصول الحافلة',
      description: 'الحافلة تأخرت 30 دقيقة في الرحلة الأخيرة',
      status: 'قيد المعالجة',
      priority: 'متوسطة',
      solution: 'التواصل مع شركة نقل جديدة للرحلات القادمة',
      date: '2025-01-18'
    },
    {
      id: 3,
      title: 'عدم كفاية الطعام',
      description: 'كمية الطعام لم تكن كافية لجميع المشاركين',
      status: 'جديدة',
      priority: 'عالية',
      solution: 'مراجعة حساب الكميات وإضافة 20% احتياطي',
      date: '2025-01-22'
    }
  ]

  // Sample schedule data
  const scheduleData = [
    {
      id: 1,
      title: 'رحلة تخييم شتوية',
      date: '2025-02-15',
      time: '08:00',
      duration: '3 أيام',
      location: 'جبال السروات',
      participants: 25,
      status: 'مؤكدة'
    },
    {
      id: 2,
      title: 'ورشة الإسعافات الأولية',
      date: '2025-02-08',
      time: '16:00',
      duration: '4 ساعات',
      location: 'المركز الكشفي',
      participants: 15,
      status: 'مؤكدة'
    },
    {
      id: 3,
      title: 'رحلة استكشافية',
      date: '2025-03-01',
      time: '07:00',
      duration: 'يوم واحد',
      location: 'وادي حنيفة',
      participants: 20,
      status: 'مخططة'
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'حل': return 'bg-green-100 text-green-800'
      case 'قيد المعالجة': return 'bg-yellow-100 text-yellow-800'
      case 'جديدة': return 'bg-red-100 text-red-800'
      case 'مؤكدة': return 'bg-green-100 text-green-800'
      case 'مخططة': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'عالية': return 'bg-red-100 text-red-800'
      case 'متوسطة': return 'bg-yellow-100 text-yellow-800'
      case 'منخفضة': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gradient">تقارير الفريق</h1>
        <p className="text-xl text-muted-foreground">
          متابعة شاملة للميزانية والمشاكل والجدول الزمني
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="budget" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            الميزانية
          </TabsTrigger>
          <TabsTrigger value="issues" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            المشاكل والحلول
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            الجدول الزمني
          </TabsTrigger>
        </TabsList>

        {/* Budget Tab */}
        <TabsContent value="budget" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الميزانية</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{budgetData.totalBudget.toLocaleString()} ريال</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">المصروف</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{budgetData.spent.toLocaleString()} ريال</div>
                <p className="text-xs text-muted-foreground">
                  {((budgetData.spent / budgetData.totalBudget) * 100).toFixed(1)}% من الميزانية
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">المتبقي</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{budgetData.remaining.toLocaleString()} ريال</div>
                <p className="text-xs text-muted-foreground">
                  {((budgetData.remaining / budgetData.totalBudget) * 100).toFixed(1)}% متبقية
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>تفصيل الميزانية حسب الفئات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgetData.categories.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{category.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {category.spent.toLocaleString()} / {category.budget.toLocaleString()} ريال
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${(category.spent / category.budget) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>مصروف: {((category.spent / category.budget) * 100).toFixed(1)}%</span>
                      <span>متبقي: {category.remaining.toLocaleString()} ريال</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Issues Tab */}
        <TabsContent value="issues" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي المشاكل</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{issuesData.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">تم حلها</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {issuesData.filter(issue => issue.status === 'حل').length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">قيد المعالجة</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {issuesData.filter(issue => issue.status !== 'حل').length}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {issuesData.map((issue) => (
              <Card key={issue.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{issue.title}</CardTitle>
                      <CardDescription className="mt-2">{issue.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(issue.status)}>
                        {issue.status}
                      </Badge>
                      <Badge className={getPriorityColor(issue.priority)}>
                        {issue.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="font-semibold text-sm">الحل المقترح/المطبق:</span>
                      <p className="text-sm text-muted-foreground mt-1">{issue.solution}</p>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>تاريخ الإبلاغ: {issue.date}</span>
                      {issue.resolvedDate && (
                        <span>تاريخ الحل: {issue.resolvedDate}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الأنشطة المجدولة</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{scheduleData.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي المشاركين</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {scheduleData.reduce((total, event) => total + event.participants, 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {scheduleData.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <CardDescription className="mt-2 flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {event.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {event.time}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">المدة: {event.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">المشاركون: {event.participants} شخص</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">الموقع:</span>
                        <span className="text-sm text-muted-foreground">{event.location}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Reports

