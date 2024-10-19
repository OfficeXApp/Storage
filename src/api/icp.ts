

export const formatCycles = (cycles: bigint) => {
    if (cycles === null) return "";

    const trillion = BigInt(1000000000000);
    const billion = BigInt(1000000000);
    const million = BigInt(1000000);
    const thousand = BigInt(1000);

    if (cycles >= trillion) {
      return (Number(cycles / (trillion / BigInt(100))) / 100).toFixed(2) + "T";
    } else if (cycles >= billion) {
      return (Number(cycles / (billion / BigInt(100))) / 100).toFixed(2) + "B";
    } else if (cycles >= million) {
      return (Number(cycles / (million / BigInt(100))) / 100).toFixed(2) + "M";
    } else if (cycles >= thousand) {
      return (Number(cycles / (thousand / BigInt(100))) / 100).toFixed(2) + "K";
    } else {
      return cycles.toLocaleString();
    }
  };