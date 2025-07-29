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
  Share2, 
  Download, 
  Mail, 
  Link, 
  FileText, 
  Users, 
  Copy, 
  Eye,
  Trash2,
  Lock,
  Calendar,
  ExternalLink
} from 'lucide-react';

const DataSharing = ({ token, reports = [], participants = [] }) => {
  const [shareLinks, setShareLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [shareConfig, setShareConfig] = useState({
    expires_in_hours: 24,
    password: '',
    max_access: 100
  });

  useEffect(() => {
    loadShareLinks();
  }, []);

  const loadShareLinks = async () => {
    try {
      const response = await fetch('/api/share-links', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setShareLinks(data);
      }
    } catch (error) {
      console.error('Error loading share links:', error);
    }
  };

  const createShareLink = async (reportId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports/${reportId}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(shareConfig)
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`تم إنشاء رابط المشاركة بنجاح: ${window.location.origin}${data.share_url}`);
        loadShareLinks();
        setSelectedReport(null);
      } else {
        setMessage('حدث خطأ في إنشاء رابط المشاركة');
      }
    } catch (error) {
      setMessage('حدث خطأ في الاتصال');
    }
    setLoading(false);
  };

  const deleteShareLink = async (token) => {
    try {
      const response = await fetch(`/api/share-links/${token}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setMessage('تم حذف رابط المشاركة بنجاح');
        loadShareLinks();
      }
    } catch (error) {
      setMessage('حدث خطأ في حذف الرابط');
    }
  };

  const exportData = async (type, format, options = {}) => {
    setLoading(true);
    try {
      const endpoint = type === 'reports' ? '/api/reports/export' : '/api/participants/export';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ format, ...options })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${type}_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        setMessage(`تم تصدير ${type === 'reports' ? 'التقارير' : 'بيانات المشاركين'} بنجاح`);
      } else {
        setMessage('حدث خطأ في التصدير');
      }
    } catch (error) {
      setMessage('حدث خطأ في الاتصال');
    }
    setLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setMessage('تم نسخ الرابط إلى الحافظة');
      setTimeout(() => setMessage(''), 3000);
    });
  };

  const openPrintView = (reportId) => {
    const printUrl = `/api/reports/${reportId}/print`;
    window.open(printUrl, '_blank');
  };

  return (
    <div className=\"max-w-6xl mx-auto p-6 space-y-6\">
      <div className=\"flex items-center gap-2 mb-6\">
        <Share2 className=\"h-6 w-6\" />
        <h1 className=\"text-2xl font-bold\">مشاركة البيانات والتصدير</h1>
      </div>

      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue=\"share\" className=\"w-full\">
        <TabsList className=\"grid w-full grid-cols-3\">
          <TabsTrigger value=\"share\" className=\"flex items-center gap-2\">
            <Link className=\"h-4 w-4\" />
            روابط المشاركة
          </TabsTrigger>
          <TabsTrigger value=\"export\" className=\"flex items-center gap-2\">
            <Download className=\"h-4 w-4\" />
            تصدير البيانات
          </TabsTrigger>
          <TabsTrigger value=\"print\" className=\"flex items-center gap-2\">
            <FileText className=\"h-4 w-4\" />
            طباعة التقارير
          </TabsTrigger>
        </TabsList>

        <TabsContent value=\"share\" className=\"space-y-6\">
          <Card>
            <CardHeader>
              <CardTitle>إنشاء رابط مشاركة جديد</CardTitle>
              <CardDescription>أنشئ رابط آمن لمشاركة التقارير مع الآخرين</CardDescription>
            </CardHeader>
            <CardContent className=\"space-y-4\">
              <div className=\"space-y-2\">
                <Label>اختر التقرير</Label>
                <select 
                  className=\"w-full p-2 border rounded\"
                  value={selectedReport || ''}
                  onChange={(e) => setSelectedReport(e.target.value)}
                >
                  <option value=\"\">اختر تقرير...</option>
                  {reports.map((report) => (
                    <option key={report.id} value={report.id}>
                      {report.title} ({report.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className=\"grid grid-cols-1 md:grid-cols-3 gap-4\">
                <div className=\"space-y-2\">
                  <Label>مدة انتهاء الصلاحية (ساعات)</Label>
                  <Input
                    type=\"number\"
                    value={shareConfig.expires_in_hours}
                    onChange={(e) => setShareConfig(prev => ({ ...prev, expires_in_hours: parseInt(e.target.value) }))}
                    min=\"1\"
                    max=\"168\"
                  />
                </div>

                <div className=\"space-y-2\">
                  <Label>كلمة مرور (اختياري)</Label>
                  <Input
                    type=\"password\"
                    value={shareConfig.password}
                    onChange={(e) => setShareConfig(prev => ({ ...prev, password: e.target.value }))}
                    placeholder=\"كلمة مرور للحماية\"
                  />
                </div>

                <div className=\"space-y-2\">
                  <Label>عدد مرات الوصول المسموح</Label>
                  <Input
                    type=\"number\"
                    value={shareConfig.max_access}
                    onChange={(e) => setShareConfig(prev => ({ ...prev, max_access: parseInt(e.target.value) }))}
                    min=\"1\"
                    max=\"1000\"
                  />
                </div>
              </div>

              <Button 
                onClick={() => selectedReport && createShareLink(selectedReport)} 
                disabled={loading || !selectedReport}
                className=\"w-full\"
              >
                {loading ? 'جاري الإنشاء...' : 'إنشاء رابط المشاركة'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>روابط المشاركة الحالية ({shareLinks.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className=\"space-y-3\">
                {shareLinks.map((link) => (
                  <div key={link.token} className=\"flex items-center justify-between p-3 border rounded\">
                    <div className=\"flex-1\">
                      <div className=\"flex items-center gap-2 mb-1\">
                        <Badge variant=\"outline\">{link.type}</Badge>
                        {link.password_protected && <Lock className=\"h-4 w-4 text-yellow-500\" />}
                      </div>
                      <div className=\"text-sm text-gray-600\">
                        <div>الوصول: {link.access_count}/{link.max_access}</div>
                        <div>ينتهي: {new Date(link.expires_at).toLocaleString('ar')}</div>
                      </div>
                    </div>
                    <div className=\"flex items-center gap-2\">
                      <Button
                        size=\"sm\"
                        variant=\"outline\"
                        onClick={() => copyToClipboard(`${window.location.origin}/shared/${link.token}`)}
                      >
                        <Copy className=\"h-4 w-4\" />
                      </Button>
                      <Button
                        size=\"sm\"
                        variant=\"outline\"
                        onClick={() => window.open(`/shared/${link.token}`, '_blank')}
                      >
                        <ExternalLink className=\"h-4 w-4\" />
                      </Button>
                      <Button
                        size=\"sm\"
                        variant=\"destructive\"
                        onClick={() => deleteShareLink(link.token)}
                      >
                        <Trash2 className=\"h-4 w-4\" />
                      </Button>
                    </div>
                  </div>
                ))}
                {shareLinks.length === 0 && (
                  <div className=\"text-center text-gray-500 py-8\">
                    لا توجد روابط مشاركة حالياً
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value=\"export\" className=\"space-y-6\">
          <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">
            <Card>
              <CardHeader>
                <CardTitle className=\"flex items-center gap-2\">
                  <FileText className=\"h-5 w-5\" />
                  تصدير التقارير
                </CardTitle>
                <CardDescription>تصدير جميع التقارير بصيغ مختلفة</CardDescription>
              </CardHeader>
              <CardContent className=\"space-y-4\">
                <div className=\"grid grid-cols-3 gap-2\">
                  <Button
                    variant=\"outline\"
                    onClick={() => exportData('reports', 'json')}
                    disabled={loading}
                    className=\"flex flex-col items-center p-4 h-auto\"
                  >
                    <FileText className=\"h-6 w-6 mb-2\" />
                    JSON
                  </Button>
                  <Button
                    variant=\"outline\"
                    onClick={() => exportData('reports', 'csv')}
                    disabled={loading}
                    className=\"flex flex-col items-center p-4 h-auto\"
                  >
                    <FileText className=\"h-6 w-6 mb-2\" />
                    CSV
                  </Button>
                  <Button
                    variant=\"outline\"
                    onClick={() => exportData('reports', 'txt')}
                    disabled={loading}
                    className=\"flex flex-col items-center p-4 h-auto\"
                  >
                    <FileText className=\"h-6 w-6 mb-2\" />
                    TXT
                  </Button>
                </div>
                <div className=\"text-sm text-gray-600\">
                  إجمالي التقارير: {reports.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className=\"flex items-center gap-2\">
                  <Users className=\"h-5 w-5\" />
                  تصدير بيانات المشاركين
                </CardTitle>
                <CardDescription>تصدير قائمة المشاركين وبياناتهم</CardDescription>
              </CardHeader>
              <CardContent className=\"space-y-4\">
                <div className=\"grid grid-cols-2 gap-2\">
                  <Button
                    variant=\"outline\"
                    onClick={() => exportData('participants', 'csv')}
                    disabled={loading}
                    className=\"flex flex-col items-center p-4 h-auto\"
                  >
                    <FileText className=\"h-6 w-6 mb-2\" />
                    CSV
                  </Button>
                  <Button
                    variant=\"outline\"
                    onClick={() => exportData('participants', 'json')}
                    disabled={loading}
                    className=\"flex flex-col items-center p-4 h-auto\"
                  >
                    <FileText className=\"h-6 w-6 mb-2\" />
                    JSON
                  </Button>
                </div>
                <div className=\"space-y-2\">
                  <label className=\"flex items-center gap-2\">
                    <input type=\"checkbox\" />
                    <span className=\"text-sm\">تضمين المعلومات الطبية</span>
                  </label>
                </div>
                <div className=\"text-sm text-gray-600\">
                  إجمالي المشاركين: {participants.length}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value=\"print\" className=\"space-y-6\">
          <Card>
            <CardHeader>
              <CardTitle>طباعة التقارير</CardTitle>
              <CardDescription>اختر التقارير التي تريد طباعتها</CardDescription>
            </CardHeader>
            <CardContent>
              <div className=\"space-y-3\">
                {reports.map((report) => (
                  <div key={report.id} className=\"flex items-center justify-between p-3 border rounded\">
                    <div>
                      <div className=\"font-medium\">{report.title}</div>
                      <div className=\"text-sm text-gray-600\">
                        {report.type} • {new Date(report.created_at).toLocaleDateString('ar')}
                      </div>
                    </div>
                    <Button
                      variant=\"outline\"
                      onClick={() => openPrintView(report.id)}
                      className=\"flex items-center gap-2\"
                    >
                      <Eye className=\"h-4 w-4\" />
                      معاينة وطباعة
                    </Button>
                  </div>
                ))}
                {reports.length === 0 && (
                  <div className=\"text-center text-gray-500 py-8\">
                    لا توجد تقارير للطباعة
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataSharing;

