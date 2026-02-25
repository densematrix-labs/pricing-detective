# Pricing Detective — SaaS Pricing Analyzer

## 产品定位

**Problem:** SaaS 工具的定价页面充满了隐藏收费、误导性"免费"tier、和复杂的定价结构，用户很难了解真实成本。

**Solution:** 用户粘贴 pricing 页面内容，AI 分析并揭露所有隐藏收费和定价陷阱。

## 核心功能

1. **隐藏收费检测**
   - Setup fees / activation fees
   - Overage charges
   - Required add-ons
   - Hidden API/integration costs

2. **假免费识别**
   - Usage caps (X requests/month)
   - Feature gates
   - Watermarks
   - Time limits (14-day trial disguised as "free")

3. **误导性定价分析**
   - Per user vs per seat 陷阱
   - Annual vs monthly bait (显示年付价格但标注小字 "billed annually")
   - "Starting at" 最低配置陷阱
   - 隐藏的 "Contact Sales" 天花板

4. **真实成本估算**
   - 基于用户输入的使用量，计算真实月/年成本
   - 对比不同 tier 的性价比

## 技术方案

- **前端:** React + Vite (TypeScript)
- **后端:** Python FastAPI
- **AI:** llm-proxy.densematrix.ai (Claude)
- **部署:** Docker → langsheng

## 端口分配

| 组件 | 端口 |
|-----|------|
| Frontend | 30150 |
| Backend | 30151 |

## 美学方向：Detective Noir

- **主题:** 深色背景 + 金色/琥珀色点缀
- **字体:** 报告/打字机风格 + 现代无衬线
- **感觉:** 像一份调查报告，揭露真相
- **动效:** 打字机效果、高亮标记动画

## SEO 截流关键词

### Primary
- `SaaS pricing analyzer`
- `hidden fees detector`
- `pricing transparency tool`

### Secondary
- `SaaS true cost calculator`
- `freemium trap detector`
- `subscription fee analyzer`

### Long-tail
- `how to find hidden fees in SaaS pricing`
- `SaaS pricing tricks to avoid`
- `real cost of [tool name] subscription`

## 完成标准

- [ ] 粘贴内容 → AI 分析 → 显示报告
- [ ] 7 语言 i18n
- [ ] 支付集成 (Creem)
- [ ] 部署到 pricing-detective.demo.densematrix.ai
- [ ] SEO 优化完成
