export interface JourneyTouchpoint {
  channel: string;
  type: string;
}

export interface JourneyPainPoint {
  id: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  evidence?: string;
}

export interface JourneyOpportunity {
  id: string;
  name: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
}

export interface JourneyPhase {
  id: string;
  name: string;
  description: string;
  actor: string;
  touchpoints: JourneyTouchpoint[];
  actions: string[];
  thoughts: string[];
  emotion: 'very-positive' | 'positive' | 'neutral' | 'negative' | 'very-negative';
  emotionIntensity: number;
  tool?: string;
  timeEstimate?: string;
  painPoints: JourneyPainPoint[];
  opportunities: JourneyOpportunity[];
  order: number;
}

export interface MomentOfTruth {
  phase: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface CustomerJourney {
  id: string;
  name: string;
  type: 'current_state' | 'future_state';
  persona?: string;
  phases: JourneyPhase[];
  momentsOfTruth?: MomentOfTruth[];
  lastModified: string;
  notes: string;
}
