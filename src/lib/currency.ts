// ============================================
// Luxury Ops - Currency & Exchange Rate System
// ============================================

// 支持的货币类型
export type CurrencyCode = 'CNY' | 'JPY' | 'USD' | 'EUR' | 'HKD' | 'THB';

// 货币信息
export interface CurrencyInfo {
    code: CurrencyCode;
    name_cn: string;
    symbol: string;
    rate_to_cny: number; // 1单位该货币 = 多少人民币
}

// 汇率配置 (可后台维护)
export const currencies: Record<CurrencyCode, CurrencyInfo> = {
    CNY: {
        code: 'CNY',
        name_cn: '人民币',
        symbol: '¥',
        rate_to_cny: 1,
    },
    JPY: {
        code: 'JPY',
        name_cn: '日元',
        symbol: '¥',
        rate_to_cny: 0.048, // 1日元 = 0.048人民币
    },
    USD: {
        code: 'USD',
        name_cn: '美元',
        symbol: '$',
        rate_to_cny: 7.24,
    },
    EUR: {
        code: 'EUR',
        name_cn: '欧元',
        symbol: '€',
        rate_to_cny: 7.85,
    },
    HKD: {
        code: 'HKD',
        name_cn: '港币',
        symbol: 'HK$',
        rate_to_cny: 0.93,
    },
    THB: {
        code: 'THB',
        name_cn: '泰铢',
        symbol: '฿',
        rate_to_cny: 0.21,
    },
};

// 汇率更新时间
export const exchangeRateLastUpdate = '2024-12-29';

// ============================================
// 货币转换函数
// ============================================

/**
 * 将任意货币转换为人民币
 */
export function toCNY(amount: number, fromCurrency: CurrencyCode): number {
    const currency = currencies[fromCurrency];
    return Math.round(amount * currency.rate_to_cny);
}

/**
 * 将人民币转换为任意货币
 */
export function fromCNY(amountCNY: number, toCurrency: CurrencyCode): number {
    const currency = currencies[toCurrency];
    return Math.round(amountCNY / currency.rate_to_cny);
}

/**
 * 格式化金额显示 (人民币)
 */
export function formatCNY(amount: number): string {
    if (amount >= 10000) {
        return `¥${(amount / 10000).toFixed(1)}万`;
    }
    return `¥${amount.toLocaleString()}`;
}

/**
 * 格式化金额显示 (带K单位)
 */
export function formatPriceK(amount: number): string {
    return `¥${(amount / 1000).toFixed(0)}K`;
}

/**
 * 格式化原币种金额
 */
export function formatOriginalCurrency(amount: number, currency: CurrencyCode): string {
    const info = currencies[currency];
    if (currency === 'JPY') {
        // 日元用K表示
        return `${info.symbol}${(amount / 1000).toFixed(0)}K`;
    }
    return `${info.symbol}${amount.toLocaleString()}`;
}

// ============================================
// 价格调整类型
// ============================================

export type PriceAdjustmentType = 'markup_percent' | 'fixed_amount';

export interface PriceAdjustment {
    type: PriceAdjustmentType;
    value: number; // 百分比时为正负数，固定金额时为人民币金额
}

/**
 * 计算调整后的价格
 */
export function applyPriceAdjustment(costCNY: number, adjustment: PriceAdjustment): number {
    if (adjustment.type === 'markup_percent') {
        return Math.round(costCNY * (1 + adjustment.value / 100));
    } else {
        // 固定金额：成本 + 固定利润
        return costCNY + adjustment.value;
    }
}

// ============================================
// 默认配置
// ============================================

// 默认加价预设
export const MARKUP_PRESETS = [
    { label: '成本价', value: 0 },
    { label: '-5%', value: -5 },
    { label: '+10%', value: 10 },
    { label: '+15%', value: 15 },
    { label: '+20%', value: 20 },
    { label: '+25%', value: 25 },
];
