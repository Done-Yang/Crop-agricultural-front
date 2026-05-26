"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  DollarSign,
  BarChart3,
  Sprout,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "ການພະຍາກອນຄວາມຕ້ອງການ",
    description: "ເບິ່ງແນວໂນ້ມຄວາມຕ້ອງການໃນອະນາຄົດ ແລະ ຕັດສິນໃຈປູກພືດໂດຍອີງໃສ່ຂໍ້ມູນ.",
  },
  {
    icon: Sprout,
    title: "ການແນະນຳພືດປູກ",
    description: "ຮັບຄຳແນະນຳສ່ວນຕົວວ່າຄວນປູກພືດໃດໃນແຕ່ລະລະດູ.",
  },
  {
    icon: DollarSign,
    title: "ລາຄາຍຸຕິທຳ",
    description: "ເຂົ້າເຖິງລາຄາທີ່ສົມດຸນອີງໃສ່ຂໍ້ມູນອຸປະທານ ແລະ ຄວາມຕ້ອງການຕົວຈິງ.",
  },
  {
    icon: TrendingUp,
    title: "ຂໍ້ມູນເຈາະເລິກຕະຫຼາດ",
    description: "ກ້າວນຳໜ້າດ້ວຍການວິເຄາະ ແລະ ແນວໂນ້ມຕະຫຼາດແບບສົດໆ.",
  },
];

const benefits = [
  "ການວາງແຜນປູກພືດທີ່ອີງໃສ່ຂໍ້ມູນ",
  "ການວິເຄາະອຸປະທານ ແລະ ຄວາມຕ້ອງການ",
  "ຄຳແນະນຳຕາມລະດູ",
  "ຂໍ້ມູນການເພີ່ມປະສິດທິພາບລາຄາ",
  "ໃຊ້ງານສະດວກຜ່ານທູກເພດຟອມ",
  "ການອັບເດດຕະຫຼາດແບບສົດໆ",
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className=" mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">AgriPrice</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="hidden sm:inline-flex">
                ເຂົ້າສູ່ລະບົບ
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-primary hover:bg-primary/90">
                ເລີ່ມຕົ້ນໃຊ້ງານ
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-suggestion text-sm text-foreground mb-6">
            <Sprout className="w-4 h-4 text-primary" />
            ການວາງແຜນກະສິກຳແບບສະຫຼາດ
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight text-balance">
            ວາງແຜນສະຫຼາດກວ່າ.
            <br />
            <span className="text-primary">ລາຄາຍຸຕິທຳກວ່າ.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            ຕັດສິນໃຈໂດຍອີງໃສ່ຂໍ້ມູນດ້ວຍການພະຍາກອນຄວາມຕ້ອງການ ແລະ ການກຳນົດລາຄາທີ່ສົມດຸນກັບການອຸປະທານ.
            ເພີ່ມປະສິດທິພາບການວາງແຜນກະສິກຳຂອງທ່ານດ້ວຍຂໍ້ມູນເຊິງເລິກ.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-lg px-8">
                ເລີ່ມຕົ້ນດຽວນີ້
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            {/* <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8">
                ເຂົ້າສູ່ລະບົບ
              </Button>
            </Link> */}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              ທຸກສິ່ງທີ່ທ່ານຕ້ອງການເພື່ອເພີ່ມປະສິດທິພາບສວນຂອງທ່ານ
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              ເຄື່ອງມືທີ່ມີປະສິດທິພາບ ອອກແບບສະເພາະສຳລັບການວາງແຜນກະສິກຳ ແລະ ການວິເຄາະຕະຫຼາດ.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                ສ້າງຂຶ້ນສຳລັບຊາວກະສິກອນຍຸກໃໝ່
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                ບໍ່ວ່າທ່ານຈະບໍລິຫານສວນຂະໜາດນ້ອຍ ຫຼື ກິດຈະການກະສິກຳຂະໜາດໃຫຍ່,
                AgriPrice ໃຫ້ຂໍ້ມູນເຈາະເລິກທີ່ທ່ານຕ້ອງການເພື່ອເພີ່ມຜົນຕອບແທນສູງສຸດ.
              </p>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-10">
                <Link href="/signup">
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    ເລີ່ມຕົ້ນດຽວນີ້
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-8">
                <div className="h-full rounded-xl bg-background shadow-xl border border-border p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">ການພະຍາກອນຄວາມຕ້ອງການ</p>
                      <p className="text-sm text-muted-foreground">ກໍລະກົດ 2026</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-foreground">ໝາກເລັ່ນ</span>
                      <span className="text-trend-up font-medium">+15%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-foreground">ສາລີ</span>
                      <span className="text-primary font-medium">+8%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-foreground">ເຂົ້າສາລີ</span>
                      <span className="text-trend-down font-medium">-4%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">
            ພ້ອມທີ່ຈະເພີ່ມປະສິດທິພາບສວນຂອງທ່ານແລ້ວບໍ?
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80">
            ເຂົ້າຮ່ວມກັບຊາວກະສິກອນຫຼາຍພັນຄົນທີ່ໃຊ້ AgriPrice ເພື່ອຕັດສິນໃຈຢ່າງສະຫຼາດກວ່າເກົ່າ.
          </p>
          <div className="mt-10">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                ເລີ່ມຟຣີມື້ນີ້
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-muted/30 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            @2026 AgriPrice.
          </div>
        </div>
      </footer>
    </div>
  );
}
