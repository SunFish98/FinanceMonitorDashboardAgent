import { EconomicIndicator } from './types';

export const INDICATORS_CONFIG: EconomicIndicator[] = [
  // ===== EMPLOYMENT =====
  {
    id: 'nfp',
    name: '非农就业人数',
    nameEn: 'Non-Farm Payrolls',
    description: '衡量美国非农业部门新增就业岗位数量，是最重要的就业指标',
    schedule: '每月第一个星期五',
    importance: 5,
    category: 'employment',
    fredSeriesId: 'PAYEMS',
    fredUnits: 'chg',
    unit: '千人/月',
    unitSuffix: 'K',
    marketImpact: {
      beat: '美元走强，美股科技板块承压，市场预期美联储维持鹰派立场',
      miss: '美元走弱，美债收益率下行，市场加大降息押注',
      inline: '市场反应温和，关注下月数据修正',
    },
  },
  {
    id: 'unemployment',
    name: '失业率',
    nameEn: 'Unemployment Rate',
    description: '美国劳工统计局公布的失业人口占劳动力总数的百分比',
    schedule: '每月第一个星期五（与非农同步）',
    importance: 5,
    category: 'employment',
    fredSeriesId: 'UNRATE',
    unit: '%',
    marketImpact: {
      beat: '失业率低于预期，劳动力市场强劲，美联储降息压力降低',
      miss: '失业率高于预期，经济走弱信号，降息预期升温',
      inline: '就业市场保持稳定，美联储维持观望态度',
    },
  },
  {
    id: 'jobless_claims',
    name: '初请失业金人数',
    nameEn: 'Initial Jobless Claims',
    description: '每周首次申请失业救济金的人数，实时反映就业市场状况',
    schedule: '每周四',
    importance: 3,
    category: 'employment',
    fredSeriesId: 'ICSA',
    displayScale: 0.001,
    unit: '千人/周',
    unitSuffix: 'K',
    marketImpact: {
      beat: '初请人数低于预期，就业市场韧性强，美元小幅走强',
      miss: '初请人数高于预期，就业市场出现裂缝，市场风险偏好下降',
      inline: '就业市场保持稳健，对市场影响有限',
    },
  },
  // ===== INFLATION =====
  {
    id: 'cpi',
    name: '消费者价格指数',
    nameEn: 'CPI (Consumer Price Index)',
    description: '衡量城市消费者支付的一篮子商品和服务价格变化',
    schedule: '每月第二或第三周（通常周三）',
    importance: 5,
    category: 'inflation',
    fredSeriesId: 'CPIAUCSL',
    fredUnits: 'pc1',
    unit: '同比%',
    marketImpact: {
      beat: 'CPI超预期，通胀黏性强，美联储降息时间表推迟，美股承压',
      miss: 'CPI低于预期，通胀降温，降息预期提前，美股反弹',
      inline: '通胀符合预期，市场消化既有预期，波动有限',
    },
  },
  {
    id: 'core_cpi',
    name: '核心CPI（剔除食品能源）',
    nameEn: 'Core CPI',
    description: '剔除波动较大的食品和能源后的CPI，更能反映基础通胀趋势',
    schedule: '每月第二或第三周（与CPI同步）',
    importance: 5,
    category: 'inflation',
    fredSeriesId: 'CPILFESL',
    fredUnits: 'pc1',
    unit: '同比%',
    marketImpact: {
      beat: '核心通胀顽固，美联储鹰派倾向增强，市场重定价降息路径',
      miss: '核心通胀回落，美联储政策转向信号增强，风险资产受益',
      inline: '通胀趋势可控，美联储保持数据依赖立场',
    },
  },
  {
    id: 'pce',
    name: '个人消费支出平减指数',
    nameEn: 'PCE Price Index',
    description: '美联储最青睐的通胀指标，反映消费者实际支付价格变化',
    schedule: '每月月底（周五）',
    importance: 5,
    category: 'inflation',
    fredSeriesId: 'PCEPI',
    fredUnits: 'pc1',
    unit: '同比%',
    marketImpact: {
      beat: 'PCE超预期，美联储2%目标更难实现，鹰派倾向明显',
      miss: 'PCE回落，美联储通胀目标接近，降息窗口打开',
      inline: '通胀缓慢回落中，美联储维持耐心态度',
    },
  },
  {
    id: 'ppi',
    name: '生产者价格指数',
    nameEn: 'PPI (Producer Price Index)',
    description: '衡量生产者收到的商品和服务价格变化，是CPI的领先指标',
    schedule: '每月第二周（通常周二）',
    importance: 3,
    category: 'inflation',
    fredSeriesId: 'PPIACO',
    fredUnits: 'pc1',
    unit: '同比%',
    marketImpact: {
      beat: 'PPI走高预示未来CPI上行压力，市场通胀预期升温',
      miss: 'PPI走低预示通胀压力缓解，市场情绪改善',
      inline: '生产端价格平稳，对终端通胀影响有限',
    },
  },
  // ===== GDP =====
  {
    id: 'gdp',
    name: 'GDP增长率',
    nameEn: 'GDP Growth Rate',
    description: '美国国内生产总值季度环比年化增长率，衡量经济整体健康程度',
    schedule: '每季度（初值/修正值/终值分三次公布）',
    importance: 5,
    category: 'gdp',
    fredSeriesId: 'A191RL1Q225SBEA',
    unit: '季度年化%',
    marketImpact: {
      beat: 'GDP超预期，经济韧性强，"软着陆"叙事强化，美股上涨',
      miss: 'GDP低于预期，衰退担忧升温，美债避险需求增加',
      inline: 'GDP符合预期，经济温和增长，市场保持平稳',
    },
  },
  // ===== PMI & RETAIL =====
  {
    id: 'michigan_sentiment',
    name: '密歇根大学消费者信心指数',
    nameEn: 'Michigan Consumer Sentiment',
    description: '通过调查消费者对当前经济状况和未来预期的综合信心指数',
    schedule: '每月第二周（初值）和月底（终值）',
    importance: 3,
    category: 'pmi_retail',
    fredSeriesId: 'UMCSENT',
    unit: '指数',
    marketImpact: {
      beat: '消费者信心强劲，消费支出预期改善，经济前景乐观',
      miss: '消费者信心下滑，预示消费收缩，经济走弱风险上升',
      inline: '消费信心基本稳定，经济前景维持温和预期',
    },
  },
  {
    id: 'retail_sales',
    name: '零售销售额',
    nameEn: 'Retail Sales',
    description: '衡量消费者支出的月度数据，占GDP约70%，是经济活力重要指标',
    schedule: '每月第二周（通常周三）',
    importance: 4,
    category: 'pmi_retail',
    fredSeriesId: 'RSXFS',
    fredUnits: 'pch',
    unit: '环比%',
    marketImpact: {
      beat: '零售销售强劲，消费驱动经济增长，企业盈利预期改善',
      miss: '零售销售疲软，消费降速，经济软化信号增强',
      inline: '消费维持稳健，经济增长动能延续',
    },
  },
  {
    id: 'ism_manufacturing',
    name: '制造业工业产出',
    nameEn: 'Industrial Production: Manufacturing',
    description: '美联储制造业工业产出同比变化率。注：FRED无ISM PMI直接数据，IPMAN为最佳代理指标',
    schedule: '每月第二或第三周',
    importance: 4,
    category: 'pmi_retail',
    fredSeriesId: 'IPMAN',
    fredUnits: 'pc1',
    unit: '工业产出同比%',
    marketImpact: {
      beat: '制造业产出超预期，工业复苏信号强，经济扩张态势确认',
      miss: '制造业产出走弱，工业活动收缩，衰退担忧加剧',
      inline: '制造业产出平稳，对整体经济影响中性',
    },
  },
  {
    id: 'ism_services',
    name: '芝加哥联储活动指数',
    nameEn: 'Chicago Fed Activity Index (CFNAI)',
    description: '芝加哥联储全国活动指数，综合85项经济指标。注：替代FRED上不可直接获取的ISM服务业PMI',
    schedule: '每月第四周',
    importance: 4,
    category: 'pmi_retail',
    fredSeriesId: 'CFNAI',
    unit: '综合活动指数',
    marketImpact: {
      beat: '经济活动强于历史平均，经济扩张动能充足，风险资产受益',
      miss: '经济活动弱于历史平均，经济走弱压力显现，防御性配置增加',
      inline: '经济活动接近历史平均水平，经济整体保持稳定',
    },
  },
  // ===== HOUSING =====
  {
    id: 'housing_starts',
    name: '新屋开工数',
    nameEn: 'New Housing Starts',
    description: '新住宅建设开工数量，反映建筑活动和房地产市场健康状况',
    schedule: '每月第三周（通常周二或周三）',
    importance: 3,
    category: 'housing',
    fredSeriesId: 'HOUST',
    unit: '千套',
    unitSuffix: 'K',
    marketImpact: {
      beat: '新屋开工超预期，建筑业活跃，相关板块受益',
      miss: '新屋开工不及预期，房地产市场降温，利率敏感性显现',
      inline: '住宅市场稳步运行，对经济影响中性',
    },
  },
  {
    id: 'existing_home_sales',
    name: '成屋销售数',
    nameEn: 'Existing Home Sales',
    description: '二手住宅销售数量，反映房地产市场流动性和消费者购买力',
    schedule: '每月第三或第四周',
    importance: 3,
    category: 'housing',
    fredSeriesId: 'EXHOSLUSM495S',
    unit: '百万套',
    unitSuffix: 'M',
    marketImpact: {
      beat: '成屋销售超预期，房地产市场活跃，消费者信心良好',
      miss: '成屋销售疲软，高利率抑制需求，房地产行业承压',
      inline: '房市活跃度基本稳定，市场消化高利率环境',
    },
  },
];

export const CATEGORY_LABELS: Record<string, string> = {
  employment: '就业数据',
  inflation: '通胀数据',
  gdp: 'GDP增长率',
  pmi_retail: 'PMI与零售',
  housing: '房地产数据',
};

export const CATEGORY_ICONS: Record<string, string> = {
  employment: '👥',
  inflation: '📈',
  gdp: '🏛️',
  pmi_retail: '🏭',
  housing: '🏠',
};

export function getIndicatorsByCategory(
  category: string
): EconomicIndicator[] {
  return INDICATORS_CONFIG.filter((ind) => ind.category === category);
}

export function getUniqueCategories(): string[] {
  const cats = INDICATORS_CONFIG.map((ind) => ind.category);
  return Array.from(new Set(cats));
}
