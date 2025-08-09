// Helper function to track user events
export const trackUserSignup = async (icpPrincipal: string = "") => {
  const isProd = checkIsProdByURL();
  if (!isProd) return;

  const unixTimestamp = Math.floor(Date.now() / 1000);
  // const id = icpPrincipal || uuidv4(); // Generating a new UUID

  // first track to Google Analytics
  if ((window as any).gtag) {
    (window as any).gtag("event", "user_signup", {
      event_category: "engagement",
      event_label: "signup",
      icp_principal: icpPrincipal, // Custom field for ICP Principal
      unix_timestamp: unixTimestamp,
      // Other data can be added here if needed
    });
  }
};

export function checkIsProdByURL(): boolean {
  if (typeof window !== "undefined" && window.location) {
    return (
      window.location.hostname === "officex.app" ||
      window.location.hostname === "officex.app"
    );
  }
  console.error("Window or location is undefined.");
  return false;
}
