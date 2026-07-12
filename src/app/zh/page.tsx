import type { Metadata } from "next";
import HomePage from "@/components/HomePage";

export const metadata: Metadata = {
  title: "TopMax Export | 巴西优质产品出口",
  description:
    "TopMax Export 连接巴西优质产品与全球市场，为国际买家提供专业产品展示、商务支持和出口合作。",
  alternates: {
    canonical: "/zh",
    languages: {
      "pt-BR": "/",
      "zh-CN": "/zh",
    },
  },
};

export default function ChineseHomePage() {
  return <HomePage locale="zh" />;
}
