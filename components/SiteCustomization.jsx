import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Upload, Palette, Settings, Users, BarChart3 } from 'lucide-react';

const SiteCustomization = ({ token }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [participants, setParticipants] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [newParticipant, setNewParticipant] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    role: 'scout',
    emergency_contact: '',
    emergency_phone: '',
    medical_info: ''
  });

  useEffect(() => {
    loadSettings();
    loadParticipants();
    loadStatistics();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadParticipants = async () => {
    try {
      const response = await fetch('/api/participants', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setParticipants(data);
      }
    } catch (error) {
      console.error('Error loading participants:', error);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await fetch('/api/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setMessage('تم حفظ الإعدادات بنجاح');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('حدث خطأ في حفظ الإعدادات');
      }
    } catch (error) {
      setMessage('حدث خطأ في الاتصال');
    }
    setLoading(false);
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('logo', file);

    setLoading(true);
    try {
      const response = await fetch('/api/settings/upload-logo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({ ...prev, logo_url: data.logo_url }));
        setMessage('تم رفع الشعار بنجاح');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('حدث خطأ في رفع الشعار');
      }
    } catch (error) {
      setMessage('حدث خطأ في الاتصال');
    }
    setLoading(false);
  };

  const addParticipant = async () => {
    if (!newParticipant.name) {
      setMessage('يرجى إدخال اسم المشارك');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/participants', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newParticipant)
      });

      if (response.ok) {
        setMessage('تم إضافة المشارك بنجاح');
        setNewParticipant({
          name: '',
          email: '',
          phone: '',
          age: '',
          role: 'scout',
          emergency_contact: '',
          emergency_phone: '',
          medical_info: ''
        });
        loadParticipants();
        loadStatistics();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('حدث خطأ في إضافة المشارك');
      }
    } catch (error) {
      setMessage('حدث خطأ في الاتصال');
    }
    setLoading(false);
  };

  return (
    <div className=\"max-w-6xl mx-auto p-6 space-y-6\">
      <div className=\"flex items-center gap-2 mb-6\">
        <Settings className=\"h-6 w-6\" />
        <h1 className=\"text-2xl font-bold\">إعدادات الموقع المتقدمة</h1>
      </div>

      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue=\"appearance\" className=\"w-full\">
        <TabsList className=\"grid w-full grid-cols-4\">
          <TabsTrigger value=\"appearance\" className=\"flex items-center gap-2\">
            <Palette className=\"h-4 w-4\" />
            المظهر
          </TabsTrigger>
          <TabsTrigger value=\"content\" className=\"flex items-center gap-2\">
            <Settings className=\"h-4 w-4\" />
            المحتوى
          </TabsTrigger>
          <TabsTrigger value=\"participants\" className=\"flex items-center gap-2\">
            <Users className=\"h-4 w-4\" />
            المشاركون
          </TabsTrigger>
          <TabsTrigger value=\"statistics\" className=\"flex items-center gap-2\">
            <BarChart3 className=\"h-4 w-4\" />
            الإحصائيات
          </TabsTrigger>
        </TabsList>

        <TabsContent value=\"appearance\" className=\"space-y-6\">
          <Card>
            <CardHeader>
              <CardTitle>تخصيص المظهر</CardTitle>
              <CardDescription>قم بتخصيص شعار الموقع والألوان</CardDescription>
            </CardHeader>
            <CardContent className=\"space-y-4\">
              <div className=\"space-y-2\">
                <Label>الشعار الحالي</Label>
                {settings.logo_url && (
                  <img 
                    src={settings.logo_url} 
                    alt=\"الشعار\" 
                    className=\"h-16 w-16 object-contain border rounded\"
                  />
                )}
                <div className=\"flex items-center gap-2\">
                  <Input
                    type=\"file\"
                    accept=\"image/*\"
                    onChange={handleLogoUpload}
                    className=\"flex-1\"
                  />
                  <Upload className=\"h-4 w-4\" />
                </div>
              </div>

              <div className=\"grid grid-cols-1 md:grid-cols-3 gap-4\">
                <div className=\"space-y-2\">
                  <Label>اللون الأساسي</Label>
                  <div className=\"flex items-center gap-2\">
                    <Input
                      type=\"color\"
                      value={settings.primary_color || '#2d5016'}
                      onChange={(e) => handleSettingChange('primary_color', e.target.value)}
                      className=\"w-12 h-10\"
                    />
                    <Input
                      type=\"text\"
                      value={settings.primary_color || '#2d5016'}
                      onChange={(e) => handleSettingChange('primary_color', e.target.value)}
                      className=\"flex-1\"
                    />
                  </div>
                </div>

                <div className=\"space-y-2\">
                  <Label>اللون الثانوي</Label>
                  <div className=\"flex items-center gap-2\">
                    <Input
                      type=\"color\"
                      value={settings.secondary_color || '#8b4513'}
                      onChange={(e) => handleSettingChange('secondary_color', e.target.value)}
                      className=\"w-12 h-10\"
                    />
                    <Input
                      type=\"text\"
                      value={settings.secondary_color || '#8b4513'}
                      onChange={(e) => handleSettingChange('secondary_color', e.target.value)}
                      className=\"flex-1\"
                    />
                  </div>
                </div>

                <div className=\"space-y-2\">
                  <Label>لون التمييز</Label>
                  <div className=\"flex items-center gap-2\">
                    <Input
                      type=\"color\"
                      value={settings.accent_color || '#ff6b35'}
                      onChange={(e) => handleSettingChange('accent_color', e.target.value)}
                      className=\"w-12 h-10\"
                    />
                    <Input
                      type=\"text\"
                      value={settings.accent_color || '#ff6b35'}
                      onChange={(e) => handleSettingChange('accent_color', e.target.value)}
                      className=\"flex-1\"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value=\"content\" className=\"space-y-6\">
          <Card>
            <CardHeader>
              <CardTitle>محتوى الموقع</CardTitle>
              <CardDescription>قم بتعديل النصوص الأساسية للموقع</CardDescription>
            </CardHeader>
            <CardContent className=\"space-y-4\">
              <div className=\"space-y-2\">
                <Label>عنوان الموقع</Label>
                <Input
                  value={settings.site_title || ''}
                  onChange={(e) => handleSettingChange('site_title', e.target.value)}
                  placeholder=\"فريق الكشافة\"
                />
              </div>

              <div className=\"space-y-2\">
                <Label>وصف الموقع</Label>
                <Textarea
                  value={settings.site_description || ''}
                  onChange={(e) => handleSettingChange('site_description', e.target.value)}
                  placeholder=\"انضم إلى فريق الكشافة واكتشف عالماً مليئاً بالمغامرات والصداقات والتعلم\"
                  rows={3}
                />
              </div>

              <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
                <div className=\"space-y-2\">
                  <Label>رقم الهاتف</Label>
                  <Input
                    value={settings.contact_phone || ''}
                    onChange={(e) => handleSettingChange('contact_phone', e.target.value)}
                    placeholder=\"+966 50 123 4567\"
                  />
                </div>

                <div className=\"space-y-2\">
                  <Label>البريد الإلكتروني</Label>
                  <Input
                    value={settings.contact_email || ''}
                    onChange={(e) => handleSettingChange('contact_email', e.target.value)}
                    placeholder=\"info@scoutteam.sa\"
                  />
                </div>
              </div>

              <div className=\"space-y-2\">
                <Label>العنوان</Label>
                <Input
                  value={settings.contact_address || ''}
                  onChange={(e) => handleSettingChange('contact_address', e.target.value)}
                  placeholder=\"الرياض، المملكة العربية السعودية\"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value=\"participants\" className=\"space-y-6\">
          <Card>
            <CardHeader>
              <CardTitle>إضافة مشارك جديد</CardTitle>
              <CardDescription>أضف بيانات مشارك جديد في الفريق</CardDescription>
            </CardHeader>
            <CardContent className=\"space-y-4\">
              <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
                <div className=\"space-y-2\">
                  <Label>الاسم *</Label>
                  <Input
                    value={newParticipant.name}
                    onChange={(e) => setNewParticipant(prev => ({ ...prev, name: e.target.value }))}
                    placeholder=\"اسم المشارك\"
                  />
                </div>

                <div className=\"space-y-2\">
                  <Label>العمر</Label>
                  <Input
                    type=\"number\"
                    value={newParticipant.age}
                    onChange={(e) => setNewParticipant(prev => ({ ...prev, age: e.target.value }))}
                    placeholder=\"العمر\"
                  />
                </div>

                <div className=\"space-y-2\">
                  <Label>البريد الإلكتروني</Label>
                  <Input
                    type=\"email\"
                    value={newParticipant.email}
                    onChange={(e) => setNewParticipant(prev => ({ ...prev, email: e.target.value }))}
                    placeholder=\"البريد الإلكتروني\"
                  />
                </div>

                <div className=\"space-y-2\">
                  <Label>رقم الهاتف</Label>
                  <Input
                    value={newParticipant.phone}
                    onChange={(e) => setNewParticipant(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder=\"رقم الهاتف\"
                  />
                </div>

                <div className=\"space-y-2\">
                  <Label>جهة الاتصال في الطوارئ</Label>
                  <Input
                    value={newParticipant.emergency_contact}
                    onChange={(e) => setNewParticipant(prev => ({ ...prev, emergency_contact: e.target.value }))}
                    placeholder=\"اسم جهة الاتصال\"
                  />
                </div>

                <div className=\"space-y-2\">
                  <Label>رقم الطوارئ</Label>
                  <Input
                    value={newParticipant.emergency_phone}
                    onChange={(e) => setNewParticipant(prev => ({ ...prev, emergency_phone: e.target.value }))}
                    placeholder=\"رقم الطوارئ\"
                  />
                </div>
              </div>

              <div className=\"space-y-2\">
                <Label>معلومات طبية</Label>
                <Textarea
                  value={newParticipant.medical_info}
                  onChange={(e) => setNewParticipant(prev => ({ ...prev, medical_info: e.target.value }))}
                  placeholder=\"أي معلومات طبية مهمة\"
                  rows={2}
                />
              </div>

              <Button onClick={addParticipant} disabled={loading} className=\"w-full\">
                {loading ? 'جاري الإضافة...' : 'إضافة المشارك'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>قائمة المشاركين ({participants.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className=\"space-y-2 max-h-96 overflow-y-auto\">
                {participants.map((participant) => (
                  <div key={participant.id} className=\"flex items-center justify-between p-3 border rounded\">
                    <div>
                      <div className=\"font-medium\">{participant.name}</div>
                      <div className=\"text-sm text-gray-600\">
                        {participant.age && `العمر: ${participant.age}`}
                        {participant.phone && ` • الهاتف: ${participant.phone}`}
                      </div>
                    </div>
                    <div className=\"text-sm text-gray-500\">
                      {participant.role === 'scout' ? 'كشاف' : 
                       participant.role === 'leader' ? 'قائد' : 'مساعد'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value=\"statistics\" className=\"space-y-6\">
          <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6\">
            <Card>
              <CardHeader>
                <CardTitle>المشاركون النشطون</CardTitle>
              </CardHeader>
              <CardContent>
                <div className=\"text-3xl font-bold text-green-600\">
                  {statistics.total_participants || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>إجمالي الأنشطة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className=\"text-3xl font-bold text-blue-600\">
                  {statistics.total_activities || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الأنشطة المكتملة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className=\"text-3xl font-bold text-purple-600\">
                  {statistics.completed_activities || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الأنشطة القادمة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className=\"text-3xl font-bold text-orange-600\">
                  {statistics.upcoming_activities || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>إجمالي التقارير</CardTitle>
              </CardHeader>
              <CardContent>
                <div className=\"text-3xl font-bold text-red-600\">
                  {statistics.total_reports || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>المستخدمون النشطون</CardTitle>
              </CardHeader>
              <CardContent>
                <div className=\"text-3xl font-bold text-teal-600\">
                  {statistics.active_users || 0}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className=\"flex justify-end\">
        <Button onClick={saveSettings} disabled={loading} size=\"lg\">
          {loading ? 'جاري الحفظ...' : 'حفظ جميع الإعدادات'}
        </Button>
      </div>
    </div>
  );
};

export default SiteCustomization;

