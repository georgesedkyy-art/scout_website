import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { 
  Key, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Users, 
  BarChart3,
  Calendar,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

const ActivationManagement = ({ token }) => {
  const [activationCodes, setActivationCodes] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingCode, setEditingCode] = useState(null);
  const [newCode, setNewCode] = useState({
    description: '',
    max_uses: 1,
    expires_in_days: 30
  });

  useEffect(() => {
    loadActivationCodes();
    loadStats();
  }, []);

  const loadActivationCodes = async () => {
    try {
      const response = await fetch('/api/activation-codes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setActivationCodes(data);
      }
    } catch (error) {
      console.error('Error loading activation codes:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/activation-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const createActivationCode = async () => {
    if (!newCode.description) {
      setMessage('يرجى إدخال وصف للكود');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/activation-codes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCode)
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`تم إنشاء كود التفعيل بنجاح: ${data.code.code}`);
        setNewCode({ description: '', max_uses: 1, expires_in_days: 30 });
        loadActivationCodes();
        loadStats();
      } else {
        const data = await response.json();
        setMessage(data.error || 'حدث خطأ في إنشاء الكود');
      }
    } catch (error) {
      setMessage('حدث خطأ في الاتصال');
    }
    setLoading(false);
  };

  const updateActivationCode = async (codeId, updates) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/activation-codes/${codeId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        setMessage('تم تحديث كود التفعيل بنجاح');
        setEditingCode(null);
        loadActivationCodes();
        loadStats();
      } else {
        const data = await response.json();
        setMessage(data.error || 'حدث خطأ في التحديث');
      }
    } catch (error) {
      setMessage('حدث خطأ في الاتصال');
    }
    setLoading(false);
  };

  const deleteActivationCode = async (codeId) => {
    if (!confirm('هل أنت متأكد من حذف هذا الكود؟')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/activation-codes/${codeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setMessage('تم حذف كود التفعيل بنجاح');
        loadActivationCodes();
        loadStats();
      } else {
        const data = await response.json();
        setMessage(data.error || 'حدث خطأ في الحذف');
      }
    } catch (error) {
      setMessage('حدث خطأ في الاتصال');
    }
    setLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setMessage('تم نسخ الكود إلى الحافظة');
      setTimeout(() => setMessage(''), 3000);
    });
  };

  const getCodeStatus = (code) => {
    if (!code.is_active) return { status: 'inactive', label: 'غير نشط', color: 'bg-gray-100 text-gray-800' };
    
    if (code.expires_at && new Date(code.expires_at) < new Date()) {
      return { status: 'expired', label: 'منتهي الصلاحية', color: 'bg-red-100 text-red-800' };
    }
    
    if (code.current_uses >= code.max_uses) {
      return { status: 'used_up', label: 'مستنفد', color: 'bg-orange-100 text-orange-800' };
    }
    
    return { status: 'active', label: 'نشط', color: 'bg-green-100 text-green-800' };
  };

  return (
    <div className=\"max-w-6xl mx-auto p-6 space-y-6\">
      <div className=\"flex items-center gap-2 mb-6\">
        <Key className=\"h-6 w-6\" />
        <h1 className=\"text-2xl font-bold\">إدارة أكواد التفعيل</h1>
      </div>

      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue=\"codes\" className=\"w-full\">
        <TabsList className=\"grid w-full grid-cols-3\">
          <TabsTrigger value=\"codes\" className=\"flex items-center gap-2\">
            <Key className=\"h-4 w-4\" />
            الأكواد
          </TabsTrigger>
          <TabsTrigger value=\"create\" className=\"flex items-center gap-2\">
            <Plus className=\"h-4 w-4\" />
            إنشاء كود
          </TabsTrigger>
          <TabsTrigger value=\"stats\" className=\"flex items-center gap-2\">
            <BarChart3 className=\"h-4 w-4\" />
            الإحصائيات
          </TabsTrigger>
        </TabsList>

        <TabsContent value=\"codes\" className=\"space-y-6\">
          <Card>
            <CardHeader>
              <CardTitle>أكواد التفعيل ({activationCodes.length})</CardTitle>
              <CardDescription>إدارة جميع أكواد التفعيل المتاحة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className=\"space-y-4\">
                {activationCodes.map((code) => {
                  const status = getCodeStatus(code);
                  return (
                    <div key={code.id} className=\"flex items-center justify-between p-4 border rounded-lg\">
                      <div className=\"flex-1\">
                        <div className=\"flex items-center gap-3 mb-2\">
                          <code className=\"bg-gray-100 px-3 py-1 rounded font-mono text-lg font-bold\">
                            {code.code}
                          </code>
                          <Badge className={status.color}>
                            {status.label}
                          </Badge>
                        </div>
                        <div className=\"text-sm text-gray-600\">
                          <div>{code.description}</div>
                          <div className=\"flex items-center gap-4 mt-1\">
                            <span>الاستخدام: {code.current_uses}/{code.max_uses}</span>
                            {code.expires_at && (
                              <span>ينتهي: {new Date(code.expires_at).toLocaleDateString('ar')}</span>
                            )}
                            <span>تم الإنشاء: {new Date(code.created_at).toLocaleDateString('ar')}</span>
                          </div>
                        </div>
                      </div>
                      <div className=\"flex items-center gap-2\">
                        <Button
                          size=\"sm\"
                          variant=\"outline\"
                          onClick={() => copyToClipboard(code.code)}
                        >
                          <Copy className=\"h-4 w-4\" />
                        </Button>
                        <Button
                          size=\"sm\"
                          variant=\"outline\"
                          onClick={() => setEditingCode(code)}
                        >
                          <Edit className=\"h-4 w-4\" />
                        </Button>
                        <Button
                          size=\"sm\"
                          variant=\"destructive\"
                          onClick={() => deleteActivationCode(code.id)}
                        >
                          <Trash2 className=\"h-4 w-4\" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {activationCodes.length === 0 && (
                  <div className=\"text-center text-gray-500 py-8\">
                    لا توجد أكواد تفعيل حالياً
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value=\"create\" className=\"space-y-6\">
          <Card>
            <CardHeader>
              <CardTitle>إنشاء كود تفعيل جديد</CardTitle>
              <CardDescription>أنشئ كود تفعيل جديد للمستخدمين الجدد</CardDescription>
            </CardHeader>
            <CardContent className=\"space-y-4\">
              <div className=\"space-y-2\">
                <Label>وصف الكود *</Label>
                <Input
                  value={newCode.description}
                  onChange={(e) => setNewCode(prev => ({ ...prev, description: e.target.value }))}
                  placeholder=\"مثال: كود للأعضاء الجدد - يناير 2024\"
                />
              </div>

              <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
                <div className=\"space-y-2\">
                  <Label>عدد مرات الاستخدام المسموح</Label>
                  <Input
                    type=\"number\"
                    value={newCode.max_uses}
                    onChange={(e) => setNewCode(prev => ({ ...prev, max_uses: parseInt(e.target.value) }))}
                    min=\"1\"
                    max=\"1000\"
                  />
                </div>

                <div className=\"space-y-2\">
                  <Label>مدة الصلاحية (أيام)</Label>
                  <Input
                    type=\"number\"
                    value={newCode.expires_in_days}
                    onChange={(e) => setNewCode(prev => ({ ...prev, expires_in_days: parseInt(e.target.value) }))}
                    min=\"1\"
                    max=\"365\"
                  />
                </div>
              </div>

              <Button onClick={createActivationCode} disabled={loading} className=\"w-full\">
                {loading ? 'جاري الإنشاء...' : 'إنشاء كود التفعيل'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value=\"stats\" className=\"space-y-6\">
          <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6\">
            <Card>
              <CardHeader className=\"flex flex-row items-center justify-between space-y-0 pb-2\">
                <CardTitle className=\"text-sm font-medium\">إجمالي الأكواد</CardTitle>
                <Key className=\"h-4 w-4 text-muted-foreground\" />
              </CardHeader>
              <CardContent>
                <div className=\"text-2xl font-bold\">{stats.total_codes || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className=\"flex flex-row items-center justify-between space-y-0 pb-2\">
                <CardTitle className=\"text-sm font-medium\">الأكواد النشطة</CardTitle>
                <CheckCircle className=\"h-4 w-4 text-green-500\" />
              </CardHeader>
              <CardContent>
                <div className=\"text-2xl font-bold text-green-600\">{stats.active_codes || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className=\"flex flex-row items-center justify-between space-y-0 pb-2\">
                <CardTitle className=\"text-sm font-medium\">المستخدمون المفعلون</CardTitle>
                <Users className=\"h-4 w-4 text-blue-500\" />
              </CardHeader>
              <CardContent>
                <div className=\"text-2xl font-bold text-blue-600\">{stats.activated_users || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className=\"flex flex-row items-center justify-between space-y-0 pb-2\">
                <CardTitle className=\"text-sm font-medium\">في انتظار التفعيل</CardTitle>
                <Clock className=\"h-4 w-4 text-orange-500\" />
              </CardHeader>
              <CardContent>
                <div className=\"text-2xl font-bold text-orange-600\">{stats.pending_users || 0}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>إحصائيات التفاعل</CardTitle>
            </CardHeader>
            <CardContent>
              <div className=\"grid grid-cols-1 md:grid-cols-3 gap-6\">
                <div className=\"text-center\">
                  <div className=\"text-3xl font-bold text-purple-600\">{stats.total_comments || 0}</div>
                  <div className=\"text-sm text-gray-600\">إجمالي التعليقات</div>
                </div>
                <div className=\"text-center\">
                  <div className=\"text-3xl font-bold text-red-600\">{stats.total_likes || 0}</div>
                  <div className=\"text-sm text-gray-600\">إجمالي الإعجابات</div>
                </div>
                <div className=\"text-center\">
                  <div className=\"text-3xl font-bold text-teal-600\">{stats.total_activations || 0}</div>
                  <div className=\"text-sm text-gray-600\">إجمالي التفعيلات</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Code Modal */}
      {editingCode && (
        <div className=\"fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50\">
          <Card className=\"w-full max-w-md\">
            <CardHeader>
              <CardTitle>تعديل كود التفعيل</CardTitle>
            </CardHeader>
            <CardContent className=\"space-y-4\">
              <div className=\"space-y-2\">
                <Label>الكود</Label>
                <Input value={editingCode.code} disabled className=\"font-mono\" />
              </div>

              <div className=\"space-y-2\">
                <Label>الوصف</Label>
                <Input
                  value={editingCode.description}
                  onChange={(e) => setEditingCode(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className=\"space-y-2\">
                <Label>عدد مرات الاستخدام المسموح</Label>
                <Input
                  type=\"number\"
                  value={editingCode.max_uses}
                  onChange={(e) => setEditingCode(prev => ({ ...prev, max_uses: parseInt(e.target.value) }))}
                  min=\"1\"
                />
              </div>

              <div className=\"flex items-center space-x-2\">
                <input
                  type=\"checkbox\"
                  id=\"is_active\"
                  checked={editingCode.is_active}
                  onChange={(e) => setEditingCode(prev => ({ ...prev, is_active: e.target.checked }))}
                />
                <Label htmlFor=\"is_active\">الكود نشط</Label>
              </div>

              <div className=\"flex gap-2\">
                <Button
                  onClick={() => updateActivationCode(editingCode.id, {
                    description: editingCode.description,
                    max_uses: editingCode.max_uses,
                    is_active: editingCode.is_active
                  })}
                  disabled={loading}
                  className=\"flex-1\"
                >
                  حفظ التغييرات
                </Button>
                <Button
                  variant=\"outline\"
                  onClick={() => setEditingCode(null)}
                  className=\"flex-1\"
                >
                  إلغاء
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ActivationManagement;

