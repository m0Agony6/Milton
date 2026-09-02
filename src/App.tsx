import { useEffect, useState, type FormEvent } from 'react';
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Database,
  Eye,
  Globe,
  Layers,
  Leaf,
  Microscope,
  Send,
  ShieldCheck,
  Wind,
  X,
  Zap,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { OriginPredictorModal } from './OriginPredictor';

type ModuleKey = 'nose' | 'spectral' | 'ifformer';

type ModuleDetail = {
  key: ModuleKey;
  name: string;
  label: string;
  summary: string;
  description: string;
  metrics: Array<{ label: string; value: string }>;
  bullets: string[];
};

const NAV_ITEMS = [
  { label: '攻关背景', href: '#background' },
  { label: '双擎方案', href: '#tech' },
  { label: '落地场景', href: '#applications' },
];

const HERO_METRICS = [
  { label: '电子鼻传感器', value: '10 路' },
  { label: '高光谱波谱带', value: '520 个' },
];

const CHALLENGE_CARDS = [
  {
    title: '揭榜挂帅课题攻关',
    text: '本项目针对江苏恒顺醋业股份有限公司发榜的“中华传统调味品风味数字化检测与智能加工技术攻关”课题，解决风味指纹图谱不全、数字化复核难的产业痛点。',
    points: ['对接恒顺醋业等国家级龙头企业数字化研发要求。', '契合传统发酵香醋产业智能化、数字化升级。'],
  },
  {
    title: '传统检测法局限性',
    text: '传统理化分析成本高、耗时长且具有样品破坏性，人工感官评品主观性极强且受经验制约，难以形成低成本、分布式现场快速核验。',
    points: ['理化前处理耗时数小时，难以服务即时在线抽检. ', '感官判定难以标准化，跨批次结果数据无法高效流转。'],
  },
  {
    title: '陈酿香醋亟需无损快检',
    text: '针对年份老陈醋、恒顺年份香醋，亟需在产线工段、成品库房、流通终端建立非破坏、秒级的风味鉴别、品质分级与防伪手段。',
    points: ['企业生产端需要快速、低成本建立发酵批次均一性评估。', '监管流通端急需对勾兑假冒、年份造假等违法行为高效查验。'],
  },
];

const WORKFLOW_STEPS = [
  {
    step: '01',
    title: '样品气封室平衡',
    text: '香醋等样本称量并置于恒温密闭玻璃气室内静置平衡，整个前处理过程不需要化学萃取，保证纯粹天然状态。',
    detail: '该阶段保证顶空挥发性风味有机物（VOCs）充分挥发并达到饱满一致的平衡浓度，排除外部环境带来的电导飘移。',
    output: '输出：恒温顶空气封室标准待测样',
  },
  {
    step: '02',
    title: '电子鼻嗅觉特征提取',
    text: 'PEN3 电子鼻采样泵吸入顶空风味气体，10路金属氧化物传感器由于化学吸附产生瞬态响应，记录完整的反应动力学时间曲线。',
    detail: '气体分子与传感器涂层发生氧化还原反应并改变电阻，能够全面捕获酸、酯、醛、醇、酮等极其微弱的挥发性气味风味特征。',
    output: '输出：10通道时间动力学气敏电导序列',
  },
  {
    step: '03',
    title: '高光谱波谱特征扫描',
    text: '系统同步采集覆盖 380-1038 nm 偏振光下的光谱散射立方体，读取样品表层及其内部多维有机分子基团吸收系数。',
    detail: '在不破坏样品的前提下，光线在复杂的氨基酸、多酚、多糖等大分子基团键能（C-H, O-H, N-H等）发生振动与散射，保留其光学特异性吸收指纹。',
    output: '输出：全谱段微观漫反射反射率特征向量',
  },
  {
    step: '04',
    title: 'IFFormer 多模态融合',
    text: 'IFFormer 融合神经网络对时间序列气敏响应与全波段漫反射向量进行公共特征注意力（CFAW）加权深度交叉融合，给出判定结果。',
    detail: '神经网络以轻量化模型计算资源，解决了异构气体与光谱信息在权值失衡及小样本分布下的鲁棒预测问题，实现高稳定高精度的分类。',
    output: '输出：精确陈酿年份、置信度、图谱指纹',
  },
];

const MODULE_DETAILS: Record<ModuleKey, ModuleDetail> = {
  nose: {
    key: 'nose',
    name: 'PEN3 气敏传感器系统',
    label: '嗅觉指纹感知',
    summary: '10 路金属氧化物半导体敏感阵列，高灵敏捕捉样品多维气味响应。',
    description:
      '电子鼻模块负责对挥发性极强的芳香类、酯类、无机酸与醇类物质进行秒级敏感响应，为多模态模型提供最能代表陈酿香醋“气味本味”的第一组动态高维输入。',
    metrics: [
      { label: '气敏通道阵列', value: '10 路' },
      { label: '样品前处理', value: '原位顶空静置' },
      { label: '主响应物质', value: '酸、酯、醇、醛类' },
      { label: '采样反应时长', value: '秒级/多点动态' },
    ],
    bullets: [
      '对醋样年份差异、掺杂和香气饱满度高度敏感。',
      '前处理简易无损，无需任何有机溶剂化学萃取。',
      '提供气体传导极性漂移动力学轨迹，富含时间相关特征。',
    ],
  },
  spectral: {
    key: 'spectral',
    name: '可见-近红外高光谱系统',
    label: '视觉光谱感知',
    summary: '覆盖 380-1038 nm，无损获取样本大分子化学键漫反射吸收带。',
    description:
      '高光谱成像系统通过图谱合一方式，精准解析样品内溶解的多酚、氨基酸态氮、水分、还原糖等活性风味分子的光学指纹。它与气味的宏观挥发对应，能更底层地体现陈酿香醋分子团构成。',
    metrics: [
      { label: '光谱波段范围', value: '380-1038 nm' },
      { label: '有效光谱维度', value: '520 个' },
      { label: '扫描工作形式', value: '图谱集成扫描' },
      { label: '检测微观基础', value: '分子化学键倍频振动' },
    ],
    bullets: [
      '无需接触液面即可反映老陈醋的基质粘度、吸光率与营养指标。',
      '克服了单一相机仅能获取颜色宏观视觉、无法分辨分子构造的盲区。',
      '与气味响应联动，形成“气谱双引擎”，提供最坚实的光学指纹基础。',
    ],
  },
  ifformer: {
    key: 'ifformer',
    name: 'IFFormer 融合神经网络',
    label: '多模态智能融合',
    summary: '独创公共特征注意力机制（CFAW），攻克异构大落差模态信息失衡难题。',
    description:
      'IFFormer 轻量化前沿深度学习网络不局限于简单的特征串联，而是自适应学习电子鼻响应序列与高光谱反射率向量之间的共有风味关键关联，在极低算力消耗下输出高置信度年份判定。',
    metrics: [
      { label: '总计算复杂度', value: '5.789 M FLOPs' },
      { label: '核心注意力机制', value: 'CFAW (跨模态特征注意)' },
      { label: '边缘部署方案', value: '适配边缘嵌入式硬件' },
    ],
    bullets: [
      '在仅有小样本的香醋数据分布下，依然能实现不逊于大模型的泛化精度。',
      '自适应抑制传感器随机电飘移与光学扫描杂光等非对称噪声。',
      '计算需求极低，适配工业端一体便携快检仪，具备优良部署前景。',
    ],
  },
};

const APPLICATIONS = [
  {
    title: '恒顺香醋陈酿年份鉴定',
    image: '/src/assets/images/hengshun_vinegar_1783928912534.jpg',
    badge: '陈酿年份鉴定',
    text: '针对揭榜方恒顺香醋的3年、5年、8年、10年陈酿年份建立精准数字化比对模型，自适应捕获醇酸酯特征，精准区分不同年份香醋。',
    points: ['特征重构及年份识别率极高', '自适应捕获醇酸酯指纹图谱'],
  },
  {
    title: '恒顺香醋真伪与仿冒勾兑拦截',
    image: '/src/assets/images/hengshun_vinegar_1783928912534.jpg',
    badge: '防伪与真伪检测',
    text: '在成品库、批发端和流通市场拦截以低充高、人工香精勾兑、仿冒知名品牌的非发酵勾兑产品，保护老字号产权。',
    points: ['防伪与仿冒拦截极其精准', '非接触无损检测、秒级核验'],
  },
];

const LANDING_POINTS = [
  {
    title: '产线在线监测',
    text: '在香醋发酵和熟化关键工序设立原位快检测点，随时捕获风味特征演变，为“智造”决策提供多维数字指标。',
  },
  {
    title: '成品入库复核',
    text: '在散装液态入库或灌装贴标前，进行高频无损瞬时辨识，秒级校验年份、真伪，严密防范批次掺假。',
  },
  {
    title: '品牌产权卫士',
    text: '作为地理标志、非遗国货品牌（如江苏恒顺醋业）的一线防伪技术，用难以仿造的气谱多模态特征抵御市面假冒香醋。',
  },
  {
    title: '微型快检仪开发',
    text: '模型极轻量，可固化于便携设备硬件芯片中，适配质检、流通商超及香醋销售端的一线现场快速品质检测。',
  },
];


const sectionMotion = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.65, ease: 'easeOut' as const },
};

const renderModuleIcon = (key: ModuleKey, size = 22) => {
  if (key === 'nose') return <Wind size={size} />;
  if (key === 'spectral') return <Eye size={size} />;
  return <Cpu size={size} />;
};

const renderTitleWithCommaBreak = (title: string) => {
  const separator = title.includes('，') ? '，' : title.includes(',') ? ',' : null;

  if (!separator) return title;

  const [first, ...rest] = title.split(separator);
  const second = rest.join(separator).trim();

  if (!second) return title;

  return (
    <>
      <span>{`${first}${separator}`}</span>
      <span className="block">{second}</span>
    </>
  );
};

const SectionHeading = ({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) => (
  <motion.div {...sectionMotion} className="max-w-3xl">
    <p className="mb-4 text-xs font-bold uppercase tracking-[0.38em] text-[var(--forest)]">{eyebrow}</p>
    <h2 className="font-display text-4xl leading-tight text-[var(--ink)] md:text-5xl">{renderTitleWithCommaBreak(title)}</h2>
    <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)] md:text-lg">{description}</p>
  </motion.div>
);

const ModuleModal = ({
  module,
  onClose,
}: {
  module: ModuleDetail | null;
  onClose: () => void;
}) => (
  <AnimatePresence>
    {module ? (
      <motion.div
        className="fixed inset-0 z-[120] flex items-center justify-center px-4 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <button
          type="button"
          aria-label="关闭详情"
          className="absolute inset-0 bg-[rgba(12,24,19,0.72)] backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ duration: 0.24, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-4xl overflow-hidden rounded-[32px] border border-white/55 bg-[var(--paper)] shadow-[0_40px_120px_rgba(17,42,31,0.28)]"
        >
          <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="relative overflow-hidden bg-[linear-gradient(155deg,#173b2c_0%,#24513d_58%,#567a55_100%)] p-8 text-white md:p-10">
              <div className="absolute -right-14 top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute bottom-0 left-0 h-44 w-44 rounded-full bg-[rgba(247,229,197,0.16)] blur-3xl" />
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                  {renderModuleIcon(module.key, 28)}
                </div>
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.32em] text-white/70">模型简介</p>
                <h3 className="mt-3 font-display text-3xl leading-tight">{module.name}</h3>
                <p className="mt-4 text-lg leading-8 text-white/92">{module.summary}</p>
                <p className="mt-4 text-sm leading-7 text-white/75">{module.description}</p>
              </div>

              <div className="relative mt-8 rounded-[26px] border border-white/12 bg-white/8 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/68">核心优势</p>
                <div className="mt-4 space-y-4">
                  {module.bullets.map((bullet) => (
                    <div key={bullet} className="flex items-start gap-3 text-sm leading-7 text-white/82">
                      <CheckCircle2 size={18} className="mt-1 shrink-0 text-[#f1d6a9]" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative mt-6 grid gap-4 sm:grid-cols-2">
                {module.metrics.slice(0, 2).map((item) => (
                  <div key={item.label} className="rounded-[22px] border border-white/12 bg-white/8 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/50">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-8 md:p-10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.32em] text-[var(--forest)]">系统定位</p>
                  <h4 className="mt-3 text-2xl font-semibold text-[var(--ink)]">{module.summary}</h4>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--forest)] transition-transform hover:scale-105"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="mt-8 rounded-[28px] border border-[var(--line)] bg-white p-6">
                <div className="flex items-center gap-3 text-sm font-semibold text-[var(--ink)]">
                  <Layers size={18} className="text-[var(--forest)]" />
                  与整套系统的配合方式
                </div>
                <div className="mt-5 space-y-4">
                  {module.metrics.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-4 rounded-[20px] bg-[var(--paper)] px-4 py-3"
                    >
                      <span className="text-sm font-semibold text-[var(--muted)]">{item.label}</span>
                      <span className="text-sm font-semibold text-[var(--ink)]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {[
                  { title: '样本侧', text: '保留样本完整性，适配现场采集。', icon: <Microscope size={18} /> },
                  { title: '算法侧', text: '突出跨模态共同重要信息。', icon: <Activity size={18} /> },
                  { title: '部署侧', text: '算法极致轻量，降低硬件门槛。', icon: <Zap size={18} /> },
                ].map((item) => (
                  <div key={item.title} className="rounded-[22px] border border-[var(--line)] bg-[var(--paper-strong)] p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[var(--forest)] shadow-sm">
                      {item.icon}
                    </div>
                    <p className="mt-4 text-sm font-semibold text-[var(--ink)]">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    ) : null}
  </AnimatePresence>
);

const App = () => {
  const [activeModule, setActiveModule] = useState<ModuleKey | null>(null);
  const [predictorOpen, setPredictorOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    product: '陈酿香醋',
    message: '',
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!activeModule && !predictorOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [activeModule, predictorOpen]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[var(--page-bg)] text-[var(--ink)]">
      <ModuleModal module={activeModule ? MODULE_DETAILS[activeModule] : null} onClose={() => setActiveModule(null)} />
      <OriginPredictorModal open={predictorOpen} onClose={() => setPredictorOpen(false)} />

      <nav
        className={`fixed inset-x-0 top-0 z-[90] transition-all duration-300 ${
          scrolled
            ? 'border-b border-[rgba(29,78,57,0.08)] bg-[rgba(246,241,232,0.82)] shadow-[0_10px_30px_rgba(34,53,44,0.08)] backdrop-blur-xl'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <a href="#top" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--forest)] text-white shadow-[0_16px_40px_rgba(31,93,70,0.22)]">
              <Leaf size={24} />
            </div>
            <div>
              <p className="font-display text-2xl leading-none text-[var(--ink)]">气谱双擎</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
                Flavor Digital System
              </p>
            </div>
          </a>
          <div className="hidden items-center gap-8 lg:flex">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-semibold text-[var(--muted)] transition-colors hover:text-[var(--forest)]"
              >
                {item.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => setPredictorOpen(true)}
              className="rounded-full border border-[var(--line)] bg-white px-6 py-3 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[var(--forest)] hover:text-[var(--forest)]"
            >
              风味检测仪
            </button>
            <a
              href="#contact"
              className="rounded-full bg-[var(--forest)] px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
            >
              在线联络
            </a>
          </div>
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setPredictorOpen(true)}
              className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)]"
            >
              检测
            </button>
            <a
              href="#contact"
              className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--forest)]"
            >
              联络
            </a>
          </div>
        </div>
      </nav>

      <main id="top">
        <section className="relative overflow-hidden px-4 pb-16 pt-28 md:px-6 md:pb-20 md:pt-32">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(106,154,99,0.22),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(195,138,62,0.14),transparent_26%),linear-gradient(180deg,#f6f1e8_0%,#f8f4ec_48%,#f5efe4_100%)]" />
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -36 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(31,93,70,0.14)] bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-[var(--forest)]">
                <ShieldCheck size={16} />
                “揭榜挂帅”攻关项目 · 东北电力大学
              </div>
              <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[1.02] text-[var(--ink)] sm:text-6xl lg:text-7xl">
                气谱双擎，智辨本味
                <br />
                <span className="text-3xl sm:text-4xl lg:text-5xl block mt-2 text-[var(--forest)]">传统调味品风味数字化检测系统</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)] md:text-xl">
                本项目面向发榜单位<strong>江苏恒顺醋业股份有限公司</strong>，攻关传统年份香醋的风味特征获取与陈酿年份/真伪数字化辨识，变破坏理化和主观感官品评为可量化、分布式、无损且高精度的数字化流程。
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="#tech"
                  className="inline-flex items-center gap-3 rounded-full bg-[var(--forest)] px-7 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(31,93,70,0.2)] transition-transform hover:scale-[1.02]"
                >
                  查看技术路线
                  <ArrowRight size={18} />
                </a>
                <a
                  href="#results"
                  className="inline-flex items-center gap-3 rounded-full border border-[var(--line-strong)] bg-white px-7 py-4 text-base font-semibold text-[var(--ink)] transition-colors hover:border-[var(--forest)] hover:text-[var(--forest)]"
                >
                  查看实验结果
                  <ChevronRight size={18} />
                </a>
                <button
                  type="button"
                  onClick={() => setPredictorOpen(true)}
                  className="inline-flex items-center gap-3 rounded-full border border-[var(--line-strong)] bg-[var(--paper)] px-7 py-4 text-base font-semibold text-[var(--ink)] transition-colors hover:border-[var(--forest)] hover:text-[var(--forest)]"
                >
                  风味检测模组
                  <Cpu size={18} />
                </button>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {HERO_METRICS.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[26px] border border-[rgba(23,59,44,0.08)] bg-white/85 p-5 shadow-[0_18px_38px_rgba(23,59,44,0.05)] backdrop-blur-sm"
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--muted)]">{item.label}</p>
                    <p className="mt-4 text-3xl font-semibold text-[var(--ink)]">{item.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 36 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.08 }}
              className="relative"
            >
              <div className="overflow-hidden rounded-[38px] border border-[rgba(17,55,41,0.1)] bg-[linear-gradient(180deg,#183d2d_0%,#21533d_62%,#658053_100%)] p-4 shadow-[0_36px_80px_rgba(22,52,38,0.18)]">
                <img
                  src="/illustrations/hero-agri.svg"
                  alt="气谱双擎项目示意图"
                  className="h-full w-full rounded-[28px] object-cover"
                />
              </div>
              <div className="absolute -left-2 bottom-8 rounded-[28px] border border-[rgba(17,55,41,0.08)] bg-[rgba(255,250,241,0.95)] p-5 shadow-[0_22px_50px_rgba(23,44,35,0.16)] backdrop-blur-sm md:-left-8 md:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--forest)]">项目定位</p>
                <div className="mt-4">
                  <p className="text-base font-semibold text-[var(--ink)]">陈酿香醋数字化指纹</p>
                  <p className="text-xs text-[var(--muted)] mt-1">迈入高精无损数字时代</p>
                </div>
              </div>
              <div className="absolute right-4 top-6 max-w-[240px] rounded-[24px] border border-white/35 bg-white/82 p-4 shadow-lg backdrop-blur-md md:right-8 md:top-10">
                <p className="text-xs font-bold uppercase tracking-[0.26em] text-[var(--forest)]">系统标签</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['PEN3 电子鼻', '380-1038nm', 'CFAW 融合', '边缘部署'].map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-[var(--paper-strong)] px-3 py-2 text-xs font-semibold text-[var(--ink)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="background" className="px-4 py-16 md:px-6 md:py-20">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Research Background"
              title="聚焦恒顺醋业“揭榜挂帅”，攻关传统发酵数字化痛点"
              description="本项目围绕传统调味品风味数字化特征缺失、年份与品质界定难、复核效率低等核心产业痛点，开发一体化的“气谱双擎”多模态无损快检系统，覆盖顶空气味响应、全波谱漫反射特征、跨模态融合与掌上边缘端部署。"
            />
            <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <motion.div
                {...sectionMotion}
                className="rounded-[34px] bg-[linear-gradient(160deg,#173b2c_0%,#204e3b_52%,#335f49_100%)] p-6 text-white shadow-[0_30px_80px_rgba(21,49,36,0.18)] md:p-8"
              >
                <p className="text-xs font-bold uppercase tracking-[0.32em] text-white/60">为什么值得做</p>
                <h3 className="mt-4 font-display text-3xl leading-tight md:text-4xl">
                  {renderTitleWithCommaBreak('让传统香醋风味检测，从感官经验升级为可复核的数字指纹')}
                </h3>
                <p className="mt-6 text-base leading-8 text-white/76">
                  传统陈酿香醋的理化分析耗时长、成本高且破坏样品，而人工感官品评极易受人为主观偏差影响。
                  项目设计的双模态融合快检，实现样品秒级无损识别，能够完美配合传统香醋智能化在线加工与出厂品控的切实要求。
                </p>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {[
                    { label: '多模硬件', value: '10路电子鼻 + 漫反射高光谱' },
                    { label: '首要对象', value: '恒顺陈酿年份香醋' },
                    { label: '检测特征', value: '原位、非破坏、秒级快检' },
                    { label: '输出指标', value: '陈酿年份 / 真伪鉴定 / 指纹图谱' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-[24px] border border-white/10 bg-white/6 p-5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/48">{item.label}</p>
                      <p className="mt-3 text-lg font-semibold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <div className="grid gap-5 md:grid-cols-3">
                {CHALLENGE_CARDS.map((item) => (
                  <motion.article
                    key={item.title}
                    {...sectionMotion}
                    className="flex h-full flex-col rounded-[30px] border border-[var(--line)] bg-white p-6 shadow-[0_22px_48px_rgba(26,45,36,0.06)]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--paper-strong)] text-[var(--forest)]">
                      <ShieldCheck size={22} />
                    </div>
                    <h3 className="mt-5 text-2xl font-semibold text-[var(--ink)]">{item.title}</h3>
                    <p className="mt-3 text-base leading-7 text-[var(--muted)]">{item.text}</p>
                    <div className="mt-5 space-y-3 border-t border-[var(--line)] pt-4">
                      {item.points.map((point) => (
                        <div key={point} className="flex items-start gap-3 text-sm leading-7 text-[var(--muted)]">
                          <CheckCircle2 size={18} className="mt-1 shrink-0 text-[var(--forest)]" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="tech" className="border-y border-[rgba(29,78,57,0.08)] bg-[rgba(255,252,245,0.72)] px-4 py-16 md:px-6 md:py-20">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Technology"
              title="气味 + 光谱 + 融合网络，组成完整技术方案"
              description="系统由电子鼻、高光谱和 IFFormer 融合网络组成，前端负责采集异构特征，后端完成跨模态判别，形成完整的无损检测闭环。"
            />
            <div className="mt-8 grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
              <motion.div
                {...sectionMotion}
                className="rounded-[34px] border border-[var(--line)] bg-white p-5 shadow-[0_26px_60px_rgba(25,43,34,0.07)] md:p-6"
              >
                <div className="overflow-hidden rounded-[26px] border border-[var(--line)] bg-[var(--paper-strong)]">
                  <img
                    src="/illustrations/workflow-system.svg"
                    alt="气谱双擎工作流示意图"
                    className="w-full object-cover"
                  />
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {WORKFLOW_STEPS.map((item) => (
                    <div key={item.step} className="rounded-[24px] border border-[var(--line)] bg-[var(--paper)] p-5">
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-[var(--forest)] px-3 py-1 text-xs font-bold tracking-[0.24em] text-white">
                          {item.step}
                        </span>
                        <p className="text-base font-semibold text-[var(--ink)]">{item.title}</p>
                      </div>
                      <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{item.text}</p>
                      <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{item.detail}</p>
                      <div className="mt-4 rounded-[18px] border border-[var(--line)] bg-white px-4 py-3 text-sm font-semibold text-[var(--forest)]">
                        {item.output}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <div className="grid gap-5">
                {Object.values(MODULE_DETAILS).map((module) => (
                  <motion.button
                    type="button"
                    key={module.key}
                    {...sectionMotion}
                    onClick={() => setActiveModule(module.key)}
                    className="group rounded-[32px] border border-[var(--line)] bg-white p-6 text-left shadow-[0_20px_46px_rgba(23,42,34,0.06)] transition-transform hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--paper-strong)] text-[var(--forest)]">
                        {renderModuleIcon(module.key, 26)}
                      </div>
                      <span className="rounded-full bg-[var(--paper)] px-3 py-2 text-xs font-bold uppercase tracking-[0.24em] text-[var(--forest)]">
                        {module.label}
                      </span>
                    </div>
                    <h3 className="mt-6 text-2xl font-semibold text-[var(--ink)]">{module.name}</h3>
                    <p className="mt-4 text-base leading-8 text-[var(--muted)]">{module.summary}</p>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      {module.metrics.slice(0, 2).map((item) => (
                        <div key={item.label} className="rounded-[22px] bg-[var(--paper)] p-4">
                          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--muted)]">
                            {item.label}
                          </p>
                          <p className="mt-2 text-lg font-semibold text-[var(--ink)]">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--forest)]">
                      查看模块细节
                      <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="applications" className="bg-[rgba(255,252,245,0.88)] px-4 py-16 md:px-6 md:py-20">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Applications"
              title="恒顺年份陈酿香醋快检，全场景数字化赋能"
              description="系统针对恒顺年份香醋的陈酿年份与真伪特征检测，能充分服务于出厂防伪、仓储品质监控与现场快速秒级核验场景。"
            />
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {APPLICATIONS.map((item) => (
                <motion.article
                  key={item.title}
                  {...sectionMotion}
                  className="flex h-full flex-col overflow-hidden rounded-[32px] border border-[var(--line)] bg-white shadow-[0_22px_54px_rgba(23,42,34,0.06)]"
                >
                  <div className="relative border-b border-[var(--line)] bg-[var(--paper-strong)] p-3">
                    <div className="relative aspect-[5/4] overflow-hidden rounded-[22px] bg-[#eadfcd]">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover object-center transition-transform duration-500 hover:scale-[1.04]"
                        loading="lazy"
                      />
                    </div>
                    <span className="absolute right-6 top-6 rounded-full bg-[var(--forest)] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-lg">
                      {item.badge}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-2xl font-semibold text-[var(--ink)]">{item.title}</h3>
                    <p className="mt-4 text-base leading-7 text-[var(--muted)] md:min-h-[72px]">{item.text}</p>
                    <div className="mt-5 space-y-3 border-t border-[var(--line)] pt-4">
                      {item.points.map((point) => (
                        <div key={point} className="flex items-start gap-3 text-sm leading-7 text-[var(--muted)]">
                          <CheckCircle2 size={18} className="mt-1 shrink-0 text-[var(--forest)]" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            <motion.div
              {...sectionMotion}
              className="mt-6 rounded-[34px] border border-[var(--line)] bg-[var(--ink)] p-6 text-white shadow-[0_26px_70px_rgba(20,38,29,0.2)] md:p-7"
            >
              <div className="grid gap-7 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
                <div className="max-w-2xl">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/55">Deployment Targets</p>
                  <h3 className="mt-4 font-display text-3xl md:text-4xl">系统可直接进入产地、仓储、流通与监管环节</h3>
                  <p className="mt-5 text-base leading-8 text-white/72">
                    当前系统并不是停留在算法验证层面，而是围绕真实业务流程设计检测链路。前端采集设备负责快速获取样本气味与光谱特征，
                    后端模型完成跨模态判别，因此既能满足来源识别需求，也具备向现场终端迁移的条件。
                  </p>
                  <p className="mt-4 text-base leading-8 text-white/72">
                    从落地顺序看，系统更适合先进入样本集中、检测频繁、来源管理要求高的场景，再逐步向企业端和监管端扩展。
                    这样既能体现无损快检优势，也便于形成稳定的数据闭环。
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {LANDING_POINTS.map((item) => (
                    <div key={item.title} className="rounded-[24px] border border-white/10 bg-white/6 px-5 py-5">
                      <p className="text-base font-semibold text-white">{item.title}</p>
                      <p className="mt-3 text-sm leading-7 text-white/72">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="contact" className="px-4 py-16 md:px-6 md:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="grid overflow-hidden rounded-[38px] border border-[var(--line)] bg-white shadow-[0_28px_70px_rgba(23,42,34,0.08)] lg:grid-cols-[0.88fr_1.12fr]">
              <div className="relative overflow-hidden bg-[linear-gradient(160deg,#183d2d_0%,#27553f_52%,#6f8451_100%)] p-6 text-white md:p-8">
                <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-[rgba(247,229,197,0.18)] blur-3xl" />
                <div className="relative">
                  <p className="text-xs font-bold uppercase tracking-[0.32em] text-white/60">Deployment</p>
                  <h2 className="mt-4 font-display text-4xl leading-tight">围绕真实业务场景收集部署需求与应用条件</h2>
                  <p className="mt-6 max-w-md text-base leading-8 text-white/78">
                    可围绕检测对象、部署环境、精度要求和终端形态收集需求，用于后续方案对接、设备适配与系统落地。
                  </p>
                </div>
                <div className="relative mt-8 grid gap-4">
                  {[
                    { title: '检测链路完整', text: '从样本进入检测位到跨模态判别输出，系统具备完整的无损识别流程。', icon: <BarChart3 size={18} /> },
                    { title: '多模数据协同', text: '电子鼻与高光谱协同工作，兼顾挥发物差异和光谱结构差异。', icon: <Database size={18} /> },
                    { title: '部署路径清晰', text: '算法结构轻量，适合向低成本边缘终端和现场快检设备迁移。', icon: <Globe size={18} /> },
                  ].map((item) => (
                    <div key={item.title} className="rounded-[24px] border border-white/10 bg-white/6 p-5">
                      <div className="flex items-center gap-3 text-sm font-semibold text-white">
                        {item.icon}
                        {item.title}
                      </div>
                      <p className="mt-3 text-sm leading-7 text-white/70">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 md:p-8">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex h-full min-h-[320px] flex-col items-center justify-center text-center"
                  >
                    <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-[var(--paper-strong)] text-[var(--forest)]">
                      <CheckCircle2 size={40} />
                    </div>
                    <h3 className="mt-6 text-3xl font-semibold text-[var(--ink)]">部署需求已记录</h3>
                    <p className="mt-4 max-w-md text-base leading-8 text-[var(--muted)]">
                      当前提交通路已正常响应，你可以继续补充检测对象、部署环境、终端形态和精度要求。
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="mt-8 rounded-full border border-[var(--line)] bg-white px-6 py-3 text-sm font-semibold text-[var(--forest)]"
                    >
                      返回表单
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.32em] text-[var(--forest)]">Requirement Form</p>
                      <h3 className="mt-4 text-3xl font-semibold text-[var(--ink)]">提交部署需求 / 留下应用场景</h3>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      <label className="block">
                        <span className="text-sm font-semibold text-[var(--ink)]">姓名</span>
                        <input
                          required
                          type="text"
                          value={formData.name}
                          onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                          placeholder="请输入联系人姓名"
                          className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-[var(--paper)] px-5 py-4 text-base text-[var(--ink)] outline-none transition-colors focus:border-[var(--forest)]"
                        />
                      </label>
                      <label className="block">
                        <span className="text-sm font-semibold text-[var(--ink)]">单位 / 团队</span>
                        <input
                          type="text"
                          value={formData.organization}
                          onChange={(event) => setFormData({ ...formData, organization: event.target.value })}
                          placeholder="例如学院、实验室或企业名称"
                          className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-[var(--paper)] px-5 py-4 text-base text-[var(--ink)] outline-none transition-colors focus:border-[var(--forest)]"
                        />
                      </label>
                    </div>
                    <label className="block">
                      <span className="text-sm font-semibold text-[var(--ink)]">关注对象</span>
                      <select
                        value={formData.product}
                        onChange={(event) => setFormData({ ...formData, product: event.target.value })}
                        className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-[var(--paper)] px-5 py-4 text-base text-[var(--ink)] outline-none transition-colors focus:border-[var(--forest)]"
                      >
                        <option>陈酿香醋</option>
                        <option>其他陈酿醋品</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-sm font-semibold text-[var(--ink)]">需求说明</span>
                      <textarea
                        rows={5}
                        value={formData.message}
                        onChange={(event) => setFormData({ ...formData, message: event.target.value })}
                        placeholder="例如：用于年份陈酿抽检、入厂分级、仓储巡检、流通追溯或边缘端部署。"
                        className="mt-3 w-full resize-none rounded-[22px] border border-[var(--line)] bg-[var(--paper)] px-5 py-4 text-base leading-7 text-[var(--ink)] outline-none transition-colors focus:border-[var(--forest)]"
                      />
                    </label>
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-[var(--forest)] px-7 py-4 text-base font-semibold text-white shadow-[0_18px_36px_rgba(31,93,70,0.18)] transition-transform hover:scale-[1.01]"
                    >
                      提交部署需求
                      <Send size={18} />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[rgba(29,78,57,0.08)] bg-[rgba(255,252,245,0.9)] px-4 py-10 md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-2xl text-[var(--ink)]">气谱双擎</p>
            <p className="mt-2 text-sm text-[var(--muted)]">基于深度学习电子鼻与高光谱多模态融合传统香醋风味数字化检测系统</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-[var(--muted)]">
            <span className="rounded-full bg-white px-4 py-2">江苏恒顺醋业揭榜项目</span>
            <span className="rounded-full bg-white px-4 py-2">10路 PEN3 电子鼻</span>
            <span className="rounded-full bg-white px-4 py-2">可见-近红外高光谱</span>
          </div>
        </div>
      </footer>

      <motion.button
        type="button"
        aria-label="回到顶部"
        className="fixed bottom-6 right-6 z-[80] flex h-14 w-14 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--forest)] shadow-[0_18px_40px_rgba(24,43,34,0.12)]"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <ChevronRight size={20} className="-rotate-90" />
      </motion.button>
    </div>
  );
};

export default App;
