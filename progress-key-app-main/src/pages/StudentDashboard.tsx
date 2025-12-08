import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { parentAPI, announcementsAPI } from "@/lib/api";
import { toast } from "sonner";
import {
  CheckCircle,
  FileText,
  BookOpen,
  ClipboardList,
  DollarSign,
  LogOut,
  GraduationCap,
  Bell,
} from "lucide-react";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    attendanceRate: 0,
    homeworkCount: 0,
    materialsCount: 0,
    testsCount: 0,
  });
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "STUDENT_PARENT") {
      navigate("/login");
      return;
    }
    setUser(parsedUser);
    loadDashboard(parsedUser.id);
  }, [navigate]);

  const loadDashboard = async (userId: string) => {
    try {
      // Get student profile
      const profile = await parentAPI.getStudentProfile().catch(() => null);
      
      if (!profile) return;

      // Get attendance data
      const attendanceData = await parentAPI.getStudentAttendance().catch(() => []);
      const totalDays = Array.isArray(attendanceData) ? attendanceData.length : 0;
      const presentDays = Array.isArray(attendanceData) 
        ? attendanceData.filter((a: any) => a.is_present).length 
        : 0;
      const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

      // Get homework count
      const homeworkData = await parentAPI.getStudentHomework().catch(() => []);
      const homeworkCount = Array.isArray(homeworkData) ? homeworkData.length : 0;

      // Get materials count (using a placeholder - adjust based on your API)
      const materialsCount = 0; // Update when materials API is available for students

      // Get tests/marks count
      const marksData = await parentAPI.getStudentMarks().catch(() => []);
      const testsCount = Array.isArray(marksData) ? marksData.length : 0;

      // Get announcements
      const announcementsData = await announcementsAPI.getAnnouncements().catch(() => []);
      const recentAnnouncements = Array.isArray(announcementsData) 
        ? announcementsData.slice(0, 3) 
        : [];

      setStats({
        attendanceRate,
        homeworkCount,
        materialsCount,
        testsCount,
      });
      setAnnouncements(recentAnnouncements);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast.error("Failed to load dashboard data");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">School Progress System</h1>
              <p className="text-sm text-muted-foreground">Student Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user.full_name}</p>
              <p className="text-xs text-muted-foreground">Student/Parent</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Attendance Rate
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.attendanceRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">Overall attendance</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Homework
              </CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.homeworkCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Active assignments</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Study Materials
              </CardTitle>
              <BookOpen className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.materialsCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Available resources</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tests & Marks
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.testsCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Assessments</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Recent Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.length > 0 ? (
                  announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="p-4 bg-muted/50 rounded-lg"
                    >
                      <h4 className="font-semibold text-foreground mb-1">
                        {announcement.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {announcement.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No announcements yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-accent" />
                Fee Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-6 bg-accent/10 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Check your fee payment status
                </p>
                <Button className="w-full">View Fee Details</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Academic Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <h4 className="font-semibold">Today's Attendance</h4>
                </div>
                <p className="text-sm text-muted-foreground">Check your attendance status</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">Today's Homework</h4>
                </div>
                <p className="text-sm text-muted-foreground">View assignments due today</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="h-5 w-5 text-accent" />
                  <h4 className="font-semibold">Topics Covered</h4>
                </div>
                <p className="text-sm text-muted-foreground">What was taught today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default StudentDashboard;