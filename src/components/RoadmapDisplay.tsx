import { motion } from "motion/react";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { RoadmapStep } from "../lib/gemini";

interface RoadmapDisplayProps {
  steps: RoadmapStep[];
}

export function RoadmapDisplay({ steps }: RoadmapDisplayProps) {
  return (
    <div className="space-y-6">
      <div className="relative">
        {/* Progress Bar Container */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-zinc-100" />
        
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-4 relative mb-8 last:mb-0"
          >
            <div className={`z-10 w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm ${
              step.status === 'completed' ? 'bg-green-100 text-green-600' : 
              step.status === 'current' ? 'bg-blue-100 text-blue-600' : 'bg-zinc-100 text-zinc-400'
            }`}>
              {step.status === 'completed' && <CheckCircle2 size={20} />}
              {step.status === 'current' && <Clock size={20} />}
              {step.status === 'pending' && <Circle size={20} />}
            </div>
            
            <div className="flex-1 pt-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`font-semibold ${step.status === 'pending' ? 'text-zinc-500' : 'text-zinc-900'}`}>
                  {step.title}
                </h4>
                <span className="text-[10px] font-medium px-2 py-0.5 bg-zinc-100 text-zinc-500 rounded-full uppercase tracking-wider">
                  {step.deadline}
                </span>
              </div>
              <p className={`text-sm leading-relaxed ${step.status === 'pending' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
