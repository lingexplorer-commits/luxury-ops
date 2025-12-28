// ============================================
// Luxury Ops - TypeScript Type Definitions
// ============================================

// === Hotel 酒店主表 ===
export interface Hotel {
  hotel_id: string;
  
  // 基本信息
  name_cn: string;
  name_en: string;
  name_local: string;
  brand: string;
  group: string;
  
  // 目的地板块
  country: string;
  region: string;
  city: string;
  area_tag: string;
  destination_board: string;
  
  // 地理信息
  address_full: string;
  geo_description: string;
  transport_info: string;
  
  // 定位与客群
  positioning_short: string;
  positioning_keywords: string[];
  target_guests: string[];
  style_tags: string[];
  highlights: string[];
  
  // 价格带
  price_tier: 'ultra_luxury' | 'luxury' | 'upper_upscale' | 'upscale';
  price_range_min: number;
  price_range_max: number;
  price_range_typical: number;
  currency: string;
  
  // 渠道优势汇总
  avg_advantage_percent: number;
  advantage_level: AdvantageLevel;
  our_primary_channel: string;
  
  // 关联推荐
  similar_hotels: string[];
  alternative_hotels: string[];
  upgrade_options: string[];
  budget_options: string[];
  
  // 预订特性
  booking_difficulty: 'easy' | 'moderate' | 'hard' | 'very_hard';
  advance_booking_days: number;
  peak_seasons: string[];
  
  // 基础属性
  rooms_count: number;
  opening_year: number;
  renovation_year: number | null;
  checkin_time: string;
  checkout_time: string;
  website: string;
  phone: string;
  email: string;
  
  // 外部链接
  notebooklm_url: string | null;
  official_url: string;
  
  // 状态
  status: '在售' | '暂停' | '只做咨询';
  info_completeness: number;
  
  // 元数据
  created_at: string;
  updated_at: string;
  notes_conflicts: string | null;
}

// === RoomType 房型表 ===
export interface RoomType {
  room_id: string;
  hotel_id: string;
  
  // 名称
  room_name_cn: string;
  room_name_en: string;
  room_name_local: string;
  room_code_internal: string;
  
  // 房型定位
  is_main_selling: boolean;
  is_entry_level: boolean;
  is_signature: boolean;
  recommendation_priority: number;
  
  // 规格
  area_min_sqm: number;
  area_max_sqm: number;
  bed_type: string;
  max_adults: number;
  max_children: number;
  max_occupancy: number;
  
  // 特色
  view_type: string;
  has_balcony: boolean;
  has_onsen: boolean;
  has_living_room: boolean;
  is_connectable: boolean;
  is_smoking: boolean;
  floor_info: string;
  highlights: string[];
  suitable_for: string[];
  
  // 价格基准
  weekday_rate_min: number;
  weekday_rate_max: number;
  weekend_rate_min: number;
  weekend_rate_max: number;
  currency: string;
  rate_note: string;
  
  // 渠道优势汇总
  avg_advantage_percent: number;
  advantage_level: AdvantageLevel;
  is_high_profit: boolean;
  
  // 媒体
  hero_image_url: string;
  gallery_urls: string[];
  floorplan_url: string | null;
  
  // 元数据
  created_at: string;
  updated_at: string;
}

// === DatePriceAvailability 日期价格房态表 ===
export interface DatePriceAvailability {
  id: string;
  hotel_id: string;
  room_type_id: string;
  date: string; // YYYY-MM-DD
  
  // 房态
  availability_status: AvailabilityStatus;
  rooms_left: number | null;
  last_checked_at: string;
  
  // 我们的成本
  our_cost: number | null;
  our_channel: string;
  cost_updated_at: string;
  
  // 公开价格
  public_prices: PublicPrice[];
  lowest_public_price: number;
  lowest_public_channel: string;
  
  // 价格优势
  price_advantage: number;
  price_advantage_percent: number;
  advantage_level: AdvantageLevel;
  
  // 利润计算
  suggested_selling_price: number;
  estimated_profit: number;
  profit_margin_percent: number;
  
  // 出房概率（无房时）
  historical_availability_rate: number | null;
  avg_days_before_release: number | null;
  release_prediction: 'high' | 'medium' | 'low' | 'very_low' | null;
  
  // 特殊标记
  date_tags: DateTag[];
  is_peak_season: boolean;
  is_weekend: boolean;
  is_holiday: boolean;
  is_blackout: boolean;
  is_special_rate: boolean;
  
  // 连住限制
  min_nights: number;
  is_check_in_allowed: boolean;
}

export interface PublicPrice {
  channel: string;
  price: number;
  updated_at: string;
}

export interface DateTag {
  tag_type: DateTagType;
  tag_label: string;
  tag_color: string;
}

export type DateTagType = 
  | 'peak' 
  | 'holiday' 
  | 'weekend' 
  | 'blackout' 
  | 'special' 
  | 'last_few' 
  | 'cherry_blossom' 
  | 'autumn_leaves' 
  | 'new_year' 
  | 'golden_week';

export type AvailabilityStatus = 
  | 'available' 
  | 'unavailable' 
  | 'on_request' 
  | 'last_few' 
  | 'unknown';

export type AdvantageLevel = 
  | 'excellent' 
  | 'good' 
  | 'fair' 
  | 'none';

// === DestinationBoard 目的地板块 ===
export interface DestinationBoard {
  board_id: string;
  name: string;
  country: string;
  region: string;
  description: string;
  
  // 板块特性
  typical_stay_nights: number;
  best_seasons: string[];
  typical_guests: string[];
  
  // 酒店汇总
  hotel_count: number;
  advantage_hotel_count: number;
  
  // 价格范围
  price_range_min: number;
  price_range_max: number;
  avg_advantage_percent: number;
  
  // 排序
  display_order: number;
}

// === HotelCorrelation 酒店关联关系 ===
export interface HotelCorrelation {
  id: string;
  hotel_id_a: string;
  hotel_id_b: string;
  
  correlation_type: CorrelationType;
  correlation_score: number;
  correlation_reason: string;
  is_bidirectional: boolean;
}

export type CorrelationType = 
  | 'style_similar'
  | 'guest_overlap'
  | 'price_similar'
  | 'location_nearby'
  | 'same_brand'
  | 'upgrade_path'
  | 'budget_alternative';

// === Inquiry 客户需求 ===
export interface Inquiry {
  inquiry_id: string;
  
  // 客户信息
  customer_name: string;
  customer_contact: string;
  customer_wechat: string;
  customer_tags: string[];
  
  // 需求信息
  destinations: string[];
  travel_dates: TravelDates;
  travelers: Travelers;
  budget_per_night: Budget;
  
  // 偏好
  style_preferences: string[];
  must_have: string[];
  nice_to_have: string[];
  avoid: string[];
  special_requests: string;
  special_occasion: string | null;
  
  // 推荐记录
  recommended_hotels: RecommendedHotel[];
  
  // 状态
  stage: InquiryStage;
  priority: '普通' | '紧急' | 'VIP';
  source: '微信' | '电话' | '邮件' | '转介绍' | '官网' | '其他';
  
  // 分配
  assigned_to: string;
  
  // 推荐权重配置
  recommendation_weights: RecommendationWeights;
  
  // 元数据
  created_at: string;
  updated_at: string;
  notes: string;
}

export interface TravelDates {
  from: string;
  to: string;
  nights: number;
  flexible: boolean;
  flexible_range: number;
}

export interface Travelers {
  adults: number;
  children: number;
  children_ages: number[];
  infants: number;
}

export interface Budget {
  min: number;
  max: number;
  currency: string;
  flexible: boolean;
}

export interface RecommendedHotel {
  hotel_id: string;
  room_type_id: string | null;
  dates: { from: string; to: string };
  quoted_price: number | null;
  recommended_at: string;
  customer_feedback: CustomerFeedback | null;
  feedback_note: string | null;
}

export type CustomerFeedback = 
  | 'interested' 
  | 'not_interested' 
  | 'considering' 
  | 'booked' 
  | 'pending';

export type InquiryStage = 
  | '需求确认' 
  | '方案推荐' 
  | '等待反馈' 
  | '确认预订' 
  | '订房中' 
  | '已完成' 
  | '已流失' 
  | '已取消';

export interface RecommendationWeights {
  price_advantage: number;
  budget_match: number;
  guest_fit: number;
  availability: number;
  booking_ease: number;
}

// === MonitoringTask 刷房监控任务 ===
export interface MonitoringTask {
  task_id: string;
  
  // 监控目标
  hotel_id: string;
  hotel_name: string;
  room_type_id: string | null;
  room_type_name: string | null;
  date_from: string;
  date_to: string;
  
  // 监控配置
  check_interval_minutes: number;
  data_source: 'ikyu' | 'jalan' | 'official' | 'booking';
  priority: 'high' | 'normal' | 'low';
  
  // 状态
  status: MonitoringStatus;
  
  // 执行统计
  check_count: number;
  success_count: number;
  error_count: number;
  last_check_at: string | null;
  next_check_at: string | null;
  
  // 最后结果
  last_result: MonitoringResult | null;
  
  // 错误信息
  last_error: MonitoringError | null;
  
  // 关联
  related_inquiry_id: string | null;
  auto_booking_rule_id: string | null;
  
  // 通知配置
  notify_on_available: boolean;
  notify_channels: NotifyChannel[];
  
  // 元数据
  created_at: string;
  created_by: string;
  updated_at: string;
}

export type MonitoringStatus = 
  | '未启动' 
  | '监控中' 
  | '已暂停' 
  | '有房' 
  | '无房' 
  | '异常' 
  | '已完成';

export interface MonitoringResult {
  status: 'available' | 'unavailable' | 'error';
  price: number | null;
  rooms_left: number | null;
  checked_at: string;
}

export interface MonitoringError {
  code: string;
  message: string;
  timestamp: string;
}

export type NotifyChannel = 'system' | 'wechat' | 'email';

// === AutoBookingRule 自动订房规则 ===
export interface AutoBookingRule {
  rule_id: string;
  name: string;
  
  // 触发条件
  hotel_id: string;
  hotel_name: string;
  room_types: string[] | null;
  date_range: { from: string; to: string } | null;
  
  trigger_type: 'availability' | 'price_threshold' | 'availability_and_price';
  trigger_config: TriggerConfig;
  
  // 执行动作
  action_mode: '自动下单' | '生成草稿' | '仅通知';
  
  // 状态
  enabled: boolean;
  
  // 统计
  trigger_count: number;
  last_triggered_at: string | null;
  success_count: number;
  
  // 关联
  monitoring_task_ids: string[];
  inquiry_id: string | null;
  
  // 元数据
  created_at: string;
  created_by: string;
}

export interface TriggerConfig {
  price_max?: number;
  min_rooms?: number;
}

// === RecommendationScore 推荐评分 ===
export interface RecommendationScore {
  id: string;
  hotel_id: string;
  room_type_id: string | null;
  inquiry_id: string | null;
  dates: { from: string; to: string };
  
  // 各维度得分
  scores: ScoreBreakdown;
  
  // 权重
  weights: RecommendationWeights;
  
  // 综合得分
  total_score: number;
  
  // 标签
  tags: RecommendationTag[];
  
  // 推荐等级
  recommendation_level: RecommendationLevel;
  
  // 汇总数据
  summary: PriceSummary | null;
  
  calculated_at: string;
}

export interface ScoreBreakdown {
  price_advantage: number;
  budget_match: number;
  guest_fit: number;
  availability: number;
  booking_ease: number;
}

export interface PriceSummary {
  total_nights: number;
  available_nights: number;
  needs_monitoring_nights: number;
  unavailable_nights: number;
  total_cost: number;
  total_public_price: number;
  total_advantage: number;
  suggested_total_price: number;
  estimated_total_profit: number;
}

export interface RecommendationTag {
  tag_id: string;
  tag_type: RecommendationTagType;
  tag_label: string;
  tag_color: TagColor;
  score_contribution: number;
  priority: number;
}

export type RecommendationTagType = 
  | 'price_advantage' 
  | 'high_profit' 
  | 'budget_match' 
  | 'guest_fit' 
  | 'availability' 
  | 'booking_ease' 
  | 'warning';

export type TagColor = 
  | 'gold' 
  | 'green' 
  | 'blue' 
  | 'purple' 
  | 'yellow' 
  | 'red' 
  | 'gray';

export type RecommendationLevel = 
  | 'top_pick' 
  | 'recommended' 
  | 'alternative' 
  | 'not_recommended';

// === Policy 政策表 ===
export interface Policy {
  hotel_id: string;
  
  // 儿童政策
  children_policy: string;
  free_child_age_max: number;
  child_charge_rules: string;
  babycot_available: boolean;
  babycot_fee: string;
  share_bed_policy: string;
  
  // 加床
  extra_bed_available: boolean;
  extra_bed_fee: string;
  
  // 早餐
  breakfast_included_adult: boolean;
  adult_breakfast_price: string;
  child_breakfast_policy: string;
  
  // 其他
  smoking_policy: string;
  pet_policy: string;
  cancellation_policy: string;
  deposit_policy: string;
  other_policies: string;
  
  notes_conflicts: string | null;
  updated_at: string;
}

// === Facility 设施表 ===
export interface Facility {
  hotel_id: string;
  
  restaurants_and_bars: Restaurant[];
  spa: SpaInfo | null;
  pool: PoolInfo | null;
  gym: GymInfo | null;
  kids_club: KidsClubInfo | null;
  
  parking: string;
  shuttle_service: string;
  concierge_services: string[];
  other_facilities: string[];
  
  updated_at: string;
}

export interface Restaurant {
  name: string;
  type: string;
  cuisine: string;
  hours: string;
  reservation_required: boolean;
}

export interface SpaInfo {
  name: string;
  treatments: string[];
  hours: string;
  reservation_required: boolean;
}

export interface PoolInfo {
  type: string;
  hours: string;
  heated: boolean;
}

export interface GymInfo {
  hours: string;
  equipment: string[];
}

export interface KidsClubInfo {
  age_range: string;
  hours: string;
  activities: string[];
}

// === Activity 活动体验表 ===
export interface Activity {
  activity_id: string;
  hotel_id: string;
  
  name: string;
  type: 'Wellness' | 'Culture' | 'Kids' | 'Outdoor' | 'Dining' | 'Other';
  description: string;
  
  is_free: boolean;
  price_info: string | null;
  
  is_seasonal: boolean;
  season_from: string | null;
  season_to: string | null;
  season_note: string | null;
  
  target_guests: string[];
  reservation_required: boolean;
  advance_booking_days: number | null;
  
  duration: string;
  schedule: string;
  
  highlights: string[];
}

// === SpecialOffer 优惠活动表 ===
export interface SpecialOffer {
  offer_id: string;
  hotel_id: string;
  
  offer_name: string;
  offer_type: '连住优惠' | '早鸟' | '节日套餐' | '蜜月' | '家庭' | '长住' | '其他';
  description: string;
  included_benefits: string[];
  
  // 有效期
  valid_from: string;
  valid_to: string;
  booking_deadline: string | null;
  
  // 适用范围
  applicable_room_types: string[] | null;
  min_nights: number;
  blackout_dates: string[];
  
  // 价格
  price_info: string;
  discount_percent: number | null;
  
  // 状态
  status: '有效' | '即将开始' | '即将到期' | '已过期' | '待确认';
  
  // 来源
  source_url: string | null;
  terms: string;
  
  created_at: string;
  updated_at: string;
}

// === SystemLog 系统日志 ===
export interface SystemLog {
  log_id: string;
  timestamp: string;
  
  level: 'info' | 'warning' | 'error' | 'success';
  category: 'monitoring' | 'booking' | 'sync' | 'price' | 'system';
  
  message: string;
  details: Record<string, unknown>;
  
  // 关联
  related_hotel_id: string | null;
  related_task_id: string | null;
  related_inquiry_id: string | null;
  
  // 操作人
  actor: 'system' | string;
}

// === UI Helper Types ===
export interface HotelCardData {
  hotel: Hotel;
  score?: RecommendationScore;
  availabilityPreview?: DatePriceAvailability[];
}

export interface CalendarCellData {
  date: string;
  dateInfo: DatePriceAvailability;
  isSelected?: boolean;
  isInRange?: boolean;
}

// === Constants ===
export const ADVANTAGE_THRESHOLDS = {
  excellent: 25,
  good: 15,
  fair: 10,
} as const;

export const DEFAULT_RECOMMENDATION_WEIGHTS: RecommendationWeights = {
  price_advantage: 0.25,
  budget_match: 0.25,
  guest_fit: 0.20,
  availability: 0.20,
  booking_ease: 0.10,
};
