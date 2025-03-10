import { Progress, ProgressProps } from "antd";
import { useEffect, useRef, useState } from "react";
import _ from "lodash";

const twoColors: ProgressProps["strokeColor"] = {
  //   "0%": "#1677ff",
  //   "100%": "#85b8ff",
  "0%": "#85b8ff",
  "100%": "#c8dfff",
};

const EarnProgressOverview = () => {
  const [steps, setSteps] = useState(50);
  const [percent, setPercent] = useState(50);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);

  const calculateSteps = () => {
    if (containerRef.current) {
      // Get the container width
      const containerWidth = containerRef.current.clientWidth - 32; // minus 8px padding

      // Calculate how many steps would fit nicely
      // This assumes each step (including gap) takes about 10px
      const calculatedSteps = Math.max(5, Math.floor(containerWidth / 4));

      console.log(
        `Container width: ${containerWidth}px, calculatedSteps: ${calculatedSteps}`
      );

      setSteps(calculatedSteps);
    }
  };

  // Create a debounced version of calculateSteps
  const debouncedCalculateSteps = useRef(
    _.debounce(calculateSteps, 250)
  ).current;

  useEffect(() => {
    // Initial calculation after a short delay to ensure container has rendered
    setTimeout(calculateSteps, 0);

    // Recalculate on window resize with debounce
    window.addEventListener("resize", debouncedCalculateSteps);

    // Simple animation with setInterval
    let increasing = true;
    const intervalTime = (10 * 1000) / 40; // 40 steps for full 10-second cycle

    // Using window.setInterval to avoid TypeScript NodeJS.Timeout issues
    animationRef.current = window.setInterval(() => {
      setPercent((prevPercent) => {
        if (prevPercent >= 70) increasing = false;
        if (prevPercent <= 50) increasing = true;

        return increasing ? prevPercent + 0.5 : 50;
      });
    }, intervalTime);

    // Cleanup
    return () => {
      window.removeEventListener("resize", debouncedCalculateSteps);
      debouncedCalculateSteps.cancel();
      if (animationRef.current !== null) {
        window.clearInterval(animationRef.current);
      }
    };
  }, [debouncedCalculateSteps]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        padding: "4px 10px 4px 10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Progress
        percent={percent}
        steps={steps}
        size={[1, 20]}
        showInfo={false}
        percentPosition={{ align: "center", type: "outer" }}
        strokeColor={twoColors}
        trailColor="#c8dfff"
      />
      <span
        style={{
          fontSize: "0.7rem",
          color: "#1677ff",
          marginTop: "6px",
        }}
      >
        $5.82 USDT Earning 1% Weekly
      </span>
    </div>
  );
};

export default EarnProgressOverview;
