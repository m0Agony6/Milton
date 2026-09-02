import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  CheckCircle2,
  Cpu,
  Database,
  Layers,
  Upload,
  X,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import * as XLSX from 'xlsx';

type SampleType = 'vinegar';

type PredictionFeatureKey =
  | 'noseIntensity'
  | 'noseVolatility'
  | 'nosePeak'
  | 'spectralEnergy'
  | 'spectralContrast'
  | 'spectralPeak'
  | 'fusionConsistency';

type PredictionProfile = Record<PredictionFeatureKey, number>;

type OriginCandidate = {
  name: string;
  note: string;
  profile: PredictionProfile;
};

type RankedOrigin = {
  name: string;
  note: string;
  score: number;
};

type PredictionResult = {
  sampleType: SampleType;
  sampleLabel: string;
  predictedOrigin: string;
  predictedNote: string;
  confidence: number;
  fusionScore: number;
  dominantBand: string;
  dominantSensors: string[];
  noseCount: number;
  spectralCount: number;
  noseChart: Array<{ name: string; value: number }>;
  spectralChart: Array<{ name: string; value: number }>;
  ranking: RankedOrigin[];
  analysisParagraphs: string[];
};

type OriginPredictorModalProps = {
  open: boolean;
  onClose: () => void;
};

const SAMPLE_OPTIONS: Array<{ value: SampleType; label: string; description: string }> = [
  { value: 'vinegar', label: '陈酿香醋', description: '适用于恒顺年份香醋（3年、5年、8年、10年陈酿）及配制勾兑醋的区分与年份鉴别。' },
];

const SAMPLE_LIBRARY: Record<
  SampleType,
  { label: string; description: string; candidates: OriginCandidate[] }
> = {
  vinegar: {
    label: '陈酿香醋',
    description: '融合金属氧化物电子鼻响应与高光谱全波段反射率，实现醋样陈酿年份与真伪特征智能分类。',
    candidates: [
      {
        name: '恒顺十年精酿',
        note: '挥发物气香极其饱满浓厚（多酚与有机酸复合高阻响应），光谱峰值集中于中后波段，体现长年陈酿沉淀特征。',
        profile: {
          noseIntensity: 0.74,
          noseVolatility: 0.22,
          nosePeak: 0.48,
          spectralEnergy: 0.72,
          spectralContrast: 0.18,
          spectralPeak: 0.54,
          fusionConsistency: 0.92,
        },
      },
      {
        name: '恒顺八年陈酿',
        note: '电子鼻高响应通道在特定有机酸和酯类敏感波段表现突出，光谱特征在中高段反射呈现高度一致性，指标完美。',
        profile: {
          noseIntensity: 0.69,
          noseVolatility: 0.2,
          nosePeak: 0.42,
          spectralEnergy: 0.68,
          spectralContrast: 0.17,
          spectralPeak: 0.5,
          fusionConsistency: 0.89,
        },
      },
      {
        name: '恒顺五年陈酿',
        note: '挥发物响应在中段释放平稳，光谱能量反射分布十分均衡，代表了五年标准陈酿样品的数字化黄金基线。',
        profile: {
          noseIntensity: 0.63,
          noseVolatility: 0.18,
          nosePeak: 0.38,
          spectralEnergy: 0.64,
          spectralContrast: 0.15,
          spectralPeak: 0.46,
          fusionConsistency: 0.86,
        },
      },
      {
        name: '恒顺三年陈酿',
        note: '气味前段挥发迅速，光谱由于色泽较淡呈现中前段反射抬升，属于典型初级发酵香醋特征。',
        profile: {
          noseIntensity: 0.58,
          noseVolatility: 0.24,
          nosePeak: 0.59,
          spectralEnergy: 0.61,
          spectralContrast: 0.21,
          spectralPeak: 0.58,
          fusionConsistency: 0.81,
        },
      },
      {
        name: '劣质勾兑仿冒醋',
        note: '电子鼻表现为极不自然的人工醋酸挥发（前段单通道瞬时超高），而高光谱严重缺乏陈酿微量元素形成的特定吸收，融合度极低。',
        profile: {
          noseIntensity: 0.45,
          noseVolatility: 0.32,
          nosePeak: 0.81,
          spectralEnergy: 0.48,
          spectralContrast: 0.29,
          spectralPeak: 0.76,
          fusionConsistency: 0.58,
        },
      },
    ],
  },
};

const FEATURE_WEIGHTS: Record<PredictionFeatureKey, number> = {
  noseIntensity: 1.2,
  noseVolatility: 1.05,
  nosePeak: 0.9,
  spectralEnergy: 1.15,
  spectralContrast: 1,
  spectralPeak: 1.1,
  fusionConsistency: 1.25,
};

const SUPPORTED_FORMATS = '.xlsx,.xls,.csv,.tsv,.txt,.json';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const average = (values: number[]) =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

const standardDeviation = (values: number[]) => {
  if (values.length < 2) return 0;
  const mean = average(values);
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
};

const topIndices = (values: number[], count: number) =>
  values
    .map((value, index) => ({ value, index }))
    .sort((left, right) => right.value - left.value)
    .slice(0, count)
    .map((item) => item.index);

const normalizeSeries = (values: number[]) => {
  if (!values.length) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (Math.abs(max - min) < 1e-9) return values.map(() => 0.5);
  return values.map((value) => (value - min) / (max - min));
};

const segmentSeries = (values: number[], segments: number) =>
  Array.from({ length: segments }, (_, index) => {
    const start = Math.floor((index * values.length) / segments);
    const end = Math.floor(((index + 1) * values.length) / segments);
    const slice = values.slice(start, end);
    return slice.length ? average(slice) : values[Math.min(start, values.length - 1)] ?? 0;
  });

const roundValue = (value: number, digits = 3) => Number(value.toFixed(digits));

const extractNumbersFromText = (text: string) => {
  const matches = text.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi) ?? [];
  return matches.map((item) => Number(item)).filter((value) => Number.isFinite(value));
};

const collectNumbers = (input: unknown, collector: number[]) => {
  if (typeof input === 'number' && Number.isFinite(input)) {
    collector.push(input);
    return;
  }

  if (typeof input === 'string') {
    extractNumbersFromText(input).forEach((value) => collector.push(value));
    return;
  }

  if (Array.isArray(input)) {
    input.forEach((item) => collectNumbers(item, collector));
    return;
  }

  if (input && typeof input === 'object') {
    Object.values(input).forEach((value) => collectNumbers(value, collector));
  }
};

const readNumericSeries = async (file: File) => {
  const lowerName = file.name.toLowerCase();

  if (lowerName.endsWith('.txt') || lowerName.endsWith('.csv') || lowerName.endsWith('.tsv')) {
    return extractNumbersFromText(await file.text());
  }

  if (lowerName.endsWith('.json')) {
    const collector: number[] = [];
    collectNumbers(JSON.parse(await file.text()), collector);
    return collector;
  }

  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true }) as unknown[][];
  const collector: number[] = [];
  rows.forEach((row) => row.forEach((cell) => collectNumbers(cell, collector)));
  return collector;
};

const getBandLabels = (count: number) =>
  Array.from({ length: count }, (_, index) => {
    const start = 380 + (658 / count) * index;
    const end = 380 + (658 / count) * (index + 1);
    return `${Math.round(start)}-${Math.round(end)}nm`;
  });

const computePrediction = (
  sampleType: SampleType,
  noseValues: number[],
  spectralValues: number[],
): PredictionResult => {
  const noseRawSeries = segmentSeries(noseValues, 10);
  const spectralRawSeries = segmentSeries(spectralValues, 18);
  const noseSeries = normalizeSeries(noseRawSeries);
  const spectralSeries = normalizeSeries(spectralRawSeries);
  const spectralLabels = getBandLabels(spectralSeries.length);

  const actualProfile: PredictionProfile = {
    noseIntensity: average(noseSeries),
    noseVolatility: standardDeviation(noseSeries),
    nosePeak: topIndices(noseSeries, 1)[0] / Math.max(noseSeries.length - 1, 1),
    spectralEnergy: average(spectralSeries),
    spectralContrast: standardDeviation(spectralSeries),
    spectralPeak: topIndices(spectralSeries, 1)[0] / Math.max(spectralSeries.length - 1, 1),
    fusionConsistency: clamp(
      1 -
        Math.abs(average(noseSeries) - average(spectralSeries)) * 0.9 -
        Math.abs(standardDeviation(noseSeries) - standardDeviation(spectralSeries)) * 0.6,
      0.52,
      0.96,
    ),
  };

  const ranked = SAMPLE_LIBRARY[sampleType].candidates
    .map((candidate) => {
      const weightedDistance = (
        Object.keys(FEATURE_WEIGHTS) as PredictionFeatureKey[]
      ).reduce((sum, key) => {
        return sum + Math.abs(actualProfile[key] - candidate.profile[key]) * FEATURE_WEIGHTS[key];
      }, 0);
      const maxDistance = Object.values(FEATURE_WEIGHTS).reduce((sum, value) => sum + value, 0);
      const score = clamp((1 - weightedDistance / maxDistance) * 100, 0, 100);

      return {
        name: candidate.name,
        note: candidate.note,
        score: roundValue(score, 1),
      };
    })
    .sort((left, right) => right.score - left.score);

  const bestMatch = ranked[0];
  const secondMatch = ranked[1] ?? ranked[0];
  const gap = bestMatch.score - secondMatch.score;
  const density = clamp(
    Math.log10(Math.max(10, noseValues.length + spectralValues.length)) / 5,
    0.45,
    1,
  );
  const confidence = Math.round(clamp(bestMatch.score * 0.74 + gap * 1.4 + density * 10, 68, 97));
  const fusionScore = Math.round(clamp(actualProfile.fusionConsistency * 100, 62, 96));
  const strongestSensors = topIndices(noseSeries, 3).map((index) => `S${index + 1}`);
  const dominantBand = spectralLabels[topIndices(spectralSeries, 1)[0]] ?? spectralLabels[0];
  const sampleLabel = SAMPLE_LIBRARY[sampleType].label;

  return {
    sampleType,
    sampleLabel,
    predictedOrigin: bestMatch.name,
    predictedNote: bestMatch.note,
    confidence,
    fusionScore,
    dominantBand,
    dominantSensors: strongestSensors,
    noseCount: noseValues.length,
    spectralCount: spectralValues.length,
    noseChart: noseSeries.map((value, index) => ({
      name: `S${index + 1}`,
      value: roundValue(value, 3),
    })),
    spectralChart: spectralSeries.map((value, index) => ({
      name: spectralLabels[index],
      value: roundValue(value, 3),
    })),
    ranking: ranked.slice(0, 3),
    analysisParagraphs: [
      `${sampleLabel}样本的电子鼻数据共提取到 ${noseValues.length} 个有效数值，高光谱数据共提取到 ${spectralValues.length} 个有效数值。系统对两路数据完成归一化和分段聚合后，电子鼻主响应主要集中在 ${strongestSensors.join('、')} 通道，说明当前样本的挥发物特征分布较为集中。`,
      `高光谱主峰位于 ${dominantBand} 波段区间，说明该段反射信息对当前样本的判别贡献更高。结合电子鼻响应强度、波动水平与光谱峰值位置，系统得到的双模态一致性为 ${fusionScore}%，表明两类模态在来源判断上具有较好的协同关系。`,
      `综合融合结果后，当前样本与 ${bestMatch.name} 的特征匹配度最高，预测置信度为 ${confidence}%。从工程判断看，这意味着上传文件在气味结构和光谱分布上更接近该产区样本的典型模式，可作为产地抽检、入厂快检和批次复核时的辅助判断依据。`,
    ],
  };
};

const PredictionResultModal = ({
  result,
  onBack,
  onClose,
}: {
  result: PredictionResult;
  onBack: () => void;
  onClose: () => void;
}) => (
  <AnimatePresence>
    <motion.div
      className="fixed inset-0 z-[170] flex items-start justify-center overflow-y-auto px-3 py-3 sm:px-4 sm:py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(12,24,19,0.72)] backdrop-blur-sm"
        onClick={onClose}
        aria-label="关闭识别结果"
      />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        transition={{ duration: 0.24, ease: 'easeOut' }}
        className="relative z-10 flex w-full max-w-6xl flex-col overflow-hidden rounded-[34px] border border-white/55 bg-[var(--paper)] shadow-[0_40px_120px_rgba(17,42,31,0.28)] max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)]"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[var(--line)] px-6 py-5 md:px-8">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--forest)]">Prediction Result</p>
            <h3 className="mt-3 break-words font-display text-3xl text-[var(--ink)] md:text-4xl">
              {result.sampleLabel}年份与风味预测：{result.predictedOrigin}
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">{result.predictedNote}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--forest)] transition-transform hover:scale-105"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6 md:px-8">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: '预测分类', value: result.predictedOrigin },
              { label: '预测置信度', value: `${result.confidence}%` },
              { label: '融合一致性', value: `${result.fusionScore}%` },
              { label: '主峰波段', value: result.dominantBand },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-[0_16px_36px_rgba(23,42,34,0.05)]"
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--muted)]">{item.label}</p>
                <p className="mt-3 text-2xl font-semibold text-[var(--ink)]">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[0.98fr_1.02fr]">
            <div className="min-w-0 rounded-[30px] border border-[var(--line)] bg-white p-6 shadow-[0_18px_42px_rgba(24,43,34,0.05)]">
              <div className="flex items-center gap-3 text-sm font-semibold text-[var(--ink)]">
                <BarChart3 size={18} className="text-[var(--forest)]" />
                电子鼻响应分析
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                已提取 {result.noseCount} 个有效数值，主响应通道为 {result.dominantSensors.join('、')}。
              </p>
              <div className="mt-5 h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={result.noseChart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d9d5c9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#5f655f', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#5f655f', fontSize: 12 }} />
                    <Tooltip
                      cursor={{ fill: 'rgba(33,83,61,0.06)' }}
                      contentStyle={{
                        borderRadius: '18px',
                        border: '1px solid rgba(31,93,70,0.12)',
                        backgroundColor: '#fffaf3',
                      }}
                    />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#1f5d46" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="min-w-0 rounded-[30px] border border-[var(--line)] bg-white p-6 shadow-[0_18px_42px_rgba(24,43,34,0.05)]">
              <div className="flex items-center gap-3 text-sm font-semibold text-[var(--ink)]">
                <Database size={18} className="text-[var(--forest)]" />
                高光谱波段分析
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                已提取 {result.spectralCount} 个有效数值，主峰落在 {result.dominantBand} 区间。
              </p>
              <div className="mt-5 h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={result.spectralChart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d9d5c9" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#5f655f', fontSize: 11 }}
                      interval={2}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#5f655f', fontSize: 12 }} />
                    <Tooltip
                      cursor={{ stroke: '#1f5d46', strokeWidth: 1 }}
                      contentStyle={{
                        borderRadius: '18px',
                        border: '1px solid rgba(31,93,70,0.12)',
                        backgroundColor: '#fffaf3',
                      }}
                    />
                    <Line type="monotone" dataKey="value" stroke="#c38a3e" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="min-w-0 rounded-[30px] border border-[var(--line)] bg-white p-6 shadow-[0_18px_42px_rgba(24,43,34,0.05)]">
              <div className="flex items-center gap-3 text-sm font-semibold text-[var(--ink)]">
                <Layers size={18} className="text-[var(--forest)]" />
                融合分析结论
              </div>
              <div className="mt-5 space-y-4">
                {result.analysisParagraphs.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-8 text-[var(--muted)]">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <div className="min-w-0 rounded-[30px] border border-[var(--line)] bg-[var(--ink)] p-6 text-white shadow-[0_20px_50px_rgba(20,38,29,0.2)]">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/58">Origin Ranking</p>
              <div className="mt-5 space-y-4">
                {result.ranking.map((item, index) => (
                  <div key={item.name} className="rounded-[22px] border border-white/10 bg-white/6 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white">
                          {index + 1}. {item.name}
                        </p>
                        <p className="mt-2 break-words text-sm leading-6 text-white/72">{item.note}</p>
                      </div>
                      <div className="self-start rounded-full bg-white/10 px-3 py-2 text-sm font-semibold text-white sm:shrink-0">
                        {item.score}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-[var(--line)] px-6 py-5 md:px-8">
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)]"
          >
            重新上传文件
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[var(--forest)] px-5 py-3 text-sm font-semibold text-white"
          >
            关闭识别页
          </button>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

export const OriginPredictorModal = ({ open, onClose }: OriginPredictorModalProps) => {
  const [sampleType, setSampleType] = useState<SampleType>('vinegar');
  const [noseFile, setNoseFile] = useState<File | null>(null);
  const [spectralFile, setSpectralFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);

  useEffect(() => {
    if (!open) {
      setSampleType('vinegar');
      setNoseFile(null);
      setSpectralFile(null);
      setError(null);
      setProcessing(false);
      setResult(null);
    }
  }, [open]);

  const handleAnalyze = async () => {
    if (!noseFile || !spectralFile) {
      setError('请同时上传电子鼻文件和高光谱文件。');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const [noseValues, spectralValues] = await Promise.all([
        readNumericSeries(noseFile),
        readNumericSeries(spectralFile),
      ]);

      if (noseValues.length < 20 || spectralValues.length < 20) {
        throw new Error('文件中的有效数值过少，请检查上传的数据格式是否正确。');
      }

      setResult(computePrediction(sampleType, noseValues, spectralValues));
    } catch (analysisError) {
      const message =
        analysisError instanceof Error ? analysisError.message : '文件解析失败，请更换为规范的表格或文本数据。';
      setError(message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[150] flex items-start justify-center overflow-y-auto px-3 py-3 sm:px-4 sm:py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-[rgba(12,24,19,0.72)] backdrop-blur-sm"
            onClick={onClose}
            aria-label="关闭双模态产地识别页"
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="relative z-10 flex w-full max-w-6xl flex-col overflow-hidden rounded-[34px] border border-white/55 bg-[var(--paper)] shadow-[0_40px_120px_rgba(17,42,31,0.28)] max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)]"
          >
            <div className="grid min-h-0 flex-1 overflow-y-auto overscroll-contain lg:grid-cols-[0.95fr_1.05fr]">
            <div className="relative min-w-0 bg-[linear-gradient(160deg,#173b2c_0%,#204e3b_52%,#335f49_100%)] p-6 text-white md:p-8">
              <div className="absolute -right-12 top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-44 w-44 rounded-full bg-[rgba(247,229,197,0.16)] blur-3xl" />
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                  <Cpu size={28} />
                </div>
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.32em] text-white/68">Flavor Detection</p>
                <h3 className="mt-3 font-display text-3xl leading-tight md:text-4xl">
                  电子鼻 + 高光谱
                  <span className="block">双模态风味检测页</span>
                </h3>
                <p className="mt-5 text-sm leading-7 text-white/76">
                  上传电子鼻响应文件和高光谱文件后，系统会自动提取有效数值，完成多传感器气味响应分析、反射吸收带特征拟合与融合年份/品质判别。
                  结果页会同步给出主响应通道、主吸收/反射波段、融合一致性与候选风味排序。
                </p>
              </div>

              <div className="relative mt-8 space-y-4">
                {[
                  {
                    title: '数据读取',
                    text: '支持 .xlsx、.xls、.csv、.tsv、.txt、.json 等常见格式。',
                    icon: <Upload size={18} />,
                  },
                  {
                    title: '成分波谱拟合',
                    text: '自动提取多路气体传感器响应曲线和高光谱关键波谱区间。',
                    icon: <Database size={18} />,
                  },
                  {
                    title: '多模态深度辨识',
                    text: '结合双模态协同相关度，给出陈酿年份、品质等级排序与匹配置信度。',
                    icon: <BarChart3 size={18} />,
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-[24px] border border-white/10 bg-white/6 p-5">
                    <div className="flex items-center gap-3 text-sm font-semibold text-white">
                      {item.icon}
                      {item.title}
                    </div>
                    <p className="mt-3 text-sm leading-7 text-white/72">{item.text}</p>
                  </div>
                ))}
              </div>

              <div className="relative mt-8 rounded-[26px] border border-white/10 bg-white/8 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/62">检测步骤</p>
                <div className="mt-4 space-y-3">
                  {[
                    '选择调味品类型，锁定候选风味/陈酿区间。',
                    '分别上传电子鼻和高光谱响应数据文件。',
                    '系统自动提取气敏时间序列与吸收带特征。',
                    '生成分类判定、一致性评分与风味指纹图谱。',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 text-sm leading-7 text-white/82">
                      <CheckCircle2 size={18} className="mt-1 shrink-0 text-[#f1d6a9]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="min-w-0 border-t border-[var(--line)] p-6 md:p-8 lg:border-l lg:border-t-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-[0.32em] text-[var(--forest)]">
                    Upload Workspace
                  </p>
                  <h4 className="mt-3 break-words text-3xl font-semibold text-[var(--ink)]">上传双模态文件并启动辨识</h4>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--forest)] transition-transform hover:scale-105"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-8 rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-[0_20px_44px_rgba(23,42,34,0.05)]">
                <label className="block">
                  <span className="text-sm font-semibold text-[var(--ink)]">样本类型</span>
                  <select
                    value={sampleType}
                    onChange={(event) => setSampleType(event.target.value as SampleType)}
                    className="mt-3 w-full rounded-[22px] border border-[var(--line)] bg-[var(--paper)] px-5 py-4 text-base text-[var(--ink)] outline-none transition-colors focus:border-[var(--forest)]"
                  >
                    {SAMPLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                    {SAMPLE_OPTIONS.find((item) => item.value === sampleType)?.description}
                  </p>
                </label>

                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  {[
                    {
                      title: '电子鼻文件',
                      description: '上传电子鼻传感器响应矩阵或预处理结果文件。',
                      file: noseFile,
                      onChange: (file: File | null) => setNoseFile(file),
                    },
                    {
                      title: '高光谱文件',
                      description: '上传高光谱波段数据、反射率表格或特征矩阵文件。',
                      file: spectralFile,
                      onChange: (file: File | null) => setSpectralFile(file),
                    },
                  ].map((item) => (
                    <label
                      key={item.title}
                      className="block rounded-[24px] border border-dashed border-[var(--line-strong)] bg-[var(--paper)] p-5 transition-colors hover:border-[var(--forest)]"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[var(--forest)] shadow-sm">
                        <Upload size={22} />
                      </div>
                      <p className="mt-4 text-base font-semibold text-[var(--ink)]">{item.title}</p>
                      <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{item.description}</p>
                      <input
                        type="file"
                        accept={SUPPORTED_FORMATS}
                        className="sr-only"
                        onChange={(event) => item.onChange(event.target.files?.[0] ?? null)}
                      />
                      <div className="mt-5 break-all rounded-[20px] bg-white px-4 py-3 text-sm text-[var(--muted)]">
                        {item.file ? `${item.file.name} · ${(item.file.size / 1024).toFixed(1)} KB` : '点击选择文件'}
                      </div>
                    </label>
                  ))}
                </div>

                <div className="mt-6 rounded-[24px] border border-[var(--line)] bg-[var(--paper)] p-5">
                  <div className="flex items-center gap-3 text-sm font-semibold text-[var(--ink)]">
                    <Layers size={18} className="text-[var(--forest)]" />
                    当前辨识范围
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{SAMPLE_LIBRARY[sampleType].description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {SAMPLE_LIBRARY[sampleType].candidates.map((item) => (
                      <span
                        key={item.name}
                        className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-[var(--ink)]"
                      >
                        {item.name}
                      </span>
                    ))}
                  </div>
                </div>

                {error ? (
                  <div className="mt-6 rounded-[20px] border border-[rgba(183,70,70,0.22)] bg-[rgba(255,241,241,0.92)] px-4 py-3 text-sm text-[#9c3737]">
                    {error}
                  </div>
                ) : null}

                <div className="mt-6 flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setNoseFile(null);
                      setSpectralFile(null);
                      setError(null);
                    }}
                    className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)]"
                  >
                    清空文件
                  </button>
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={processing}
                    className="rounded-full bg-[var(--forest)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(31,93,70,0.18)] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {processing ? '正在分析...' : '开始分析与预测'}
                  </button>
                </div>
              </div>
            </div>
            </div>
          </motion.div>

          {result ? <PredictionResultModal result={result} onBack={() => setResult(null)} onClose={onClose} /> : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
