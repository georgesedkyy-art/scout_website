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
    setShowReports(true)
    setShowLogin(false)
    setShowAdminPanel(false)
    setActiveSection('reports')
  }

  const showLoginSection = () =>   const showLoginSection = () => {
    setShowReports(false)
    setShowAdmin(false)
    setShowActivation(false)
    setShowLogin(true)
  }

  const showAdminPanelSection = () => {
    setShowReports(false)
    setShowLogin(false)
    setShowActivation(false)
    setShowAdmin(true)
  }handleLogin = (userData, userToken) => {
    setUser(userData)
    setToken(userToken)
    setShowLogin(false)
    
    // Redirect to admin panel if user has permissions
    if (['admin', 'leader'].includes(userData.role)) {
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
  } Show activation form
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
        {/* Navigation */}
        <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b z-50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">🏕️</span>
                </div>
                <span className="font-bold text-xl text-primary">فريق الكشافة</span>
              </div>
              <div className="hidden md:flex space-x-6">
                <button onClick={() => scrollToSection('home')} className="text-foreground hover:text-primary transition-colors">الرئيسية</button>
                <button onClick={() => scrollToSection('about')} className="text-foreground hover:text-primary transition-colors">من نحن</button>
                <button onClick={() => scrollToSection('activities')} className="text-foreground hover:text-primary transition-colors">أنشطتنا</button>
                <button onClick={showReportsSection} className="text-primary font-semibold">التقارير</button>
                <button onClick={() => scrollToSection('join')} className="text-foreground hover:text-primary transition-colors">انضم إلينا</button>
                <button onClick={() => scrollToSection('contact')} className="text-foreground hover:text-primary transition-colors">اتصل بنا</button>
              </div>
              <div className="flex items-center gap-2">
                {user ? (
                  <>
                    {['admin', 'leader'].includes(user.role) && (
                      <Button variant="outline" onClick={showAdminPanelSection}>
                        لوحة التحكم
                      </Button>
                    )}
                    <Button variant="outline" onClick={handleLogout}>
                      تسجيل الخروج
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={showLoginSection}>
                    <LogIn className="w-4 h-4 mr-2" />
                    تسجيل الدخول
                  </Button>
                )}
              </div>
            </div>
          </div>
        </nav>

        <div className="pt-20">
          <Reports />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">🏕️</span>
              </div>
              <span className="font-bold text-xl text-primary">فريق الكشافة</span>
            </div>
            <div className="hidden md:flex space-x-6">
              <button onClick={() => scrollToSection('home')} className="text-foreground hover:text-primary transition-colors">الرئيسية</button>
              <button onClick={() => scrollToSection('about')} className="text-foreground hover:text-primary transition-colors">من نحن</button>
              <button onClick={() => scrollToSection('activities')} className="text-foreground hover:text-primary transition-colors">أنشطتنا</button>
              <button onClick={showReportsSection} className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
                <FileText className="w-4 h-4" />
                التقارير
              </button>
              <button onClick={() => scrollToSection('join')} className="text-foreground hover:text-primary transition-colors">انضم إلينا</button>
              <button onClick={() => scrollToSection('contact')} className="text-foreground hover:text-primary transition-colors">اتصل بنا</button>
            </div>
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <span className="text-sm text-muted-foreground">
                    مرحباً، {user.full_name || user.username}
                  </span>
                  {['admin', 'leader'].includes(user.role) && (
                    <Button variant="outline" onClick={showAdminPanelSection}>
                      لوحة التحكم
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleLogout}>
                    تسجيل الخروج
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={showLoginSection}>
                  <LogIn className="w-4 h-4 mr-2" />
                  تسجيل الدخول
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroCamping})` }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            مغامرة تبدأ هنا
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            انضم إلى فريق الكشافة واكتشف عالماً مليئاً بالمغامرات والصداقات والتعلم
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-white px-8 py-3"
              onClick={() => scrollToSection('join')}
            >
              ابدأ مغامرتك
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-primary px-8 py-3"
              onClick={() => scrollToSection('activities')}
            >
              اكتشف أنشطتنا
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-primary px-8 py-3"
              onClick={showReportsSection}
            >
              <FileText className="w-5 h-5 mr-2" />
              عرض التقارير
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-primary-foreground/80">عضو نشط</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5</div>
              <div className="text-primary-foreground/80">سنوات من الخبرة</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100+</div>
              <div className="text-primary-foreground/80">مغامرة مكتملة</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">15</div>
              <div className="text-primary-foreground/80">جائزة وإنجاز</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gradient">من نحن</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              فريق الكشافة هو مجتمع من الشباب المتحمسين للمغامرة والتعلم والنمو معاً
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src={groupPhoto} 
                alt="فريق الكشافة" 
                className="rounded-lg shadow-lg w-full h-auto"
              />
            </div>
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-primary">رسالتنا</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                نهدف إلى تنمية شخصيات الشباب من خلال الأنشطة الخارجية والمغامرات التي تعزز الثقة بالنفس، 
                والقيادة، والعمل الجماعي. نؤمن بأن كل شاب لديه إمكانات عظيمة يمكن إطلاقها من خلال التجارب الصحيحة.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Award className="text-accent w-6 h-6" />
                  <span className="font-semibold">التميز</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="text-accent w-6 h-6" />
                  <span className="font-semibold">العمل الجماعي</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="text-accent w-6 h-6" />
                  <span className="font-semibold">المغامرة</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="text-accent w-6 h-6" />
                  <span className="font-semibold">الانضباط</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section id="activities" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gradient">أنشطتنا</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              مجموعة متنوعة من الأنشطة المثيرة التي تناسب جميع الأعمار والاهتمامات
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="card-hover">
              <CardHeader>
                <div className="w-full h-48 bg-cover bg-center rounded-lg mb-4" 
                     style={{ backgroundImage: `url(${teamCamping})` }}></div>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  التخييم والمغامرات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  رحلات تخييم في الطبيعة لتعلم مهارات البقاء والاستمتاع بجمال الطبيعة
                </CardDescription>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="secondary">أسبوعي</Badge>
                  <Badge variant="secondary">جميع الأعمار</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <div className="w-full h-48 bg-cover bg-center rounded-lg mb-4" 
                     style={{ backgroundImage: `url(${hikingAdventure})` }}></div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  المشي والاستكشاف
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  رحلات استكشافية لاكتشاف المناطق الطبيعية وتعلم مهارات الملاحة
                </CardDescription>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="secondary">شهري</Badge>
                  <Badge variant="secondary">متقدم</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <div className="w-full h-48 bg-primary/10 rounded-lg mb-4 flex items-center justify-center">
                  <Award className="w-16 h-16 text-primary" />
                </div>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  ورش المهارات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  ورش تدريبية لتعلم مهارات جديدة مثل الإسعافات الأولية والطبخ في الطبيعة
                </CardDescription>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="secondary">أسبوعي</Badge>
                  <Badge variant="secondary">تعليمي</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              <Calendar className="w-5 h-5 mr-2" />
              عرض جدول الأنشطة
            </Button>
          </div>
        </div>
      </section>

      {/* Join Section */}
      <section id="join" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gradient">انضم إلى فريقنا</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              ابدأ رحلتك معنا واكتشف إمكانياتك الحقيقية
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>متطلبات الانضمام</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                  <span>العمر: من 10 إلى 18 سنة</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                  <span>الحماس للمغامرة والتعلم</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                  <span>الالتزام بحضور الأنشطة</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                  <span>موافقة ولي الأمر</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>كيفية الانضمام</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <span>تواصل معنا عبر الهاتف أو البريد الإلكتروني</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <span>احضر جلسة تعريفية مجانية</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <span>املأ استمارة التسجيل</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <span>ابدأ مغامرتك معنا!</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-white px-8 py-3">
              سجل الآن
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gradient">تواصل معنا</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              نحن هنا للإجابة على جميع استفساراتك
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <Phone className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle>الهاتف</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">+966 50 123 4567</p>
                <p className="text-muted-foreground">متاح يومياً من 9 صباحاً إلى 6 مساءً</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle>البريد الإلكتروني</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">info@scoutteam.sa</p>
                <p className="text-muted-foreground">سنرد عليك خلال 24 ساعة</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle>الموقع</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">الرياض، المملكة العربية السعودية</p>
                <p className="text-muted-foreground">نلتقي كل جمعة في المركز الكشفي</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
              <Clock className="w-5 h-5" />
              <span>أوقات اللقاءات: كل جمعة من 4 إلى 7 مساءً</span>
            </div>
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              احجز موعد زيارة
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">🏕️</span>
                </div>
                <span className="font-bold text-xl">فريق الكشافة</span>
              </div>
              <p className="text-primary-foreground/80">
                نبني شخصيات قوية من خلال المغامرة والتعلم
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">روابط سريعة</h4>
              <div className="space-y-2">
                <button onClick={() => scrollToSection('about')} className="block text-primary-foreground/80 hover:text-white transition-colors">من نحن</button>
                <button onClick={() => scrollToSection('activities')} className="block text-primary-foreground/80 hover:text-white transition-colors">أنشطتنا</button>
                <button onClick={showReportsSection} className="block text-primary-foreground/80 hover:text-white transition-colors">التقارير</button>
                <button onClick={() => scrollToSection('join')} className="block text-primary-foreground/80 hover:text-white transition-colors">انضم إلينا</button>
                <button onClick={() => scrollToSection('contact')} className="block text-primary-foreground/80 hover:text-white transition-colors">اتصل بنا</button>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">تابعنا</h4>
              <div className="flex space-x-4">
                <Button variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-primary">
                  فيسبوك
                </Button>
                <Button variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-primary">
                  إنستغرام
                </Button>
                <Button variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-primary">
                  تويتر
                </Button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-8 pt-8 text-center">
            <p className="text-primary-foreground/60">
              © 2025 فريق الكشافة. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

