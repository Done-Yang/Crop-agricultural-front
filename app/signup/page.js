"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { signup as apiSignup } from "@/api/user";
import { Loader2, Eye, EyeOff, TrendingUp, Check } from "lucide-react";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [ showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const passwordRequirements = [
    { label: "ຢ່າງໜ້ອຍ 8 ຕົວອັກສອນ", met: formData.password.length >= 8 },
    { label: "ມີຕົວເລກ", met: /\d/.test(formData.password) },
    { label: "ມີຕົວອັກສອນ", met: /[a-zA-Z]/.test(formData.password) },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("ລະຫັດຜ່ານບໍ່ກົງກັນ");
      return;
    }

    // if (!passwordRequirements.every((req) => req.met)) {
    //   setError("ກະລຸນາປະຕິບັດຕາມຂໍ້ກຳນົດລະຫັດຜ່ານທັງໝົດ");
    //   return;
    // }

    setIsLoading(true);

    try {
      const result = await apiSignup(formData);
      if (result.success) {
        login(result.user);
        router.push("/dashboard");
      } else {
        setError(result.error || "ການສະໝັກລົ້ມເຫຼວ");
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
            <CardTitle className="text-2xl md:text-3xl font-bold text-foreground">ສ້າງບັນຊີໃໝ່</CardTitle>
            <CardDescription className="text-muted-foreground">
              ເລີ່ມຕົ້ນເພີ່ມປະສິດທິພາບການວາງແຜນກະສິກຳຂອງທ່ານມື້ນີ້
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
                <Label htmlFor="name" className="text-foreground">ຊື່ ແລະ ນາມສະກຸນ</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="ສົມຊາຍ ສຸກສະຫວັນ"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-foreground">ເບີໂທລະສັບ</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="phoneNumber"
                  placeholder="farmer@example.com"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">ລະຫັດຜ່ານ</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="******"
                    value={formData.password}
                    onChange={handleChange}
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
                {/* Password requirements */}
                {/* <div className="space-y-1 mt-2">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          req.met ? "bg-success text-success-foreground" : "bg-muted"
                        }`}
                      >
                        {req.met && <Check className="w-3 h-3" />}
                      </div>
                      <span className={req.met ? "text-success" : "text-muted-foreground"}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div> */}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">ຢືນຢັນລະຫັດຜ່ານ</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="******"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="h-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* <div className="flex items-start gap-2">
                <input type="checkbox" id="terms" required className="mt-1 rounded border-input" />
                <label htmlFor="terms" className="text-sm text-muted-foreground">
                  ຂ້ອຍຍອມຮັບ{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    ເງື່ອນໄຂການໃຫ້ບໍລິການ
                  </Link>{" "}
                  ແລະ{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວ
                  </Link>
                </label>
              </div> */}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ກຳລັງສ້າງບັນຊີ...
                  </>
                ) : (
                  "ສ້າງບັນຊີ"
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                ມີບັນຊີຢູ່ແລ້ວບໍ?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  ເຂົ້າສູ່ລະບົບ
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
