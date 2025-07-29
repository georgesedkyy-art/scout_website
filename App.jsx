import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import Login from './components/Login.jsx'
import AdminPanel from './components/AdminPanel.jsx'
import Reports from './components/Reports.jsx'
import ActivationForm from './components/ActivationForm.jsx'
import InteractiveFeatures from './components/InteractiveFeatures.jsx'
import { 
  Mountain, 
  Users, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  DollarSign, 
  AlertTriangle, 
  Clock,
  Key,
  MessageCircle,
  Bell
} from 'lucide-react'
import heroCamping from './assets/hero-camping.jpg'
import teamCamping from './assets/team-camping.jpg'
import hikingAdventure from './assets/hiking-adventure.jpg'
import groupPhoto from './assets/group-photo.jpg'

function App() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [showLogin, setShowLogin] = useState(false)
  const [showActivation, setShowActivation] = useState(false)
  const [showReports, setShowReports] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)

  // Check for existing login on app start
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const handleActivationSuccess = (activatedUser) => {
    setShowActivation(false)
    setShowLogin(true)
  }

  const scrollToSection = (sectionId) => {
    setShowReports(false)
    setShowLogin(false)
    setShowActivation(false)
    setShowAdmin(false)
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const showReportsSection = () => {
    setShowLogin(false)
    setShowAdmin(false)
    setShowActivation(false)
    setShowReports(true)
  }

  const showLoginSection = () => {
    setShowReports(false)
    setShowAdmin(false)
    setShowActivation(false)
    setShowLogin(true)
  }

  const showActivationSection = () => {
    setShowReports(false)
    setShowAdmin(false)
    setShowLogin(false)
    setShowActivation(true)
  }

  const showAdminPanelSection = () => {
    setShowReports(false)
    setShowLogin(false)
    setShowActivation(false)
    setShowAdmin(true)
  }

  const handleLogin = (userData, userToken) => {
    setUser(userData)
    setToken(userToken)
    setShowLogin(false)
    
    // Redirect to admin panel if user has permissions
    if (['admin', 'leader', 'full_editor'].includes(userData.role)) {
      showAdminPanelSection()
    } else {
      scrollToSection('home')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setToken(null)
    setShowAdmin(false)
    scrollToSection('home')
  }

  // Show activation form
  if (showActivation) {
    return <ActivationForm onActivationSuccess={handleActivationSuccess} />
  }

  // Show login page
  if (showLogin) {
    return <Login onLogin={handleLogin} />
  }

  // Show admin panel
  if (showAdmin && user && token) {
    return <AdminPanel user={user} token={token} onLogout={handleLogout} />
  }

  // Show reports page
  if (showReports) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Mountain className="h-8 w-8 text-green-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">فريق الكشافة</span>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={() => scrollToSection('home')}>
                  العودة للرئيسية
                </Button>
                {user && (
                  <Button variant="outline" onClick={showAdminPanelSection}>
                    لوحة التحكم
                  </Button>
                )}
              </div>
            </div>
          </div>
        </nav>
        <Reports />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Mountain className="h-8 w-8 text-green-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">فريق الكشافة</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => scrollToSection('home')}>الرئيسية</Button>
              <Button variant="ghost" onClick={() => scrollToSection('about')}>من نحن</Button>
              <Button variant="ghost" onClick={() => scrollToSection('activities')}>الأنشطة</Button>
              <Button variant="ghost" onClick={() => scrollToSection('join')}>انضم إلينا</Button>
              <Button variant="ghost" onClick={() => scrollToSection('contact')}>تواصل معنا</Button>
              <Button variant="outline" onClick={showReportsSection}>التقارير</Button>
              
              {user ? (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{user.username}</Badge>
                  {['admin', 'leader', 'full_editor'].includes(user.role) && (
                    <Button variant="outline" onClick={showAdminPanelSection}>
                      لوحة التحكم
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleLogout}>
                    تسجيل الخروج
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    onClick={showActivationSection}
                    className="flex items-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    تفعيل الحساب
                  </Button>
                  <Button variant="outline" onClick={showLoginSection}>
                    تسجيل الدخول
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroCamping})` }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            فريق الكشافة
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            نبني الشخصية ونطور المهارات من خلال المغامرة والتعلم
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
              onClick={() => scrollToSection('join')}
            >
              انضم إلى الفريق
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-black px-8 py-3"
              onClick={() => scrollToSection('activities')}
            >
              تعرف على أنشطتنا
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">من نحن</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              فريق كشفي متميز يهدف إلى تنمية الشباب وإعدادهم ليكونوا قادة المستقبل من خلال الأنشطة الكشفية المتنوعة
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>الروح الجماعية</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  نؤمن بقوة العمل الجماعي وأهمية التعاون في تحقيق الأهداف
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Mountain className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>المغامرة والاستكشاف</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  نقدم تجارب مثيرة في الطبيعة لتطوير الثقة بالنفس والمهارات العملية
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Badge className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>التطوير الشخصي</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  نركز على بناء الشخصية وتطوير المهارات القيادية والحياتية
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section id="activities" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">أنشطتنا</h2>
            <p className="text-xl text-gray-600">
              مجموعة متنوعة من الأنشطة المصممة لتطوير مهارات مختلفة
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="overflow-hidden">
              <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${teamCamping})` }}></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mountain className="h-5 w-5 text-green-600" />
                  المخيمات الكشفية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  مخيمات منتظمة في الطبيعة لتعلم مهارات البقاء والتخييم والطبخ في الهواء الطلق
                </p>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${hikingAdventure})` }}></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  رحلات الاستكشاف
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  رحلات استكشافية لاكتشاف الطبيعة وتعلم مهارات الملاحة والتوجه
                </p>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${groupPhoto})` }}></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  الأنشطة الاجتماعية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  فعاليات اجتماعية وخدمة مجتمعية لتطوير روح المسؤولية الاجتماعية
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Join Section */}
      <section id="join" className="py-20 bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-8">انضم إلى فريقنا</h2>
          <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
            هل أنت مستعد للمغامرة؟ انضم إلى فريق الكشافة وكن جزءاً من تجربة لا تُنسى
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/10 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">المتطلبات</h3>
              <ul className="text-left space-y-2">
                <li>• العمر: 12-18 سنة</li>
                <li>• الرغبة في التعلم والمغامرة</li>
                <li>• الالتزام بالأنشطة</li>
                <li>• موافقة ولي الأمر</li>
              </ul>
            </div>
            
            <div className="bg-white/10 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">ما ستحصل عليه</h3>
              <ul className="text-left space-y-2">
                <li>• تدريب كشفي متميز</li>
                <li>• شهادات معتمدة</li>
                <li>• رحلات ومخيمات</li>
                <li>• صداقات جديدة</li>
              </ul>
            </div>
            
            <div className="bg-white/10 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">خطوات التسجيل</h3>
              <ul className="text-left space-y-2">
                <li>• املأ استمارة التسجيل</li>
                <li>• احضر المقابلة الشخصية</li>
                <li>• احصل على كود التفعيل</li>
                <li>• ابدأ رحلتك الكشفية</li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3"
              onClick={showActivationSection}
            >
              <Key className="w-5 h-5 mr-2" />
              تفعيل الحساب
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-green-600 px-8 py-3"
              onClick={() => scrollToSection('contact')}
            >
              تواصل معنا
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">تواصل معنا</h2>
            <p className="text-xl text-gray-600">
              نحن هنا للإجابة على جميع استفساراتك
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold mb-6">معلومات التواصل</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Phone className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium">الهاتف</p>
                    <p className="text-gray-600">+966 50 123 4567</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Mail className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium">البريد الإلكتروني</p>
                    <p className="text-gray-600">info@scoutteam.sa</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <MapPin className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium">الموقع</p>
                    <p className="text-gray-600">الرياض، المملكة العربية السعودية</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Calendar className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium">أوقات العمل</p>
                    <p className="text-gray-600">السبت - الخميس: 4:00 م - 8:00 م</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold mb-6">أرسل لنا رسالة</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">الاسم</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="اسمك الكامل"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">الرسالة</label>
                  <textarea 
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="اكتب رسالتك هنا..."
                  ></textarea>
                </div>
                
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  إرسال الرسالة
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Mountain className="h-8 w-8 text-green-400" />
                <span className="ml-2 text-xl font-bold">فريق الكشافة</span>
              </div>
              <p className="text-gray-400">
                نبني الشخصية ونطور المهارات من خلال المغامرة والتعلم
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#home" className="hover:text-white">الرئيسية</a></li>
                <li><a href="#about" className="hover:text-white">من نحن</a></li>
                <li><a href="#activities" className="hover:text-white">الأنشطة</a></li>
                <li><a href="#join" className="hover:text-white">انضم إلينا</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">الأنشطة</h4>
              <ul className="space-y-2 text-gray-400">
                <li>المخيمات الكشفية</li>
                <li>رحلات الاستكشاف</li>
                <li>الأنشطة الاجتماعية</li>
                <li>التدريب والتطوير</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">تواصل معنا</h4>
              <ul className="space-y-2 text-gray-400">
                <li>+966 50 123 4567</li>
                <li>info@scoutteam.sa</li>
                <li>الرياض، السعودية</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 فريق الكشافة. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

