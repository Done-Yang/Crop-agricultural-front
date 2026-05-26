"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { login as apiLogin } from "@/api/user";
import { Loader2, Eye, EyeOff, TrendingUp } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await apiLogin(email, password);
      if (result.success) {
        login(result.user);
        router.push("/dashboard");
      } else {
        setError(result.error);
      }
    } catch {
      setError("ເກີດຂໍ້ຜິດພາດທີ່ບໍ່ຄາດຄິດ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="p-4 md:p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">AgriPrice</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-6">
        <Card className="w-full max-w-md shadow-lg border-border">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl md:text-3xl font-bold text-foreground">ຍິນດີຕ້ອນຮັບກັບມາ</CardTitle>
            <CardDescription className="text-muted-foreground">
              ເຂົ້າສູ່ລະບົບເພື່ອເຂົ້າເຖິງຂໍ້ມູນເຈາະເລິກກະສິກຳ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">ອີເມວ</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="farmer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">ລະຫັດຜ່ານ</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="ໃສ່ລະຫັດຜ່ານຂອງທ່ານ"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-input" />
                  <span className="text-muted-foreground">ຈົດຈຳຂ້ອຍ</span>
                </label>
                <Link href="/forgot-password" className="text-primary hover:underline">
                  ລືມລະຫັດຜ່ານ?
                </Link>
              </div> */}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ກຳລັງເຂົ້າສູ່ລະບົບ...
                  </>
                ) : (
                  "ເຂົ້າສູ່ລະບົບ"
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                {"ຍັງບໍ່ມີບັນຊີບໍ? "}
                <Link href="/signup" className="text-primary hover:underline font-medium">
                  ສະໝັກສະມາຊິກ
                </Link>
              </div>

              {/* Demo credentials hint */}
              <div className="mt-6 p-3 rounded-lg bg-suggestion text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">ຂໍ້ມູນເຂົ້າສູ່ລະບົບທົດລອງ:</p>
                <p>ອີເມວ: demo@example.com</p>
                <p>ລະຫັດຜ່ານ: password</p>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
