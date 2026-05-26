"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/auth-context";
import { getProfile, updateProfile } from "@/api/user";
import {
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  Wheat,
  Bell,
  Shield,
  LogOut,
  ChevronRight,
  Camera,
  Save,
} from "lucide-react";
import MainLayout from "@/components/mainLayout";

export default function ProfilePage() {
  const { user, logout, updateUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    location: "",
    farmSize: "",
  });
  const [preferences, setPreferences] = useState({
    notifications: true,
    phoneNumberUpdates: true,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    async function loadProfile() {
      const data = await getProfile();
      setProfile(data);
      setFormData({
        name: data.name,
        phoneNumber: data.phoneNumber,
        location: data.location,
        farmSize: data.farmSize,
      });
      setPreferences(data.preferences);
    }

    if (user) {
      loadProfile();
    }
  }, [user, authLoading, router]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateProfile({ ...formData, preferences });
      if (result.success) {
        setProfile(result.user);
        updateUser(result.user);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (authLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <MainLayout
      title="ໂປຣໄຟລ໌"
      headerActions={
        isEditing ? (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
              ຍົກເລີກ
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
              ບັນທຶກ
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            ແກ້ໄຂ
          </Button>
        )
      }
    >
      <main className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center py-6">
          <div className="relative">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-12 h-12 md:w-16 md:h-16 text-primary" />
            </div>
            {isEditing && (
              <button className="absolute bottom-0 right-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                <Camera className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            )}
          </div>
          <h2 className="mt-4 text-xl md:text-2xl font-bold text-foreground">{profile.name}</h2>
          <p className="text-muted-foreground">{profile.phoneNumber}</p>
        </div>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ຂໍ້ມູນສ່ວນຕົວ</CardTitle>
            <CardDescription>ຈັດການລາຍລະອຽດບັນຊີຂອງທ່ານ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" /> ຊື່ ແລະ ນາມສະກຸນ
              </Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12"
                />
              ) : (
                <p className="text-foreground py-3 px-3 bg-muted rounded-lg">{profile.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" /> ເບີໂທລະສັບ
              </Label>
              {isEditing ? (
                <Input
                  id="phoneNumber"
                  type="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="h-12"
                />
              ) : (
                <p className="text-foreground py-3 px-3 bg-muted rounded-lg">{profile.phoneNumber}</p>
              )}
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" /> ເບີໂທ
              </Label>
              {isEditing ? (
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-12"
                />
              ) : (
                <p className="text-foreground py-3 px-3 bg-muted rounded-lg">{profile.phone}</p>
              )}
            </div> */}

            {/* <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" /> ສະຖານທີ່
              </Label>
              {isEditing ? (
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="h-12"
                />
              ) : (
                <p className="text-foreground py-3 px-3 bg-muted rounded-lg">{profile.location}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="farmSize" className="flex items-center gap-2 text-muted-foreground">
                <Wheat className="w-4 h-4" /> ຂະໜາດສວນ
              </Label>
              {isEditing ? (
                <Input
                  id="farmSize"
                  value={formData.farmSize}
                  onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })}
                  className="h-12"
                />
              ) : (
                <p className="text-foreground py-3 px-3 bg-muted rounded-lg">{profile.farmSize}</p>
              )}
            </div> */}
          </CardContent>
        </Card>

        {/* Preferences */}
        {/* <Card>
          <CardHeader>
            <CardTitle className="text-lg">ການຕັ້ງຄ່າ</CardTitle>
            <CardDescription>ປັບແຕ່ງປະສົບການຂອງທ່ານ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">ການແຈ້ງເຕືອນ</p>
                  <p className="text-sm text-muted-foreground">ຮັບການແຈ້ງເຕືອນລາຄາ ແລະ ການອັບເດດ</p>
                </div>
              </div>
              <Switch
                checked={preferences.notifications}
                onCheckedChange={(checked) => setPreferences({ ...preferences, notifications: checked })}
              />
            </div>

            <div className="h-px bg-border" />

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">ການອັບເດດທາງອີເມວ</p>
                  <p className="text-sm text-muted-foreground">ລາຍງານຕະຫຼາດປະຈຳອາທິດ</p>
                </div>
              </div>
              <Switch
                checked={preferences.phoneNumberUpdates}
                onCheckedChange={(checked) => setPreferences({ ...preferences, phoneNumberUpdates: checked })}
              />
            </div>
          </CardContent>
        </Card> */}

        {/* Security & Actions */}
        <Card>
          {/* <CardHeader>
            <CardTitle className="text-lg">ຄວາມປອດໄພ</CardTitle>
          </CardHeader> */}
          <CardContent className="space-y-1">
            {/* <button className="w-full flex items-center justify-between py-3 px-1 hover:bg-muted/50 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground">ປ່ຽນລະຫັດຜ່ານ</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <div className="h-px bg-border" /> */}

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between py-3 px-1 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5" />
                <span>ອອກຈາກລະບົບ</span>
              </div>
              {/* <ChevronRight className="w-5 h-5" /> */}
            </button>
          </CardContent>
        </Card>

        {/* Account Info */}
        <p className="text-center text-sm text-muted-foreground">
          ເປັນສະມາຊິກຕັ້ງແຕ່ {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
      </main>
    </MainLayout>
  );
}
