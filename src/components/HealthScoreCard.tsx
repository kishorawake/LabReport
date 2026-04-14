import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { CheckCircle, AlertTriangle, XCircle, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface HealthScoreCardProps {
  score: number;
  grade: string;
  optimal: number;
  attention: number;
  critical: number;
}

const AnimatedCounter = ({ target, delay = 0 }: { target: number; delay?: number }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 1200;
      const start = performance.now();
      const step = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(eased * target));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(timer);
  }, [target, delay]);
  return <>{display}</>;
};

const HealthScoreCard = ({ score, grade, optimal, attention, critical }: HealthScoreCardProps) => {
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const scoreColor =
    score >= 80 ? "hsl(var(--status-normal))" :
    score >= 60 ? "hsl(var(--status-attention))" :
    "hsl(var(--status-critical))";

  const gradeColor =
    score >= 80 ? "text-status-normal" :
    score >= 60 ? "text-status-attention" :
    "text-status-critical";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="panel-card p-6 relative overflow-hidden gradient-border"
    >
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20" style={{ backgroundColor: scoreColor }} />

      <div className="flex items-center gap-2 mb-4 relative z-10">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h3 className="font-display text-lg font-semibold text-foreground">Health Score Overview</h3>
      </div>

      <div className="flex items-center gap-8 relative z-10">
        <div className="relative flex-shrink-0">
          <svg width="132" height="132" viewBox="0 0 132 132">
            {/* Background track */}
            <circle cx="66" cy="66" r="54" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
            {/* Animated score arc */}
            <motion.circle
              cx="66" cy="66" r="54"
              fill="none"
              stroke={scoreColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.8, ease: [0.33, 1, 0.68, 1], delay: 0.3 }}
              transform="rotate(-90 66 66)"
              style={{ filter: `drop-shadow(0 0 8px ${scoreColor})` }}
            />
            {/* Needle tick at current position */}
            <motion.circle
              cx="66"
              cy="12"
              r="4"
              fill={scoreColor}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              transform={`rotate(${(score / 100) * 360} 66 66)`}
              style={{ filter: `drop-shadow(0 0 6px ${scoreColor})` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-display font-bold" style={{ color: scoreColor }}>
              <AnimatedCounter target={score} delay={300} />
            </span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Score</span>
            <motion.span
              className={`text-lg font-display font-bold ${gradeColor}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5, type: "spring" }}
            >
              {grade}
            </motion.span>
          </div>
        </div>

        <div className="flex flex-col gap-3 flex-1">
          {[
            { icon: CheckCircle, color: "text-status-normal", bg: "bg-status-normal/10", count: optimal, label: "Optimal" },
            { icon: AlertTriangle, color: "text-status-attention", bg: "bg-status-attention/10", count: attention, label: "Attention" },
            { icon: XCircle, color: "text-status-critical", bg: "bg-status-critical/10", count: critical, label: "Critical" },
          ].map(({ icon: Icon, color, bg, count, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.15 }}
              whileHover={{ x: 4, transition: { duration: 0.15 } }}
              className={`flex items-center gap-2.5 p-2 rounded-lg ${bg} group cursor-default`}
            >
              <Icon className={`w-4 h-4 ${color} group-hover:scale-110 transition-transform`} />
              <span className="text-sm text-foreground font-medium">
                <AnimatedCounter target={count} delay={600 + i * 150} />
              </span>
              <span className="text-xs text-muted-foreground">{label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default HealthScoreCard;
