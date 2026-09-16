'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, 
  BarChart2, 
  PieChart as PieIcon, 
  GitCommit, 
  Table as TableIcon,
  Info,
  Eye,
  CheckCircle2,
  Maximize2
} from 'lucide-react';

export type Task1ChartType = 'line' | 'bar' | 'pie' | 'process' | 'table';

export interface Task1PromptData {
  id: string;
  type: Task1ChartType;
  title: string;
  category: string;
  timeLimit: number;
  minWords: number;
  prompt: string;
  keyFeatures: string[];
  vocabularyTips: string[];
  modelAnswer: string;
}

export const TASK1_PROMPTS: Task1PromptData[] = [
  {
    id: 'line-smart-devices',
    type: 'line',
    title: 'Smart Home Device Adoption (2018–2023)',
    category: 'Time Series / Trend Analysis',
    timeLimit: 20,
    minWords: 150,
    prompt: 'The line graph below illustrates the percentage of households across five distinct income brackets that installed smart home automation devices in the United Kingdom between 2018 and 2023.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    keyFeatures: [
      'Universal upward trajectory across all income brackets over the 5-year period.',
      'High-income tier consistently registered the highest adoption (34% in 2018 to 71% in 2023).',
      'Low-income households displayed the steepest relative surge (quadrupled from 4% to 16%).',
      'Convergence of Upper-Middle and High tiers post-2021.'
    ],
    vocabularyTips: [
      'experienced a ubiquitous upward trajectory',
      'in stark contradistinction to',
      'quadrupled over the five-year timeframe',
      'culminating in a peak value of',
      'steadily outpaced'
    ],
    modelAnswer: `The line graph delineates the proportion of households across five distinct income brackets that incorporated smart home automation systems in the United Kingdom between 2018 and 2023.

Overall, it is immediately apparent that smart device adoption experienced a ubiquitous upward trajectory across all surveyed demographics over the five-year timeframe. Furthermore, higher-income households consistently maintained the highest penetration rates, whereas lower-income cohorts exhibited the most pronounced relative rate of acceleration.

In 2018, adoption rates among the top income tier stood at approximately 34%, in stark contradistinction to the lowest bracket, which registered a modest 4%. Over the subsequent triennium, ownership among upper-middle and top earners expanded steadily, culminating in peak values of 62% and 71% respectively by 2023.

Conversely, lower-income households demonstrated a gradual initial uptake before surging rapidly post-2020. By 2023, penetration within the lowest demographic had quadrupled to reach 16%, while the middle-income bracket settled at 48%, up from 18% at the beginning of the period.`
  },
  {
    id: 'bar-renewable-energy',
    type: 'bar',
    title: 'Renewable Electricity Generation by Country (2020 vs 2024)',
    category: 'Comparative Grouped Bar Chart',
    timeLimit: 20,
    minWords: 150,
    prompt: 'The bar chart compares the percentage share of electricity generated from renewable sources (Wind, Solar, Hydro) in five European nations in 2020 and 2024.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    keyFeatures: [
      'Norway led all nations by a wide margin in both years (>85%).',
      'Germany and Spain recorded substantial 12–15% expansions in renewable share.',
      'Solar & wind installations drove the majority of growth across Germany and the UK.',
      'All five nations experienced net positive increases over the 4-year span.'
    ],
    vocabularyTips: [
      'constituted the dominant contributor',
      'registered a noticeable surge of',
      'outstripped fossil fuel reliance',
      'marginal increase compared to',
      'hovered around'
    ],
    modelAnswer: `The bar chart provides a comparative breakdown of the proportion of electricity produced via renewable energy sources across five European countries in 2020 and 2024.

Overall, all surveyed nations experienced an increase in their renewable energy shares over the four-year period. Norway maintained an overwhelming dominance in renewable output throughout, whereas Germany and the United Kingdom recorded the most substantial proportional advancements.

In 2020, Norway generated approximately 88% of its power from renewables, which edged upwards to 94% in 2024. In comparison, Germany and Spain registered moderate initial figures of 44% and 38% respectively. By 2024, German renewable generation had expanded by 14 percentage points to reach 58%, while Spain climbed to 51%.

The United Kingdom and France demonstrated lower initial contributions at 35% and 22% in 2020. However, the UK witnessed a dramatic escalation to 49% by 2024, nearly doubling France's modest rise to 27%.`
  },
  {
    id: 'pie-water-consumption',
    type: 'pie',
    title: 'Global Water Consumption by Sector (1990 vs 2020)',
    category: 'Proportional Distribution (Dual Pie)',
    timeLimit: 20,
    minWords: 150,
    prompt: 'The two pie charts illustrate the distribution of global freshwater consumption across three key sectors—Agriculture, Industry, and Domestic Use—in 1990 and 2020.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    keyFeatures: [
      'Agriculture remained the single largest consumer of freshwater in both years (>60%).',
      'Industrial water consumption witnessed a sharp rise from 20% to 28%.',
      'Domestic allocation contracted slightly in percentage share from 15% to 10%.',
      'Agricultural share decreased from 65% to 62% despite overall volume growth.'
    ],
    vocabularyTips: [
      'accounted for the lion\'s share',
      'constituted approximately',
      'a slight contraction in proportional terms',
      'the second most demanding sector',
      'remained predominantly allocated to'
    ],
    modelAnswer: `The pie charts delineate the global distribution of freshwater consumption across three primary sectors—Agriculture, Industry, and Domestic usage—in 1990 and 2020.

Overall, agriculture consistently represented the preeminent consumer of freshwater resources in both years, accounting for more than half of all usage. Meanwhile, industrial consumption witnessed the most substantial relative expansion, whereas domestic demand experienced a modest contraction.

In 1990, agricultural activities accounted for the lion's share of global water usage at 65%. Although this figure decreased slightly to 62% by 2020, farming remained by far the most water-intensive sector.

In stark contrast, industrial water requirements underwent noticeable growth, escalating from 20% in 1990 to 28% three decades later. Conversely, municipal domestic water usage declined by 5 percentage points, falling from 15% in 1990 to 10% in 2020.`
  },
  {
    id: 'process-hydroelectric',
    type: 'process',
    title: 'Hydroelectric Power Generation Cycle',
    category: 'Technical Flowchart & Stage Process',
    timeLimit: 20,
    minWords: 150,
    prompt: 'The diagram illustrates the process by which electricity is generated in a pumped-storage hydroelectric power station.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    keyFeatures: [
      'Linear two-phase cycle: Daytime power generation vs Night-time water pumping.',
      'High-level reservoir water passes through penstock intake tubes into turbines.',
      'Turbine rotation drives electromagnetic generator producing electricity sent to national grid.',
      'Reversible pump mechanism returns water from low-level reservoir back upstream during off-peak hours.'
    ],
    vocabularyTips: [
      'is channelled through penstock pipes',
      'kinetic energy is converted into electrical current',
      'the subsequent stage involves',
      'during off-peak nocturnal periods',
      'recirculated back to the upper storage reservoir'
    ],
    modelAnswer: `The schematic diagram illustrates the sequential operation of a pumped-storage hydroelectric plant designed to generate electricity during peak demand and replenish water storage during off-peak hours.

Overall, the process comprises two distinct cyclical stages: a power-generation phase during daytime peak hours and a water-recirculation phase during off-peak nocturnal periods.

In the initial generation phase, water retained in an elevated reservoir is released through an intake gate and directed downwards through high-pressure penstock tunnels. The immense gravitational flow drives high-velocity turbine impellers situated in the powerhouse. These turbines rotate an electromagnetic generator, converting kinetic energy into alternating electric current, which is subsequently stepped up by transformers and transmitted to the national power grid.

Following power generation, water exits into a lower reservoir. During the second phase at night, when grid demand and electricity costs subside, the system operates in reverse. The turbines function as electric pumps, drawing water from the lower basin back up through the penstocks to replenish the primary reservoir for the subsequent daily cycle.`
  },
  {
    id: 'table-commute-modes',
    type: 'table',
    title: 'Daily Commuting Modes in Five Metropolises (2024)',
    category: 'Statistical Data Matrix',
    timeLimit: 20,
    minWords: 150,
    prompt: 'The table shows the percentage breakdown of daily commuter journeys across five major metropolitan cities according to four transit modes: Private Car, Rail/Metro, Bus, and Active Transport (Bicycle/Walking).\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    keyFeatures: [
      'Tokyo registered the highest Rail/Metro dependence (58%) and lowest Private Car usage (14%).',
      'Los Angeles was heavily car-dominant with 72% private vehicle journeys.',
      'Amsterdam outperformed all cities in Active Transport (Cycling & Walking at 42%).',
      'Bus transit was most prevalent in London (24%) compared to single digits elsewhere.'
    ],
    vocabularyTips: [
      'exhibited the most pronounced reliance on',
      'in stark contrast to',
      'surpassed all other metropolitan areas',
      'marginal proportion of commuters',
      'represented the secondary mode of transit'
    ],
    modelAnswer: `The table compares modal split data for daily commuting journeys across five global metropolises (Tokyo, London, New York, Amsterdam, and Los Angeles) across four transportation categories in 2024.

Overall, commuter habits diverge substantially among the cities. Tokyo and Amsterdam exhibit high dependence on mass rail and active travel respectively, whereas Los Angeles remains overwhelmingly reliant on private vehicular transit.

In Tokyo, rail and metro transit accounted for nearly six in ten journeys (58%), whereas private automobiles constituted merely 14%. Conversely, Los Angeles presented an inverted pattern: private cars dominated transit with 72%, while metro usage languished at just 9%.

Amsterdam distinguished itself through sustainable mobility, with active transportation (cycling and walking) representing 42% of daily trips—far exceeding all other surveyed cities. Meanwhile, London demonstrated the most balanced transit distribution, comprising 40% rail, 24% bus, 21% car, and 15% active travel.`
  }
];

interface Task1ChartRendererProps {
  promptData: Task1PromptData;
  showKeyFeatures?: boolean;
  onToggleKeyFeatures?: () => void;
}

export const Task1ChartRenderer: React.FC<Task1ChartRendererProps> = ({
  promptData,
  showKeyFeatures = false,
  onToggleKeyFeatures,
}) => {
  const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chart' | 'data' | 'features'>('chart');

  // Render Line Graph
  const renderLineGraph = () => {
    return (
      <div className="relative w-full bg-slate-900 text-white rounded-2xl p-6 shadow-inner overflow-hidden">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#027FFF] bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              Figure 1.1 • UK Household Adoption (%)
            </span>
            <h4 className="text-sm font-bold text-white mt-1">Smart Device Adoption Rates (2018–2023)</h4>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Interactive SVG
          </div>
        </div>

        {/* SVG Chart */}
        <div className="relative w-full aspect-[16/9] min-h-[260px] max-h-[320px]">
          <svg viewBox="0 0 600 300" className="w-full h-full">
            {/* Grid lines */}
            <line x1="60" y1="40" x2="560" y2="40" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
            <line x1="60" y1="95" x2="560" y2="95" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
            <line x1="60" y1="150" x2="560" y2="150" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
            <line x1="60" y1="205" x2="560" y2="205" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
            <line x1="60" y1="260" x2="560" y2="260" stroke="#64748B" strokeWidth="1.5" />

            {/* Y Axis Labels */}
            <text x="45" y="45" fill="#94A3B8" fontSize="11" textAnchor="end">80%</text>
            <text x="45" y="100" fill="#94A3B8" fontSize="11" textAnchor="end">60%</text>
            <text x="45" y="155" fill="#94A3B8" fontSize="11" textAnchor="end">40%</text>
            <text x="45" y="210" fill="#94A3B8" fontSize="11" textAnchor="end">20%</text>
            <text x="45" y="265" fill="#94A3B8" fontSize="11" textAnchor="end">0%</text>

            {/* X Axis Years (2018 to 2023) */}
            <text x="80" y="282" fill="#94A3B8" fontSize="11" textAnchor="middle">2018</text>
            <text x="170" y="282" fill="#94A3B8" fontSize="11" textAnchor="middle">2019</text>
            <text x="260" y="282" fill="#94A3B8" fontSize="11" textAnchor="middle">2020</text>
            <text x="350" y="282" fill="#94A3B8" fontSize="11" textAnchor="middle">2021</text>
            <text x="440" y="282" fill="#94A3B8" fontSize="11" textAnchor="middle">2022</text>
            <text x="530" y="282" fill="#94A3B8" fontSize="11" textAnchor="middle">2023</text>

            {/* Line 1: High Income (>£75k) - Blue */}
            <path
              d="M 80 166 L 170 144 L 260 117 L 350 90 L 440 73 L 530 65"
              fill="none"
              stroke="#027FFF"
              strokeWidth={hoveredSeries === 'high' ? '4' : '2.5'}
              className="transition-all cursor-pointer"
              onMouseEnter={() => setHoveredSeries('high')}
              onMouseLeave={() => setHoveredSeries(null)}
            />
            {/* Dots */}
            {[[80, 166, '34%'], [170, 144, '42%'], [260, 117, '52%'], [350, 90, '62%'], [440, 73, '68%'], [530, 65, '71%']].map(([x, y, val], idx) => (
              <g key={idx} className="cursor-pointer group">
                <circle cx={x} cy={y} r="4" fill="#027FFF" stroke="#FFFFFF" strokeWidth="1.5" />
                <text x={x} y={Number(y) - 8} fill="#60A5FA" fontSize="9" fontWeight="bold" textAnchor="middle" className="opacity-80">
                  {val}
                </text>
              </g>
            ))}

            {/* Line 2: Upper Middle (£50k-£75k) - Purple */}
            <path
              d="M 80 194 L 170 178 L 260 148 L 350 120 L 440 98 L 530 89"
              fill="none"
              stroke="#A855F7"
              strokeWidth={hoveredSeries === 'upmid' ? '4' : '2.5'}
              className="transition-all cursor-pointer"
              onMouseEnter={() => setHoveredSeries('upmid')}
              onMouseLeave={() => setHoveredSeries(null)}
            />
            {[[80, 194, '24%'], [170, 178, '30%'], [260, 148, '41%'], [350, 120, '51%'], [440, 98, '59%'], [530, 89, '62%']].map(([x, y, val], idx) => (
              <circle key={idx} cx={x} cy={y} r="3.5" fill="#A855F7" stroke="#FFFFFF" strokeWidth="1.5" />
            ))}

            {/* Line 3: Middle (£30k-£50k) - Emerald */}
            <path
              d="M 80 210 L 170 197 L 260 175 L 350 153 L 440 137 L 530 128"
              fill="none"
              stroke="#10B981"
              strokeWidth={hoveredSeries === 'mid' ? '4' : '2.5'}
              className="transition-all cursor-pointer"
              onMouseEnter={() => setHoveredSeries('mid')}
              onMouseLeave={() => setHoveredSeries(null)}
            />

            {/* Line 4: Low Income (<£20k) - Amber */}
            <path
              d="M 80 249 L 170 244 L 260 238 L 350 227 L 440 220 L 530 216"
              fill="none"
              stroke="#F59E0B"
              strokeWidth={hoveredSeries === 'low' ? '4' : '2.5'}
              className="transition-all cursor-pointer"
              onMouseEnter={() => setHoveredSeries('low')}
              onMouseLeave={() => setHoveredSeries(null)}
            />
            {[[80, 249, '4%'], [530, 216, '16%']].map(([x, y, val], idx) => (
              <g key={idx}>
                <circle cx={x} cy={y} r="4" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.5" />
                <text x={x} y={Number(y) - 7} fill="#FCD34D" fontSize="9" fontWeight="bold" textAnchor="middle">
                  {val}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800 text-xs">
          <div 
            onMouseEnter={() => setHoveredSeries('high')}
            onMouseLeave={() => setHoveredSeries(null)}
            className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-all ${hoveredSeries === 'high' ? 'bg-blue-500/20 text-blue-300' : 'text-slate-400'}`}
          >
            <span className="w-3 h-3 rounded-full bg-[#027FFF]" />
            <span className="font-semibold truncate">High (&gt;£75k)</span>
          </div>
          <div 
            onMouseEnter={() => setHoveredSeries('upmid')}
            onMouseLeave={() => setHoveredSeries(null)}
            className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-all ${hoveredSeries === 'upmid' ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400'}`}
          >
            <span className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="font-semibold truncate">Upper-Mid (£50-75k)</span>
          </div>
          <div 
            onMouseEnter={() => setHoveredSeries('mid')}
            onMouseLeave={() => setHoveredSeries(null)}
            className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-all ${hoveredSeries === 'mid' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'}`}
          >
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="font-semibold truncate">Mid (£30-50k)</span>
          </div>
          <div 
            onMouseEnter={() => setHoveredSeries('low')}
            onMouseLeave={() => setHoveredSeries(null)}
            className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-all ${hoveredSeries === 'low' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'}`}
          >
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="font-semibold truncate">Low (&lt;£20k)</span>
          </div>
        </div>
      </div>
    );
  };

  // Render Bar Chart
  const renderBarChart = () => {
    const countries = [
      { name: 'Norway', v2020: 88, v2024: 94 },
      { name: 'Germany', v2020: 44, v2024: 58 },
      { name: 'Spain', v2020: 38, v2024: 51 },
      { name: 'UK', v2020: 35, v2024: 49 },
      { name: 'France', v2020: 22, v2024: 27 },
    ];

    return (
      <div className="relative w-full bg-slate-900 text-white rounded-2xl p-6 shadow-inner">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Figure 1.2 • Renewable Generation (% of Total)
            </span>
            <h4 className="text-sm font-bold text-white mt-1">Renewable Share by Country (2020 vs 2024)</h4>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-3 h-3 rounded bg-slate-500" /> 2020
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-3 h-3 rounded bg-emerald-500" /> 2024
            </span>
          </div>
        </div>

        <div className="space-y-4 my-2">
          {countries.map((c, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-200">{c.name}</span>
                <span className="text-slate-400 font-mono">
                  {c.v2020}% <span className="text-slate-600">→</span> <span className="text-emerald-400">{c.v2024}% (+{c.v2024 - c.v2020}%)</span>
                </span>
              </div>
              <div className="flex flex-col gap-1">
                {/* 2020 Bar */}
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-slate-500 rounded-full transition-all duration-500" 
                    style={{ width: `${c.v2020}%` }}
                    title={`2020: ${c.v2020}%`}
                  />
                </div>
                {/* 2024 Bar */}
                <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 shadow-lg shadow-emerald-500/30" 
                    style={{ width: `${c.v2024}%` }}
                    title={`2024: ${c.v2024}%`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render Dual Pie Chart
  const renderPieChart = () => {
    return (
      <div className="relative w-full bg-slate-900 text-white rounded-2xl p-6 shadow-inner">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              Figure 1.3 • Global Freshwater Split
            </span>
            <h4 className="text-sm font-bold text-white mt-1">Water Consumption by Sector (1990 vs 2020)</h4>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-2">
          {/* Pie 1: 1990 */}
          <div className="flex flex-col items-center bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
            <span className="text-xs font-black uppercase text-slate-400 mb-3">1990 Distribution</span>
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {/* Agriculture 65% (0 to 65%) */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3B82F6" strokeWidth="20" strokeDasharray="163.36 251.32" strokeDashoffset="0" />
                {/* Industry 20% (65 to 85%) */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F59E0B" strokeWidth="20" strokeDasharray="50.26 251.32" strokeDashoffset="-163.36" />
                {/* Domestic 15% (85 to 100%) */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10B981" strokeWidth="20" strokeDasharray="37.7 251.32" strokeDashoffset="-213.62" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-bold text-slate-400">Total</span>
                <span className="text-sm font-black text-white">100%</span>
              </div>
            </div>
            <div className="text-[11px] font-bold space-y-1 mt-3 w-full">
              <div className="flex justify-between text-blue-400"><span>🌾 Agriculture</span><span>65%</span></div>
              <div className="flex justify-between text-amber-400"><span>🏭 Industry</span><span>20%</span></div>
              <div className="flex justify-between text-emerald-400"><span>🏠 Domestic</span><span>15%</span></div>
            </div>
          </div>

          {/* Pie 2: 2020 */}
          <div className="flex flex-col items-center bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
            <span className="text-xs font-black uppercase text-emerald-400 mb-3">2020 Distribution</span>
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {/* Agriculture 62% */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3B82F6" strokeWidth="20" strokeDasharray="155.8 251.32" strokeDashoffset="0" />
                {/* Industry 28% */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F59E0B" strokeWidth="20" strokeDasharray="70.37 251.32" strokeDashoffset="-155.8" />
                {/* Domestic 10% */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10B981" strokeWidth="20" strokeDasharray="25.13 251.32" strokeDashoffset="-226.17" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-bold text-slate-400">Total</span>
                <span className="text-sm font-black text-emerald-400">100%</span>
              </div>
            </div>
            <div className="text-[11px] font-bold space-y-1 mt-3 w-full">
              <div className="flex justify-between text-blue-400"><span>🌾 Agriculture</span><span>62% (-3%)</span></div>
              <div className="flex justify-between text-amber-400"><span>🏭 Industry</span><span>28% (+8%)</span></div>
              <div className="flex justify-between text-emerald-400"><span>🏠 Domestic</span><span>10% (-5%)</span></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Process Flowchart Diagram
  const renderProcessDiagram = () => {
    const steps = [
      { num: '1', title: 'Upper Reservoir', desc: 'Water stored at high elevation during daytime.', badge: 'Input' },
      { num: '2', title: 'Penstock Gate', desc: 'Gravity channels high-pressure water downhill.', badge: 'Flow' },
      { num: '3', title: 'Turbine & Generator', desc: 'Kinetic energy converts to electric current.', badge: 'Generation' },
      { num: '4', title: 'National Grid', desc: 'Electricity transmitted to consumers & industry.', badge: 'Output' },
      { num: '5', title: 'Reversible Pumping', desc: 'Off-peak power pumps water back upstream at night.', badge: 'Recycle' },
    ];

    return (
      <div className="relative w-full bg-slate-900 text-white rounded-2xl p-6 shadow-inner">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              Figure 1.4 • Technical Process Flowchart
            </span>
            <h4 className="text-sm font-bold text-white mt-1">Pumped-Storage Hydroelectric Cycle</h4>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 my-2">
          {steps.map((s, idx) => (
            <div key={idx} className="relative bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80 flex flex-col justify-between hover:border-cyan-500 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-black text-xs flex items-center justify-center border border-cyan-500/30">
                    {s.num}
                  </span>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                    {s.badge}
                  </span>
                </div>
                <h5 className="text-xs font-bold text-white mb-1">{s.title}</h5>
                <p className="text-[11px] text-slate-400 leading-snug">{s.desc}</p>
              </div>
              {idx < steps.length - 1 && (
                <div className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 text-cyan-400 font-bold z-10 text-xs">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-[11px] text-cyan-200 flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span><strong>Key Process Loop:</strong> Step 1–4 runs during daytime generation; Step 5 recirculates water back to Step 1 during nocturnal off-peak hours.</span>
        </div>
      </div>
    );
  };

  // Render Table Matrix
  const renderTable = () => {
    const data = [
      { city: 'Tokyo', car: '14%', rail: '58%', bus: '8%', active: '20%' },
      { city: 'London', car: '21%', rail: '40%', bus: '24%', active: '15%' },
      { city: 'New York', car: '27%', rail: '46%', bus: '12%', active: '15%' },
      { city: 'Amsterdam', car: '22%', rail: '26%', bus: '10%', active: '42%' },
      { city: 'Los Angeles', car: '72%', rail: '9%', bus: '11%', active: '8%' },
    ];

    return (
      <div className="relative w-full bg-slate-900 text-white rounded-2xl p-6 shadow-inner">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Figure 1.5 • Statistical Transit Data
            </span>
            <h4 className="text-sm font-bold text-white mt-1">Commuting Modal Split by City (2024)</h4>
          </div>
        </div>

        <div className="overflow-x-auto my-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-extrabold">
                <th className="py-2.5 px-3">City</th>
                <th className="py-2.5 px-3 text-blue-400">🚗 Private Car</th>
                <th className="py-2.5 px-3 text-purple-400">🚆 Rail / Metro</th>
                <th className="py-2.5 px-3 text-amber-400">🚌 Bus</th>
                <th className="py-2.5 px-3 text-emerald-400">🚲 Active (Walk/Cycle)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-white">{row.city}</td>
                  <td className={`py-2.5 px-3 ${row.city === 'Los Angeles' ? 'text-amber-400 font-bold bg-amber-500/10 rounded' : 'text-slate-300'}`}>
                    {row.car}
                  </td>
                  <td className={`py-2.5 px-3 ${row.city === 'Tokyo' ? 'text-purple-400 font-bold bg-purple-500/10 rounded' : 'text-slate-300'}`}>
                    {row.rail}
                  </td>
                  <td className={`py-2.5 px-3 ${row.city === 'London' ? 'text-blue-400 font-bold bg-blue-500/10 rounded' : 'text-slate-300'}`}>
                    {row.bus}
                  </td>
                  <td className={`py-2.5 px-3 ${row.city === 'Amsterdam' ? 'text-emerald-400 font-bold bg-emerald-500/10 rounded' : 'text-slate-300'}`}>
                    {row.active}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const getChartIcon = (type: Task1ChartType) => {
    switch (type) {
      case 'line': return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'bar': return <BarChart2 className="w-4 h-4 text-emerald-500" />;
      case 'pie': return <PieIcon className="w-4 h-4 text-purple-500" />;
      case 'process': return <GitCommit className="w-4 h-4 text-cyan-500" />;
      case 'table': return <TableIcon className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 lg:p-6 shadow-sm flex flex-col gap-4">
      {/* Header with Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 border border-blue-200">
            {getChartIcon(promptData.type)}
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#027FFF]">
              Official Task 1 Visual
            </span>
            <h3 className="text-base font-extrabold text-slate-900 leading-tight">
              {promptData.title}
            </h3>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('chart')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'chart' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Chart View
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'features' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Key Trends ({promptData.keyFeatures.length})
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'data' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Lexicon Tips
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'chart' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {promptData.type === 'line' && renderLineGraph()}
          {promptData.type === 'bar' && renderBarChart()}
          {promptData.type === 'pie' && renderPieChart()}
          {promptData.type === 'process' && renderProcessDiagram()}
          {promptData.type === 'table' && renderTable()}

          {/* Quick Key Feature Toggle Banner */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50/60 border border-blue-200/70 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Eye className="w-4 h-4 text-[#027FFF]" />
              <span className="font-semibold">Examiner Overview Tip:</span>
              <span className="text-slate-500 hidden sm:inline">Write 1 clear overview sentence identifying the dominant macro-trend.</span>
            </div>
            {onToggleKeyFeatures && (
              <button
                onClick={onToggleKeyFeatures}
                className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-[#027FFF] font-bold text-[11px] hover:bg-blue-50 transition-colors shrink-0"
              >
                {showKeyFeatures ? 'Hide Checklist' : 'Show Checklist'}
              </button>
            )}
          </div>
        </div>
      )}

      {activeTab === 'features' && (
        <div className="space-y-3 p-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Examiner Task Achievement Checklist (Key Features to Report):</span>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {promptData.keyFeatures.map((feat, i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="leading-relaxed">{feat}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'data' && (
        <div className="space-y-3 p-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-1">
            <Maximize2 className="w-4 h-4 text-purple-600" />
            <span>Band 8.5+ Recommended Collocations for this Visual:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {promptData.vocabularyTips.map((tip, i) => (
              <span 
                key={i} 
                className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 font-bold text-xs"
              >
                ✦ {tip}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
