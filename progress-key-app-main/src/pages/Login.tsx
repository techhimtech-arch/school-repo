import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { GraduationCap } from "lucide-react";
import { authAPI } from "@/lib/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      
      // Store user data in session storage for role-based routing
      const userData = {
        email: response.user.email,
        role: response.user.role,
        token: response.token,
        full_name: response.user.name || response.user.email,
        id: response.user.id
      };
      sessionStorage.setItem("user", JSON.stringify(userData));

      toast.success("Login successful!");

      // Route based on role
      switch (response.user.role) {
        case "SUPER_ADMIN":
          navigate("/admin");
          break;
        case "CLASS_TEACHER":
          navigate("/class-teacher");
          break;
        case "SUBJECT_TEACHER":
          navigate("/subject-teacher");
          break;
        case "STUDENT_PARENT":
          navigate("/student");
          break;
        default:
          navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-3 text-center">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">School Progress System</CardTitle>
          <CardDescription className="text-base">
            Enter your credentials to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="mt-8 p-4 bg-muted rounded-lg space-y-2 text-sm">
            <p className="font-semibold text-foreground">Database Login:</p>
            <div className="space-y-1 text-muted-foreground">
              <p>🔹 Admin: admin@school.com / admin123</p>
              <p className="text-xs mt-2 opacity-70">All users are now stored in the database</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;