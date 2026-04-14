import { motion } from "framer-motion";
import { Lightbulb, ArrowRight, Stethoscope, MessageSquare, ChevronRight } from "lucide-react";
import type { RecommendedAction } from "@/services/labAnalyzer";

interface AdviceSectionProps {
  practicalAdvice: string[];
  recommendedActions: RecommendedAction[];
  whenToConsultDoctor: string;
  talkingPoints: string[];
}

const AdviceSection = ({ practicalAdvice, recommendedActions, whenToConsultDoctor, talkingPoints }: AdviceSectionProps) => {
  return (
    <div className="space-y-4">
      {/* Practical Advice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="panel-card p-6 gradient-border"
      >
        <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-status-attention/10 flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-status-attention" />
          </div>
          Practical Advice
        </h3>
        <ul className="space-y-3">
          {practicalAdvice.map((advice, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              className="flex items-start gap-3 group"
            >
              <ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
              <span className="text-sm text-foreground/80 leading-relaxed">{advice}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Recommended Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel-card p-6 gradient-border"
      >
        <h3 className="font-display text-lg font-semibold text-foreground mb-4">Recommended Actions</h3>
        <div className="space-y-4">
          {recommendedActions.map((action, i) => (
            <motion.div
              key={action.step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.12 }}
              whileHover={{ x: 4, transition: { duration: 0.15 } }}
              className="flex gap-4 group cursor-default"
            >
              <motion.div
                className="flex-shrink-0 w-9 h-9 rounded-xl hero-gradient flex items-center justify-center shadow-hero"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <span className="text-sm font-bold text-primary-foreground">{action.step}</span>
              </motion.div>
              <div>
                <h4 className="font-display font-semibold text-sm text-foreground">{action.title}</h4>
                <p className="text-sm text-foreground/70 mt-1 leading-relaxed">{action.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* When to Consult Doctor */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
        className="panel-card p-6 border-status-critical/20 bg-status-critical/5 relative overflow-hidden"
      >
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-status-critical/10 rounded-full blur-2xl" />
        <h3 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2 relative z-10">
          <div className="w-8 h-8 rounded-lg bg-status-critical/10 flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-status-critical" />
          </div>
          When to Consult Doctor
        </h3>
        <p className="text-sm text-foreground/80 leading-relaxed relative z-10">{whenToConsultDoctor}</p>
      </motion.div>

      {/* Talking Points */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="panel-card p-6 gradient-border"
      >
        <h3 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-primary" />
          </div>
          What to Discuss with Your Doctor
        </h3>
        <ol className="space-y-2.5">
          {talkingPoints.map((point, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.08 }}
              className="flex items-start gap-3 group"
            >
              <span className="text-xs font-bold text-primary-foreground bg-primary/80 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                {i + 1}
              </span>
              <span className="text-sm text-foreground/80 leading-relaxed">{point}</span>
            </motion.li>
          ))}
        </ol>
      </motion.div>
    </div>
  );
};

export default AdviceSection;
